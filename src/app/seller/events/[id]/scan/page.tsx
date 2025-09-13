"use client";

import { use } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import TicketScanner from "@/components/TicketScanner";
import { redirect } from "next/navigation";

export default function ScanTicketsPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { user } = useUser();
  const { id } = use(params);
  const eventId = id as Id<"events">;
  
  const event = useQuery(api.events.getById, { eventId });

  if (!user) {
    redirect("/");
  }

  if (event && event.userId !== user.id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
          <p className="text-gray-600">You can only scan tickets for your own events.</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <TicketScanner eventId={eventId} />
    </div>
  );
}