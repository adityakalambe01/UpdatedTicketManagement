import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createDefaultPasses = mutation({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    // If exist passes
    const existingPasses = await ctx.db
      .query("passes")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .collect();

    if (existingPasses.length > 0) {
      return { message: "Passes already exist for this event" };
    }

    // Passes Type Default
    const passes = [
      {
        eventId,
        name: "Stag Female",
        description: "Standard entry to the event with basic amenities",
        price: 599,
        totalQuantity: 300,
        soldQuantity: 0,
        benefits: [
        "Full event access",
        "Discounted price",
        "Access to main venue",
        "All Day Early Bird",
      ]
      },
      {
        eventId,
        name: "Couple Pass",
        description: "Premium experience with exclusive perks and priority access",
        price: 799,
        totalQuantity: 1000,
        soldQuantity: 0,
        benefits:[
        "Event entry",
        "Discounted price",
        "Access to main venue",
        "Unlimited Fun",
      ]
      },
      {
        eventId,
        name: "Season Pass Couple",
        description: "Limited time offer with discounted pricing",
        price: 3999,
        totalQuantity: 1000,
        soldQuantity: 0,
        benefits: [
        "Event entry",
        "Access to main venue",
        "Valid For All Days",
        "All Day Early Bird",
        "Only Couple Entry",
      ]
      },
      {
        eventId,
        name: "Stag Male",
        description: "Entire event for a limited time",
        price: 999,
        totalQuantity: 300,
        soldQuantity: 0,
        benefits: [
          "Priority entry",
          "Main Venue Access",
          "All Day Early Bird",
        ]
      }
    ];

    const createdPasses = [];
    for (const pass of passes) {
      const passId = await ctx.db.insert("passes", pass);
      createdPasses.push(passId);
    }

    return { 
      message: "Default passes created successfully",
      passIds: createdPasses
    };
  },
});