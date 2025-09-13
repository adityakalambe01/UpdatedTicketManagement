import { NextRequest, NextResponse } from "next/server";
import { StandardCheckoutClient, Env, MetaInfo, StandardCheckoutPayRequest } from "pg-sdk-node";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, eventId, userId, waitingListId, quantity = 1, passId, couponCode, selectedDate } = body;
    if (!amount || !eventId || !userId) {
      return NextResponse.json({
        error: "Missing required fields",
        details: { amount, eventId, userId }
      }, { status: 400 });
    }

    // Get PhonePe credentials from env
    const clientId = process.env.PHONEPE_CLIENT_ID;
    const clientSecret = process.env.PHONEPE_CLIENT_SECRET;
    const clientVersion = process.env.PHONEPE_CLIENT_VERSION || "1";
    const env = process.env.PHONEPE_ENV === "PROD" ? Env.PRODUCTION : Env.SANDBOX;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    if (!clientId || !clientSecret) {
      return NextResponse.json({
        error: "Missing PhonePe credentials",
        details: { clientId, clientSecret }
      }, { status: 500 });
    }

    // Initialize PhonePe SDK client
    const client = StandardCheckoutClient.getInstance(clientId, clientSecret, clientVersion, env);

    // Generate unique merchantOrderId (must be <= 63 chars)
    // Use a hash or short UUID if needed
    let merchantOrderId = randomUUID();
    if (merchantOrderId.length > 63) {
      // Use a hash to ensure uniqueness and length
      const base = `txn_${eventId}_${userId}`;
      const hash = Buffer.from(Date.now().toString()).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
      merchantOrderId = `${base}_${hash}`.slice(0, 63);
    }
    const redirectUrl = `${baseUrl}/payment/success?transactionId=${merchantOrderId}`;

    // Build metaInfo (optional, can add more fields if needed)
    const metaInfo = MetaInfo.builder()
      .udf1(String(eventId))
      .udf2(String(userId))
      .udf3(String(waitingListId || ""))
      .udf4(String(passId || ""))
      .udf5(String(couponCode || ""))
      .build();

    // Build the pay request
    const request = StandardCheckoutPayRequest.builder()
      .merchantOrderId(merchantOrderId)
      .amount(Math.round(amount * 100)) // paise
      .redirectUrl(redirectUrl)
      .metaInfo(metaInfo)
      .build();

    // Call PhonePe SDK to create order and get redirect URL
    const response = await client.pay(request);

    if (!response || !response.redirectUrl) {
      return NextResponse.json({
        error: "PhonePe order creation failed",
        details: response
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      merchantOrderId,
      amount: Math.round(amount * 100),
      currency: "INR",
      redirectUrl: response.redirectUrl,
      phonepeResponse: response
    });
  } catch (error) {
    return NextResponse.json({
      error: "Order creation failed",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}