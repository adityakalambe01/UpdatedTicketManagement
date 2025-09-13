import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getConvexClient } from "@/lib/convex";
import { api } from "../../../../../convex/_generated/api";

export async function POST(req: NextRequest) {
  console.log("=== RAZORPAY WEBHOOK RECEIVED ===");
  
  try {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    
    console.log("Signature present:", !!signature);
    console.log("Body length:", body.length);
    
    if (!signature) {
      console.log("❌ No signature provided");
      return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.log("❌ Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);
    console.log("Event type:", event.event);
    
    const convex = getConvexClient();

    if (event.event === "payment.captured") {
      console.log("💰 Processing payment.captured event");
      const { notes } = event.payload.payment.entity;
      console.log("Payment notes received:", notes);
      
      try {
        const result = await convex.mutation(api.tickets.issueAfterPayment, {
          eventId: notes.eventId,
          userId: notes.userId,
          paymentIntentId: event.payload.payment.entity.id,
          amount: event.payload.payment.entity.amount,
          quantity: notes.quantity ? parseInt(notes.quantity) : 1,
          passId: notes.passId || undefined,
          selectedDate: notes.selectedDate || undefined,
        });
        
        console.log("✅ Ticket creation successful, result:", result);
      } catch (mutationError) {
        console.error("❌ Error calling issueAfterPayment mutation:", mutationError);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
