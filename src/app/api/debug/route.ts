import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    razorpayKeyId: process.env.RAZORPAY_KEY_ID ? "Set" : "Missing",
    razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET ? "Set" : "Missing",
    publicRazorpayKey: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ? "Set" : "Missing",
    convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL ? "Set" : "Missing",
  });
}