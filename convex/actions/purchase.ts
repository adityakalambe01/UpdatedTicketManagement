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
		const subject = `🎟️ Your Ticket for ${event.name} is Confirmed!`;

		const htmlContent = `
  <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
    <h1 style="color: #2c3e50;">Hello ${user.name},</h1>
    <p>✅ Thank you for your purchase! Your ticket has been successfully confirmed.</p>

    <h2 style="margin-top: 20px; color: #2c3e50;">🎉 Event Details</h2>
    <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Event</strong></td>
        <td style="padding: 8px; border: 1px solid #ddd;">${event.name}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Location</strong></td>
        <td style="padding: 8px; border: 1px solid #ddd;">${event.location}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Date</strong></td>
        <td style="padding: 8px; border: 1px solid #ddd;">${new Date(event.eventDate).toLocaleDateString()}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Price</strong></td>
        <td style="padding: 8px; border: 1px solid #ddd;">₹ ${event.price.toFixed(2)}</td>
      </tr>
    </table>

    <p style="margin-top: 20px;">📅 Don’t forget to mark your calendar — we can’t wait to see you there!</p>

    <p style="margin-top: 30px;">Warm regards,<br>
    <strong>The Ticketr Team</strong></p>

    <hr style="margin-top: 40px; border: none; border-top: 1px solid #eee;">
    <p style="font-size: 12px; color: #777;">
      This email is for ${user.email}. Please do not reply directly to this message.
    </p>
  </div>
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
