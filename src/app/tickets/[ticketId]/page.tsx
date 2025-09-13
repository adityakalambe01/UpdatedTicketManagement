"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import {
  CalendarDays,
  IdCard,
  MapPin,
  Ticket as TicketIcon,
  User,
  
} from "lucide-react";
import QRCode from "react-qr-code";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { useStorageUrl } from "@/lib/utils";
import { useParams } from "next/navigation";

const theme = {
  bg: "bg-gradient-to-br from-white-500 to-yellow-600",
  accent: "text-white-600",
  border: "border-white-200",
  light: "bg-red-50",
};

function TicketPage() {
  const { isLoaded, user } = useUser();
  const params = useParams<{ ticketId: string }>();

  const ticketId = params?.ticketId as Id<"tickets"> | undefined;

  const ticket = useQuery(
    api.tickets.getById,
    ticketId ? { ticketId } : "skip"
  );

  const event = useQuery(
    api.events.getById,
    ticket?.eventId ? { eventId: ticket.eventId as Id<"events"> } : "skip"
  );

  const selectedPass = useQuery(
    api.passes.getPassById,
    ticket?.passId ? { passId: ticket.passId as Id<"passes"> } : "skip"
  );

  const userTickets = useQuery(
    api.tickets.getUserTicketsForEvent,
    ticket?.eventId && user?.id
      ? {
          eventId: ticket.eventId as Id<"events">,
          userId: user.id,
        }
      : "skip"
  );

  const imageUrl = useStorageUrl(event?.imageStorageId);
  
  // Calculate total amount for all tickets in the same purchase group
  const getTotalAmount = () => {
    if (!userTickets || !ticket) return ticket?.amount || 0;
    
    // Find all tickets with the same purchase timestamp (same purchase group)
    const samePurchaseTickets = userTickets.filter(t => 
      t.purchasedAt === ticket.purchasedAt && 
      t.passId === ticket.passId
    );
    
    return samePurchaseTickets.reduce((sum, t) => sum + (t.amount || 0), 0);
  };
  
  const totalAmount = getTotalAmount();
const individualAmount = ticket?.amount ?? 0;

const ticketCount =
  ticket && userTickets
    ? userTickets.filter(
        (t) =>
          t.purchasedAt === ticket.purchasedAt &&
          t.passId === ticket.passId
      ).length || 1
    : 1;


  if (!isLoaded || ticket === undefined) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (ticket === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">Ticket not found</div>
      </div>
    );
  }

  if (event === undefined) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">Loading event...</div>
      </div>
    );
  }

  if (event === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">Event not found</div>
      </div>
    );
  }

  if (user && ticket.userId && ticket.userId !== user.id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">Access denied</div>
      </div>
    );
  }

  const isScanned = Boolean(ticket.scannedAt);
  const scannedAt: number | null = ticket.scannedAt ?? null;
  // Filter tickets by passId to ensure counts are per category
  const filteredTickets = (userTickets ?? []).filter(t => t.passId === ticket.passId);
  const scannedCount = filteredTickets.filter((t) => t?.scannedAt).length ?? 0;
  const totalCount = filteredTickets.length ?? 0;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-10 px-4">
      <div
        className={`bg-white rounded-2xl overflow-hidden shadow-2xl border ${
          event.is_cancelled ? "border-red-200" : theme.border
        } w-full max-w-3xl sm:max-w-4xl mx-auto`}
      >
        <div className="relative mb-2">
          {imageUrl && (
            <div className="relative w-full aspect-[21/9]">
              <Image
                src={imageUrl}
                alt={event.name}
                fill
                className={`object-cover object-center ${
                  event.is_cancelled ? "opacity-50" : ""
                }`}
                priority
                sizes="100vw"
              />
              <div className={`absolute inset-0 ${theme.bg} opacity-80`} />
            </div>
          )}
          <div
            className={`px-4 sm:px-6 py-3 sm:py-4 ${
              imageUrl
                ? "absolute bottom-0 left-0 right-0 bg-transparent"
                : event.is_cancelled
                ? "bg-red-600"
                : theme.bg
            }`}
          >
            <h2 className="text-xl sm:text-2xl font-bold text-white">{event.name}</h2>
            {event.is_cancelled && (
              <p className="text-red-300 mt-1">This event has been cancelled</p>
            )}
          </div>
        </div>

        <div className="px-6 sm:px-10 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 sm:space-y-5">
              <div className="flex items-center text-gray-600">
                <CalendarDays
                  className={`w-4 sm:w-5 h-4 sm:h-5 mr-3 ${
                    event.is_cancelled ? "text-red-600" : theme.accent
                  }`}
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
                  className={`w-4 sm:w-5 h-4 sm:h-5 mr-3 ${
                    event.is_cancelled ? "text-red-600" : theme.accent
                  }`}
                />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">{event.location}</p>
                </div>
              </div>

              <div className="flex items-center text-gray-600">
                <User
                  className={`w-4 sm:w-5 h-4 sm:h-5 mr-3 ${
                    event.is_cancelled ? "text-red-600" : theme.accent
                  }`}
                />
                <div>
                  <p className="text-sm text-gray-500">Ticket Holder</p>
                  <p className="font-medium">{user?.fullName || "Guest"}</p>
                  {user?.primaryEmailAddress && (
                    <p className="text-sm text-gray-500">
                      {user.primaryEmailAddress.emailAddress}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center text-gray-600 break-all">
                <IdCard
                  className={`w-4 sm:w-5 h-4 sm:h-5 mr-3 ${
                    event.is_cancelled ? "text-red-600" : theme.accent
                  }`}
                />
                <div>
                  <p className="text-sm text-gray-500">Ticket ID</p>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{ticket._id}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center text-gray-600">
                <TicketIcon
                  className={`w-4 sm:w-5 h-4 sm:h-5 mr-3 ${
                    event.is_cancelled ? "text-red-600" : theme.accent
                  }`}
                />
                <div>
                  <p className="text-sm text-gray-500">{selectedPass ? 'Pass Type' : 'Ticket Price'}</p>
                  {selectedPass && <p className="font-medium">{selectedPass.name}</p>}
                  {/* Show the total amount paid (after discounts) as the main bold amount */}
                  <p className="text-2xl font-bold text-gray-900">₹{totalAmount.toFixed(2)}</p>
                  {/* Show breakdown below - only show "each" if there are multiple tickets */}
                  {ticketCount > 1 ? (
                    <p className="text-sm text-gray-500">
                      ₹{individualAmount.toFixed(2)} each
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500">
                      ₹{individualAmount.toFixed(2)}
                    </p>
                  )}
                  {ticket.passId && (
                    <p className="text-xs text-gray-400">Pass ID: {ticket.passId}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center lg:border-l border-t lg:border-t-0 border-gray-200 pt-6 lg:pt-0 lg:pl-8">
              <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                <QRCode
                  value={ticket._id}
                  size={180}
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  viewBox="0 0 180 180"
                  className={event.is_cancelled ? "opacity-50" : ""}
                />
              </div>
              <p className="mt-2 text-xs sm:text-sm text-gray-500 break-all text-center max-w-[200px] md:max-w-full">
                Ticket ID: {ticket._id}
              </p>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-gray-200 px-6 sm:px-10 pb-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Important Information</h3>
            {event.is_cancelled ? (
              <p className="text-sm text-red-600">
                This event has been cancelled. A refund will be processed if it
                hasn't been already.
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

        <div
          className={`${
            event.is_cancelled ? "bg-red-50" : isScanned ? "bg-green-50" : "bg-red-50"
          } px-4 sm:px-8 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 ${isScanned ? "border-green-200" : "border-red-200"} border-t text-xs sm:text-sm`}
        >
          <span className="text-gray-500">
            Purchase Date:{" "}
            {ticket?.purchasedAt
              ? new Date(ticket.purchasedAt).toLocaleString()
              : "—"}
          </span>
          <div className="text-left sm:text-right">
            <div className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
              Paid: ₹{totalAmount.toFixed(2)}
            </div>
            <span
              className={`text-sm font-medium ${
                event.is_cancelled
                  ? "text-red-600"
                  : isScanned
                  ? "text-green-600"
                  : theme.accent
              }`}
            >
              {event.is_cancelled
                ? "Cancelled"
                : isScanned
                ? "Scanned"
                : "Valid Ticket"}
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
    </div>
  );
}

export default TicketPage;
/* <TicketCard
  ticket={ticket}
  totalTickets={ticketCount}
  isScanned={isScanned}
  scannedAt={scannedAt}
/> */