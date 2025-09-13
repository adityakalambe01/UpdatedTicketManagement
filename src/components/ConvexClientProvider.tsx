"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

// Initialize the client with error handling
const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL || "https://ceaseless-cat-661.convex.cloud");

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
