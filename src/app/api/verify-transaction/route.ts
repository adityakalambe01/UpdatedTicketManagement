import { NextRequest, NextResponse } from "next/server";
import { StandardCheckoutClient, Env } from "pg-sdk-node";

export async function POST(req: NextRequest) {
  try {
    const { transactionId } = await req.json();
    if (!transactionId) {
      return NextResponse.json({ error: "Missing transactionId" }, { status: 400 });
    }

    // Use env variables for credentials
    const clientId = process.env.PHONEPE_CLIENT_ID;
    const clientSecret = process.env.PHONEPE_CLIENT_SECRET;
    const clientVersion = process.env.PHONEPE_CLIENT_VERSION;
    const env = process.env.PHONEPE_ENV === "PRODUCTION" ? Env.PRODUCTION : Env.SANDBOX;

    const client = StandardCheckoutClient.getInstance(clientId, clientSecret, clientVersion, env);
    const response = await client.getOrderStatus(transactionId);

    // PhonePe SDK returns state: COMPLETED for success
    if (response.state === "COMPLETED") {
      return NextResponse.json({ verified: true });
    } else {
      return NextResponse.json({ verified: false, state: response.state }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Verification failed", details: error?.message }, { status: 500 });
  }
}

