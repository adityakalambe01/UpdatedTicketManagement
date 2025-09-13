"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import React from "react";
import {
  CalendarDays,
  IdCard,
  MapPin,
  Ticket as TicketIcon,
  User,
} from "lucide-react";
import QRCode from "react-qr-code";
import Spinner from "@/components/Spinner";
import { useStorageUrl } from "@/lib/utils";
import Image from "next/image";
import { Button } from "@/components/ui/button";

import TicketScanner from "@/components/TicketScanner"; // Assuming this is the scanner component

export default function TicketPage({ params: paramsPromise }: { params: Promise<{ ticketId: string }> }) {
  const params = React.use(paramsPromise);
  const ticketIdParam = params.ticketId as Id<"tickets">;

  const ticket = useQuery(api.tickets.getById, { ticketId: ticketIdParam });
  const ticketStatus = useQuery(api.tickets.getTicketStatus, { ticketId: ticketIdParam });

  if (!ticket || !ticketStatus) {
    return <Spinner />;
  }

  return <TicketDetails ticket={ticket} ticketStatus={ticketStatus} />;
}

function TicketDetails({ ticket, ticketStatus }: { ticket: any; ticketStatus: any }) {
  const event = useQuery(api.events.getById, ticket.eventId ? { eventId: ticket.eventId } : "skip");
  const user = useQuery(api.users.getUserById, ticket.userId ? { userId: ticket.userId } : "skip");
  const selectedPass = useQuery(api.passes.getPassById, ticket.passId ? { passId: ticket.passId } : "skip");
  const imageUrl = useStorageUrl(event?.imageStorageId);

  if (!event || !user) {
    return <Spinner />;
  }

  const theme = getUserTheme(ticket._id);
  const { scannedCount, totalCount, isScanned, scannedAt } = ticketStatus;

  return (
    <div
      className={`bg-white rounded-xl overflow-hidden shadow-sm border ${event.is_cancelled ? "border-red-200" : theme.border} max-w-3xl mx-auto my-7 p-4 xs:p-6 sm:p-8 md:p-10 lg:p-0 h-[100vh] flex flex-col`}   
    >
      {/* Event Header with Image */}
      <div className="relative flex-shrink-0">
        {imageUrl && (
          <div className="relative w-full aspect-[4/3] xs:aspect-[3/2] sm:aspect-[16/9] md:aspect-[21/9] lg:aspect-[16/9]"> // Existing responsive aspect ratios
            <Image
              src={imageUrl}
              alt={event.name}
              fill
              className={`object-cover object-center ${event.is_cancelled ? "opacity-50" : ""}`}
              priority
            />
            <div className={`absolute inset-0 ${theme.bg} opacity-75`} />
          </div>
        )}
        <div
          className={`px-4 py-3 xs:px-5 xs:py-3.5 sm:px-6 sm:py-4 md:px-8 md:py-5 ${imageUrl ? "absolute bottom-0 left-0 right-0" : event.is_cancelled ? "bg-red-50" : theme.bg} ${imageUrl ? theme.bg + ' opacity-90' : ''}`}
        >
          <h2
            className={`text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold ${imageUrl || !imageUrl ? "text-gray-900" : "text-gray-900"}`}
          >
            {event.name}
          </h2>
          {event.is_cancelled && (
            <p className="text-red-600 mt-1 text-xs xs:text-sm sm:text-base">This event has been cancelled</p>
          )}
        </div>
      </div>

      {/* Ticket Content */}
      <div className="flex-grow overflow-y-auto p-4 xs:p-6 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 xs:gap-5 sm:gap-6 md:gap-8">
          {/* Left Column - Event Details */}
          <div className="space-y-3 xs:space-y-4 sm:space-y-5 md:space-y-6">
            <div className="flex items-start gap-4 text-gray-600">
              <CalendarDays className={`w-5 h-5 mt-1 ${event.is_cancelled ? "text-red-600" : theme.accent}`} />
              <div>
                <p className="text-sm font-medium text-gray-500">Date</p>
                <p className="text-base">{new Date(event.eventDate).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex items-center text-gray-600">
              <MapPin
                className={`w-4 sm:w-5 h-4 sm:h-5 mr-3 ${event.is_cancelled ? "text-red-600" : theme.accent}`}
              />
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium">{event.location}</p>
              </div>
            </div>

            <div className="flex items-center text-gray-600">
              <User
                className={`w-4 sm:w-5 h-4 sm:h-5 mr-3 ${event.is_cancelled ? "text-red-600" : theme.accent}`}
              />
              <div>
                <p className="text-sm text-gray-500">Ticket Holder</p>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center text-gray-600 break-all">
              <IdCard
                className={`w-4 sm:w-5 h-4 sm:h-5 mr-3 ${event.is_cancelled ? "text-red-600" : theme.accent}`}
              />
              <div>
                <p className="text-sm text-gray-500">Ticket Holder ID</p>
                <p className="font-medium">{user.userId}</p>
              </div>
            </div>

            <div className="flex items-center text-gray-600">
              <TicketIcon
                className={`w-4 sm:w-5 h-4 sm:h-5 mr-3 ${event.is_cancelled ? "text-red-600" : theme.accent}`}
              />
              <div>
                <p className="text-sm text-gray-500">{selectedPass ? 'Pass Type' : 'Ticket Price'}</p>
                <p className="font-medium">{selectedPass?.name || 'General Admission'}</p>
                {/* Show the actual amount paid (after discounts) as the main bold amount */}
                <p className="text-2xl font-bold text-gray-900">₹{(ticket.amount ?? selectedPass?.price ?? event.price).toFixed(2)}</p>
                {/* Show breakdown below */}
                <p className="text-sm text-gray-500">
                  ₹{(ticket.amount ?? selectedPass?.price ?? event.price).toFixed(2)} each
                </p>
                <p className="text-xs text-gray-400">Pass ID: {ticket.passId || 'None'}</p>
              </div>
            </div>
          </div>

          {/* Right Column - QR Code */}
          <div className="flex flex-col items-center justify-center lg:border-l border-t lg:border-t-0 border-gray-200 pt-6 lg:pt-0 lg:pl-6">
            <div
              className={`bg-gray-50 p-2 xs:p-3 sm:p-4 rounded-lg ${event.is_cancelled ? "opacity-50" : ""}`}
            >
              <QRCode value={ticket._id} className="w-20 h-20 xs:w-24 xs:h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48" />
            </div>
            <p className="mt-2 text-xs xs:text-sm sm:text-base text-gray-500 break-all text-center max-w-[200px] xs:max-w-[250px] sm:max-w-full">
              Ticket ID: {ticket._id}
            </p>
          </div>
        </div>
      </div>

      {/* Ticket Footer with scanned/not scanned badge */}
      <div className={`mt-auto -mx-4 xs:-mx-4 sm:-mx-4 px-4 xs:px-6 sm:px-8 py-4 xs:py-5 sm:py-6 ${event.is_cancelled ? "bg-red-50" : "bg-gray-50"} border-t border-gray-200`}
      >
        <div className="flex flex-row items-center justify-between gap-2 flex-wrap min-h-[40px] xs:min-h-[50px]">
          <div className="flex items-center gap-2 min-w-[120px] xs:min-w-[150px] sm:min-w-[180px]">
            <span className={`inline-flex items-center px-2 xs:px-3 sm:px-4 py-1 xs:py-1.5 rounded-full text-xs xs:text-sm font-medium whitespace-nowrap ${event.is_cancelled ? "bg-red-100 text-red-700" : isScanned ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
            >
              {event.is_cancelled ? "Cancelled" : isScanned ? "Scanned" : "Not Scanned"}
            </span>
            <span className="text-xs xs:text-sm text-gray-500 whitespace-nowrap">
              {scannedCount}/{totalCount} scanned
            </span>
          </div>
          <div className="text-xs xs:text-sm text-gray-500 whitespace-nowrap">
            Purchased: {new Date(ticket.purchasedAt).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}

function getUserTheme(ticketId: string) {
  const themes = [
    { bg: "bg-gradient-to-br from-gray-50 to-white", accent: "text-blue-600", light: "bg-gray-50", border: "border-gray-200" }, // Aligned with site light theme
    { bg: "bg-gradient-to-br from-blue-50 to-white", accent: "text-blue-600", light: "bg-blue-50", border: "border-blue-200" },
    { bg: "bg-gradient-to-br from-indigo-50 to-white", accent: "text-indigo-600", light: "bg-indigo-50", border: "border-indigo-200" },
    // Add more themes matching site palette
  ];
  const hash = ticketId.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0);
  return themes[Math.abs(hash) % themes.length];
}