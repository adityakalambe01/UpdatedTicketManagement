"use server";

import { razorpay } from "@/lib/razorpay";
import { auth } from "@clerk/nextjs/server";

export async function createSimpleRazorpayOrder() {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const order = await razorpay.orders.create({
    amount: 75000, // ₹750 in paise
    currency: "INR",
    receipt: `test_${userId}_${Date.now()}`,
  });

  return { orderId: order.id, amount: order.amount, currency: order.currency };
}