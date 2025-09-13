"use server";

import { razorpay } from "@/lib/razorpay";
import { getConvexClient } from "@/lib/convex";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { auth } from "@clerk/nextjs/server";

export async function createRazorpayOrder({
  eventId,
}: {
  eventId: Id<"events">;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const convex = getConvexClient();
  const event = await convex.query(api.events.getById, { eventId });
  if (!event) throw new Error("Event not found");

  const queuePosition = await convex.query(api.waitingList.getQueuePosition, {
    eventId,
    userId,
  });

  if (!queuePosition || queuePosition.status !== "offered") {
    throw new Error("No valid ticket offer found");
  }

  const order = await razorpay.orders.create({
    amount: Math.round(event.price * 100),
    currency: "INR",
    receipt: `ticket_${eventId}_${userId}`,
    notes: {
      eventId,
      userId,
      waitingListId: queuePosition._id,
    },
  });

  return { orderId: order.id, amount: order.amount, currency: order.currency };
}