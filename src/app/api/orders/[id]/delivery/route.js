import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/db";
import Order from "@/models/Order";
import { getSession } from "@/lib/auth";

export async function PUT(request, context) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await context.params;
    const cleanedId = String(params?.id || "").trim();

    let payload = {};
    try {
      payload = await request.json();
    } catch (_) {
      payload = {};
    }

    await connectToDatabase();

    let order;
    try {
      order = await Order.findById(cleanedId);
    } catch (e) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const allowedStatuses = ["pending", "in_progress", "delivered"];
    const requestedStatus = payload.deliveryStatus;

    if (session.role === "admin") {
      if (!requestedStatus || !allowedStatuses.includes(requestedStatus)) {
        return NextResponse.json(
          { error: "Invalid delivery status" },
          { status: 400 }
        );
      }
      order.deliveryStatus = requestedStatus;
      await order.save();
    } else {
      // Non-admin users can only mark their own orders as delivered
      if (order.user.toString() !== session.id) {
        return NextResponse.json(
          { error: "Unauthorized to modify this order" },
          { status: 403 }
        );
      }
      if (order.deliveryStatus === "delivered") {
        return NextResponse.json(
          { message: "Order is already delivered" },
          { status: 200 }
        );
      }
      order.deliveryStatus = "delivered";
      await order.save();
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Update delivery status error:", error);
    return NextResponse.json(
      { error: "Failed to update delivery status" },
      { status: 500 }
    );
  }
}
