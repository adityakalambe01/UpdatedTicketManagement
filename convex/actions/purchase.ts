"use node";
import { action } from "../_generated/server";
import { v } from "convex/values";
import { internal, api } from "../_generated/api";
// import { sendTicketEmailAction } from "../actions/email"; // Remove direct import

export const completePurchaseAndSendEmail = action({
  args: {
    eventId: v.id("events"),
    userId: v.string(),
  },
  handler: async (ctx, { eventId, userId }) => {
    console.log("completePurchaseAndSendEmail action triggered for userId:", userId, "eventId:", eventId);
    // Mark purchase complete (this will still be a mutation)
    await ctx.runMutation(api.purchaseComplete.markPurchaseComplete, { eventId, userId });

    // Fetch user and event details to send email
    const user = await ctx.runQuery(api.users.getUserById, { userId });
    const event = await ctx.runQuery(api.events.getById, { eventId });

    if (user && event && user.email) {
      const subject = `Your Ticket for ${event.name}`;
      const htmlContent = `
        <h1>Hello ${user.name},</h1>
        <p>Thank you for your purchase!</p>
        <p>Here are your ticket details for ${event.name}:</p>
        <ul>
          <li>Event: ${event.name}</li>
          <li>Location: ${event.location}</li>
          <li>Date: ${new Date(event.eventDate).toLocaleDateString()}</li>
          <li>Price: $${event.price.toFixed(2)}</li>
        </ul>
        <p>We look forward to seeing you there!</p>
        <p>Best regards,</p>
        <p>The Ticketr Team</p>
      `;

      await ctx.runAction(internal['actions/email'].sendTicketEmailAction, { // Use explicit path
        to: user.email,
        subject,
        htmlContent,
      });
    }
    return { success: true };
  },
});
