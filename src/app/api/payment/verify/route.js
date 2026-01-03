import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { generateEsewaSignature } from "@/lib/esewa";

export async function POST(request) {
  try {
    const { data } = await request.json();

    // Decode base64 data
    const decodedData = JSON.parse(
      Buffer.from(data, "base64").toString("utf-8")
    );

    console.log("Esewa Response:", decodedData);

    if (decodedData.status !== "COMPLETE") {
      return NextResponse.json(
        { error: "Payment not complete" },
        { status: 400 }
      );
    }

    const {
      transaction_code,
      total_amount,
      transaction_uuid,
      signature,
      signed_field_names,
    } = decodedData;

    // Verify Signature
    const secretKey = process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q";

    // The signature string format depends on signed_field_names
    // Usually "total_amount,transaction_uuid,product_code"
    const message = signed_field_names
      .split(",")
      .map((field) => `${field}=${decodedData[field]}`)
      .join(",");

    const calculatedSignature = generateEsewaSignature(secretKey, message);

    if (calculatedSignature !== signature) {
      console.error("Signature mismatch", { calculatedSignature, signature });
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    await connectToDatabase();

    // Update Order
    const order = await Order.findById(transaction_uuid);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.totalAmount !== parseFloat(total_amount.replace(/,/g, ""))) {
      // Note: total_amount might be string like "1,000.00"
      return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
    }

    order.status = "paid";
    order.deliveryStatus = "in_progress";
    order.esewaRefId = transaction_code;
    order.paymentDetails = decodedData;
    await order.save();

    // Reduce stock
    for (const item of order.products) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    return NextResponse.json({ success: true, orderId: order._id });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
