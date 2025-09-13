"use server";

export async function testRazorpay() {
  try {
    // Check if environment variables exist
    if (!process.env.RAZORPAY_KEY_ID) {
      throw new Error("RAZORPAY_KEY_ID is missing");
    }
    
    if (!process.env.RAZORPAY_KEY_SECRET) {
      throw new Error("RAZORPAY_KEY_SECRET is missing");
    }

    // Try to import and create Razorpay instance
    const Razorpay = require("razorpay");
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // Test order creation
    const order = await razorpay.orders.create({
      amount: 100, // 1 rupee in paise
      currency: "INR",
      receipt: "test_receipt",
    });

    return { success: true, orderId: order.id };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error",
      env: {
        keyId: process.env.RAZORPAY_KEY_ID ? "Present" : "Missing",
        keySecret: process.env.RAZORPAY_KEY_SECRET ? "Present" : "Missing",
      }
    };
  }
}