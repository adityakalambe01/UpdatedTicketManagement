import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { WAITING_LIST_STATUS } from "./constants";
import { internal } from "./_generated/api";

export const markPurchaseComplete = mutation({
  args: {
    eventId: v.id("events"),
    userId: v.string(),
  },
  handler: async (ctx, { eventId, userId }) => {
    // Find and update all waiting list entries for this user and event
    const entries = await ctx.db
      .query("waitingList")
      .withIndex("by_user_event", (q) => q.eq("userId", userId).eq("eventId", eventId))
      .filter((q) => q.or(
        q.eq(q.field("status"), WAITING_LIST_STATUS.OFFERED),
        q.eq(q.field("status"), WAITING_LIST_STATUS.WAITING)
      ))
      .collect();

    // Mark all entries as purchased
    for (const entry of entries) {
      await ctx.db.patch(entry._id, {
        status: WAITING_LIST_STATUS.PURCHASED,
      });
    }

    // Process queue to offer tickets to next people
    if (entries.length > 0) {
      await ctx.runMutation(internal.waitingList.processQueue, { eventId });
    }

    return { updated: entries.length };
  },
});