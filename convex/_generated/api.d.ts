/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as actions_email from "../actions/email.js";
import type * as actions_purchase from "../actions/purchase.js";
import type * as constants from "../constants.js";
import type * as coupons from "../coupons.js";
import type * as events from "../events.js";
import type * as passes from "../passes.js";
import type * as purchaseComplete from "../purchaseComplete.js";
import type * as seedPasses from "../seedPasses.js";
import type * as storage from "../storage.js";
import type * as tickets from "../tickets.js";
import type * as upi from "../upi.js";
import type * as users from "../users.js";
import type * as waitingList from "../waitingList.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "actions/email": typeof actions_email;
  "actions/purchase": typeof actions_purchase;
  constants: typeof constants;
  coupons: typeof coupons;
  events: typeof events;
  passes: typeof passes;
  purchaseComplete: typeof purchaseComplete;
  seedPasses: typeof seedPasses;
  storage: typeof storage;
  tickets: typeof tickets;
  upi: typeof upi;
  users: typeof users;
  waitingList: typeof waitingList;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
