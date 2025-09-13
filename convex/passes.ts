import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createPass = mutation({
  args: {
    eventId: v.id("events"),
    name: v.string(),
    description: v.string(),
    price: v.number(),
    totalQuantity: v.number(),
    benefits: v.array(v.string()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("passes", {
      ...args,
      soldQuantity: 0,
    });
  },
});

export const getEventPasses = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    return await ctx.db
      .query("passes")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .collect();
  },
});

export const updatePass = mutation({
  args: {
    passId: v.id("passes"),
    name: v.string(),
    description: v.string(),
    price: v.number(),
    totalQuantity: v.number(),
    benefits: v.array(v.string()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, { passId, ...updates }) => {
    await ctx.db.patch(passId, updates);
  },
});

export const deletePass = mutation({
  args: { passId: v.id("passes") },
  handler: async (ctx, { passId }) => {
    await ctx.db.delete(passId);
  },
});
export const getPassById = query({
  args: { passId: v.id("passes") },
  handler: async (ctx, { passId }) => {
    return await ctx.db.get(passId);
  },
});

export const resetPassSoldQuantity = mutation({
  args: { passId: v.id("passes") },
  handler: async (ctx, { passId }) => {
    await ctx.db.patch(passId, {
      soldQuantity: 0,
    });
    return { success: true };
  },
});

export const updatePassSoldQuantity = mutation({
  args: { 
    passId: v.id("passes"),
    soldQuantity: v.number()
  },
  handler: async (ctx, { passId, soldQuantity }) => {
    await ctx.db.patch(passId, {
      soldQuantity,
    });
    return { success: true };
  },
});