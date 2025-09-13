"use client";

import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { useEffect, useState } from "react";
import {
  CalendarDays,
  IdCard,
  MapPin,
  Ticket as TicketIcon,
  User,
} from "lucide-react";
import QRCode from "react-qr-code";
import Spinner from "./Spinner";
import { useStorageUrl } from "@/lib/utils";
import Image from "next/image";

export default function Ticket({ ticketId }: { ticketId: Id<"tickets"> }) {
  const ticket = useQuery(api.tickets.getById, { ticketId });
  const ticketStatus = useQuery(api.tickets.getTicketStatus, { ticketId });
  const event = useQuery(api.events.getById, 
    ticket?.eventId ? { eventId: ticket.eventId } : "skip"
  );
  const user = useQuery(api.users.getUserById, {
    userId: ticket?.userId ?? "",
  });
  const selectedPass = useQuery(api.passes.getPassById, 
    ticket?.passId ? { passId: ticket.passId } : "skip"
  );
  const imageUrl = useStorageUrl(event?.imageStorageId);

  // Force component re-render every 2 seconds for real-time updates
  const [, forceUpdate] = useState({});
  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate({});
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const getUserTheme = (ticketId: string) => {
    const themes = [
      { bg: "bg-gradient-to-br from-blue-500 to-purple-600", accent: "text-blue-600", light: "bg-blue-50", border: "border-blue-200" },
      { bg: "bg-gradient-to-br from-green-500 to-teal-600", accent: "text-green-600", light: "bg-green-50", border: "border-green-200" },
      { bg: "bg-gradient-to-br from-purple-500 to-pink-600", accent: "text-purple-600", light: "bg-purple-50", border: "border-purple-200" },
      { bg: "bg-gradient-to-br from-orange-500 to-red-600", accent: "text-orange-600", light: "bg-orange-50", border: "border-orange-200" },
      { bg: "bg-gradient-to-br from-indigo-500 to-blue-600", accent: "text-indigo-600", light: "bg-indigo-50", border: "border-indigo-200" },
      { bg: "bg-gradient-to-br from-pink-500 to-rose-600", accent: "text-pink-600", light: "bg-pink-50", border: "border-pink-200" },
      { bg: "bg-gradient-to-br from-teal-500 to-cyan-600", accent: "text-teal-600", light: "bg-teal-50", border: "border-teal-200" },
      { bg: "bg-gradient-to-br from-amber-500 to-orange-600", accent: "text-amber-600", light: "bg-amber-50", border: "border-amber-200" },
      { bg: "bg-gradient-to-br from-red-500 to-pink-600", accent: "text-red-600", light: "bg-red-50", border: "border-red-200" },
      { bg: "bg-gradient-to-br from-cyan-500 to-blue-600", accent: "text-cyan-600", light: "bg-cyan-50", border: "border-cyan-200" },
      { bg: "bg-gradient-to-br from-violet-500 to-purple-600", accent: "text-violet-600", light: "bg-violet-50", border: "border-violet-200" },
      { bg: "bg-gradient-to-br from-emerald-500 to-green-600", accent: "text-emerald-600", light: "bg-emerald-50", border: "border-emerald-200" },
      { bg: "bg-gradient-to-br from-rose-500 to-red-600", accent: "text-rose-600", light: "bg-rose-50", border: "border-rose-200" },
      { bg: "bg-gradient-to-br from-sky-500 to-cyan-600", accent: "text-sky-600", light: "bg-sky-50", border: "border-sky-200" },
      { bg: "bg-gradient-to-br from-lime-500 to-green-600", accent: "text-lime-600", light: "bg-lime-50", border: "border-lime-200" },
      { bg: "bg-gradient-to-br from-fuchsia-500 to-pink-600", accent: "text-fuchsia-600", light: "bg-fuchsia-50", border: "border-fuchsia-200" }
    ];
    const hash = ticketId.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0);
    return themes[Math.abs(hash) % themes.length];
  };

  if (!ticket || !event || !user || !ticketStatus) {
    return <Spinner />;
  }

  const theme = getUserTheme(ticket._id);
  const { scannedCount, totalCount, isScanned, scannedAt } = ticketStatus;

  return (
    <div
      className={`bg-white rounded-xl overflow-hidden shadow-xl border ${event.is_cancelled ? "border-red-200" : theme.border}`}
    >
      {/* Event Header with Image */}
      <div className="relative">
        {imageUrl && (
          <div className="relative w-full aspect-[21/9]">
            <Image
              src={imageUrl}
              alt={event.name}
              fill
              className={`object-cover object-center ${event.is_cancelled ? "opacity-50" : ""}`}
              priority
            />
            <div className={`absolute inset-0 ${theme.bg} opacity-80`} />
          </div>
        )}
        <div
          className={`px-4 sm:px-6 py-3 sm:py-4 ${imageUrl ? "absolute bottom-0 left-0 right-0" : event.is_cancelled ? "bg-red-600" : theme.bg} ${imageUrl ? theme.bg + ' opacity-90' : ''}`}
        >
          <h2
            className={`text-xl sm:text-2xl font-bold ${imageUrl || !imageUrl ? "text-white" : "text-black"}`}
          >
            {event.name}
          </h2>
          {event.is_cancelled && (
            <p className="text-red-300 mt-1">This event has been cancelled</p>
          )}
        </div>
      </div>

      {/* Ticket Content */}
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Left Column - Event Details */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center text-gray-600">
              <CalendarDays
                className={`w-4 sm:w-5 h-4 sm:h-5 mr-3 ${event.is_cancelled ? "text-red-600" : theme.accent}`}
              />
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">
                  {new Date(event.eventDate).toLocaleDateString()}
                </p>
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
              className={`bg-gray-100 p-4 rounded-lg ${event.is_cancelled ? "opacity-50" : ""}`}
            >
              <QRCode value={ticket._id} className="w-24 h-24 sm:w-32 sm:h-32" />
            </div>
            <p className="mt-2 text-xs sm:text-sm text-gray-500 break-all text-center max-w-[200px] md:max-w-full">
              Ticket ID: {ticket._id}
            </p>
          </div>
        </div>

        {/* Pass Benefits */}
        {selectedPass && selectedPass.benefits && selectedPass.benefits.length > 0 && (
          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Pass Benefits
            </h3>
            <ul className="space-y-2">
              {selectedPass.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-2 text-xs sm:text-sm text-gray-600">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Additional Information */}
        <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            Important Information
          </h3>
          {event.is_cancelled ? (
            <p className="text-sm text-red-600">
              This event has been cancelled. A refund will be processed if it
              hasn&apos;t been already.
            </p>
          ) : (
            <ul className="text-xs sm:text-sm text-gray-600 space-y-1">
              <li>• Please arrive at least 30 minutes before the event</li>
              <li>• Have your ticket QR code ready for scanning</li>
              <li>• This ticket is non-transferable</li>
            </ul>
          )}
        </div>
      </div>

      {/* Ticket Footer */}
      <div
        className={`${event.is_cancelled ? "bg-red-50" : theme.light} px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 ${theme.border} border-t`}
      >
        <span className="text-xs sm:text-sm text-gray-500">
          Purchase Date: {new Date(ticket.purchasedAt).toLocaleString()}
        </span>
        <div className="text-left sm:text-right">
          <span
            className={`text-sm font-medium ${event.is_cancelled ? "text-red-600" : isScanned ? "text-green-600" : theme.accent}`}
          >
            {event.is_cancelled ? "Cancelled" : isScanned ? "Scanned" : "Valid Ticket"}
          </span>
          {isScanned && scannedAt && (
            <div className="text-xs text-gray-500 mt-1">
              Scanned: {new Date(scannedAt).toLocaleString()}
            </div>
          )}
          <div className="text-xs text-gray-500 mt-1">
            {scannedCount}/{totalCount} tickets scanned
          </div>
        </div>
      </div>
    </div>
  );
}