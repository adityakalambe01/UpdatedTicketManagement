import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL || "");

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, userId, couponId, eventId } = body;
    
    if (!code || !userId) {
      return NextResponse.json({ 
        error: "Missing required fields", 
      }, { status: 400 });
    }
    
    console.log("Marking coupon as used:", { code, userId, couponId, eventId });

    // Call the Convex function to mark the coupon as used
    await convex.mutation(api.coupons.incrementCouponUsage, { 
      code, 
      userId,
      couponId,
      eventId
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking coupon as used:", error);
    return NextResponse.json({ 
      error: "Failed to mark coupon as used", 
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}