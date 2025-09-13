import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createUpiPayment = mutation({
  args: {
    uid: v.string(),
    eventId: v.id("events"),
    userId: v.string(),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const newUpiPaymentId = await ctx.db.insert("upi_payments", {
      uid: args.uid,
      eventId: args.eventId,
      userId: args.userId,
      amount: args.amount,
      timestamp: Date.now(),
    });
    return newUpiPaymentId;
  },
});
