import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/db";
import Order from "@/models/Order";
import { getSession } from "@/lib/auth";
import { generateEsewaSignature } from "@/lib/esewa";

export async function GET(request) {
  try {
    const session = await getSession(request);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .populate("user", "name email")
      .populate("products.product", "name");

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Fetch all orders error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    console.log("Starting order creation...");

    const session = await getSession(request);
    console.log("Session object:", JSON.stringify(session, null, 2));

    if (!session) {
      console.log("No session found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if session.id exists before validating
    if (!session.id) {
      console.error("Session missing 'id' property");
      return NextResponse.json(
        { error: "Invalid session structure" },
        { status: 401 }
      );
    }

    const userId = session.id.toString();

    console.log("Session ID type:", typeof session.id);
    console.log("Session ID value:", session.id);
    console.log("Converted UserID:", userId);
    console.log("Is valid ObjectId?", mongoose.Types.ObjectId.isValid(userId));

    await connectToDatabase();
    console.log("Database connected");

    const body = await request.json();
    console.log("Request body:", body);

    const { items, totalAmount } = body;

    if (!items || items.length === 0) {
      console.log("Cart is empty");
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    console.log("Creating order in DB...");

    // Validate payload
    // Note: mongoose.Types.ObjectId.isValid() returns true for any 12-byte string or 24-hex-char string
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error(`Invalid User ID detected: ${userId}`);
      throw new Error(`Invalid user ID: ${userId}`);
    }

    const productsPayload = items.map((item) => {
      if (!item._id || !mongoose.Types.ObjectId.isValid(item._id)) {
        throw new Error(`Invalid product ID for item: ${item.name}`);
      }
      return {
        product: item._id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      };
    });

    if (isNaN(totalAmount)) {
      throw new Error("Invalid total amount");
    }

    const numericTotalAmount = Number(totalAmount);

    const order = await Order.create({
      user: userId,
      products: productsPayload,
      totalAmount: numericTotalAmount,
      status: "pending",
    });
    console.log("Order created:", order._id);

    // Esewa Configuration
    const merchantId = process.env.ESEWA_MERCHANT_ID || "EPAYTEST";
    const secretKey = process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q";

    const transactionUuid = order._id.toString(); // or a unique string
    const productCode = merchantId;
    const totalAmountStr = numericTotalAmount.toString();

    // Signature string: "total_amount,transaction_uuid,product_code"
    const signatureString = `total_amount=${totalAmountStr},transaction_uuid=${transactionUuid},product_code=${productCode}`;
    const signature = generateEsewaSignature(secretKey, signatureString);

    const paymentConfig = {
      amount: totalAmountStr,
      tax_amount: "0",
      total_amount: totalAmountStr,
      transaction_uuid: transactionUuid,
      product_code: productCode,
      product_service_charge: "0",
      product_delivery_charge: "0",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
      failure_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/failure`,
      signed_field_names: "total_amount,transaction_uuid,product_code",
      signature: signature,
    };

    return NextResponse.json({
      orderId: order._id,
      paymentConfig,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to create order",
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}
