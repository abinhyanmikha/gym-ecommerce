import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Order from '@/models/Order';
import { getSession } from '@/lib/auth';
import { generateEsewaSignature } from '@/lib/esewa';

export async function POST(request) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { items, totalAmount } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    const order = await Order.create({
      user: session.id,
      products: items.map(item => ({
        product: item._id,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      totalAmount,
      status: 'pending'
    });

    // Esewa Configuration
    const merchantId = process.env.ESEWA_MERCHANT_ID || 'EPAYTEST';
    // For test environment, the secret key is often fixed or provided in docs
    // In production, this should be in env
    const secretKey = '8gBm/:&EnhH.1/q'; 
    
    const transactionUuid = order._id.toString(); // or a unique string
    const productCode = merchantId;
    const totalAmountStr = totalAmount.toString();
    
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
      paymentConfig 
    });

  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
