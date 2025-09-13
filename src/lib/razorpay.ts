import Razorpay from "razorpay";

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error("Missing Razorpay credentials. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env.local");
  throw new Error("Missing Razorpay credentials");
}

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});