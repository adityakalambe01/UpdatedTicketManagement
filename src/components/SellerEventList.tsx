"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import EventCard from "./EventCard";
import { CalendarDays, Ticket } from "lucide-react";

export default function SellerEventList() {
  const { user } = useUser();
  const events = useQuery(api.events.getByUserId, {
    userId: user?.id ?? "user_31kLpLFaWBAJIzwLqFFax4BZhUK",
  });

  if (!events) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const upcomingEvents = events
    .filter((event) => event.eventDate > Date.now())
    .sort((a, b) => a.eventDate - b.eventDate);

  const pastEvents = events
    .filter((event) => event.eventDate <= Date.now())
    .sort((a, b) => b.eventDate - a.eventDate);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Events</h1>
          <p className="mt-2 text-gray-600">
            Manage and track your created events
          </p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-600">
            <CalendarDays className="w-5 h-5" />
            <span className="font-medium">
              {events.length} Total Events
            </span>
          </div>
        </div>
      </div>

      {/* Upcoming Events Grid */}
      {upcomingEvents.length > 0 && (
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Upcoming Events
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <EventCard key={event._id} eventId={event._id} />
            ))}
          </div>
        </div>
      )}

      {/* Past Events Section */}
      {pastEvents.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Past Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastEvents.map((event) => (
              <EventCard key={event._id} eventId={event._id} />
            ))}
          </div>
        </div>
      )}

      {events.length === 0 && (
        <div className="text-center py-12">
          <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No events yet</h3>
          <p className="text-gray-600 mt-1">
            Create your first event to get started
          </p>
        </div>
      )}
    </div>
  );
}
