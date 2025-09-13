import { NextRequest, NextResponse } from "next/server";
import { getConvexClient } from "@/lib/convex";
import { api } from "../../../../convex/_generated/api";

export async function POST(req: NextRequest) {
  console.log("=== MANUAL TICKET CREATION ===");
  
  try {
    const body = await req.json();
    console.log("Request body:", body);
    
    const { eventId, userId, paymentId, quantity = 1, amount = 100, passId } = body;
    
    console.log("Parsed data:", { eventId, userId, paymentId, quantity, amount });
    
    if (!eventId || !userId || !paymentId) {
      console.log("Missing fields - eventId:", !!eventId, "userId:", !!userId, "paymentId:", !!paymentId);
      return NextResponse.json({ 
        error: "Missing required fields",
        received: { eventId: !!eventId, userId: !!userId, paymentId: !!paymentId }
      }, { status: 400 });
    }
    
    console.log("Getting Convex client...");
    const convex = getConvexClient();
    
    console.log("Calling issueAfterPayment mutation...");
    const result = await convex.mutation(api.tickets.issueAfterPayment, {
      eventId,
      userId,
      paymentIntentId: paymentId,
      amount,
      quantity,
      passId: body.passId || undefined,
    });
    
    console.log("Ticket created successfully:", result);
    
    // Ensure user is removed from queue and email is sent
    console.log("Completing purchase and sending email...");
    await convex.action(api.actions.purchase.completePurchaseAndSendEmail, {
      eventId,
      userId,
    });
    
    console.log("Purchase completed and email sent");
    
    return NextResponse.json({ 
      success: true, 
      ticketId: result,
      message: "Ticket created successfully"
    });
  } catch (error) {
    console.error("Manual ticket creation error:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack");
    
    return NextResponse.json({ 
      error: "Failed to create ticket", 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}