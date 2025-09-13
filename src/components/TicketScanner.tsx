"use client";

import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import {
  QrCode,
  CheckCircle,
  XCircle,
  User,
  Calendar,
  MapPin,
} from "lucide-react";
import Spinner from "./Spinner";

interface TicketScannerProps {
  eventId: Id<"events">;
}

export default function TicketScanner({ eventId }: TicketScannerProps) {
  const { user } = useUser();

  // Local state hooks
  const [ticketId, setTicketId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [selectedPassId, setSelectedPassId] = useState<string | null>(null);

  // Convex queries and mutations (always run in the same order)
  const event = useQuery(api.events.getById, { eventId });
  const tickets = useQuery(
    api.tickets.getEventTickets,
    user?.id ? { eventId, ownerId: user.id } : "skip"
  );
  const scanTicket = useMutation(api.tickets.scanTicket);

  // Derived values
  const ticketsByPass =
    tickets?.reduce((acc, ticket) => {
      const passId = ticket.passId || "Default";
      if (!acc[passId]) {
        acc[passId] = [];
      }
      acc[passId].push(ticket);
      return acc;
    }, {} as Record<string, typeof tickets>) ?? {};

  const passIds = Object.keys(ticketsByPass);
  const filteredTickets = selectedPassId
    ? ticketsByPass[selectedPassId] || []
    : tickets || [];

  const validTickets = filteredTickets.filter((t) => t.status === "valid");
  const scannedTickets = filteredTickets.filter((t) => t.status === "used");

  // Scan handler
  const handleScan = async () => {
    if (!ticketId.trim() || !user?.id) return;

    setScanResult(null);
    try {
      await scanTicket({
        ticketId: ticketId.trim() as Id<"tickets">,
        scannerId: user.id,
      });

      setScanResult({ success: true, message: "Ticket scanned successfully!" });
      setTicketId("");
    } catch (error: any) {
      setScanResult({
        success: false,
        message: error.message || "Failed to scan ticket",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-8 text-white">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <QrCode className="w-6 h-6" />
            Ticket Scanner
          </h2>
          <p className="text-blue-100 mt-2">
            {event ? `Scan tickets for: ${event.name}` : "Loading event..."}
          </p>
        </div>

        {/* Loading state */}
        {(!event || !tickets) && (
          <div className="flex justify-center items-center h-64">
            <Spinner />
          </div>
        )}

        {/* Content only renders when event and tickets are loaded */}
        {event && tickets && (
          <>
            {/* Event Info */}
            <div className="p-6 bg-gray-50 border-b">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {new Date(event.eventDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-600">{event.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {scannedTickets.length}/{tickets.length} scanned
                  </span>
                </div>
              </div>
            </div>

            {/* Scanner Interface */}
            <div className="p-6">
              <div className="max-w-md mx-auto">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Ticket ID
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={ticketId}
                    onChange={(e) => setTicketId(e.target.value)}
                    placeholder="Paste or type ticket ID"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => e.key === "Enter" && handleScan()}
                  />
                  <button
                    onClick={handleScan}
                    disabled={!ticketId.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Scan
                  </button>
                </div>
              </div>

              {/* Search by User Name */}
              <div className="max-w-md mx-auto mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search by User Name
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Scan Result */}
              {scanResult && (
                <div
                  className={`mt-6 p-4 rounded-lg ${
                    scanResult.success
                      ? "bg-green-50 border border-green-200"
                      : "bg-red-50 border border-red-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {scanResult.success ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <span
                      className={`font-medium ${
                        scanResult.success ? "text-green-800" : "text-red-800"
                      }`}
                    >
                      {scanResult.message}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Pass Filter */}
            <div className="p-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold mb-4">
                Filter by Ticket Category
              </h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedPassId(null)}
                  className={`px-4 py-2 rounded-md text-sm ${
                    !selectedPassId
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  All Categories
                </button>
                {passIds.map((passId) => (
                  <button
                    key={passId}
                    onClick={() => setSelectedPassId(passId)}
                    className={`px-4 py-2 rounded-md text-sm ${
                      selectedPassId === passId
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {passId}
                  </button>
                ))}
              </div>
            </div>

            {/* Statistics */}
            <div className="p-6 bg-gray-50">
              <h3 className="text-lg font-semibold mb-4">
                Scan Statistics{" "}
                {selectedPassId
                  ? `(Category: ${selectedPassId})`
                  : "(All Categories)"}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {filteredTickets.length}
                  </div>
                  <div className="text-sm text-gray-600">Total Tickets</div>
                </div>
                <div className="bg-white p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {scannedTickets.length}
                  </div>
                  <div className="text-sm text-gray-600">Scanned</div>
                </div>
                <div className="bg-white p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {validTickets.length}
                  </div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
                <div className="bg-white p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-gray-600">
                    {filteredTickets.length > 0
                      ? Math.round(
                          (scannedTickets.length / filteredTickets.length) * 100
                        )
                      : 0}
                    %
                  </div>
                  <div className="text-sm text-gray-600">Completion</div>
                </div>
              </div>

              {/* Tickets List */}
              {filteredTickets.length > 0 && (
                <div>
                  <h4 className="text-md font-semibold mb-3">
                    Tickets{" "}
                    {selectedPassId
                      ? `(Category: ${selectedPassId})`
                      : "(All Categories)"}
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ticket ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Category
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredTickets
                          .filter((ticket) => {
                            if (!searchQuery) return true;
                            const query = searchQuery.toLowerCase();
                            const userName =
                              (ticket.user?.name || "").toLowerCase();
                            const userEmail =
                              (ticket.user?.email || "").toLowerCase();
                            const tid = ticket._id.toLowerCase();
                            return (
                              userName.includes(query) ||
                              userEmail.includes(query) ||
                              tid.includes(query)
                            );
                          })
                          .map((ticket) => (
                            <tr
                              key={ticket._id}
                              className="hover:bg-blue-50 cursor-pointer transition-colors"
                              onClick={() => setTicketId(ticket._id)}
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {ticket._id}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {ticket.user?.name || "Unknown"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {ticket.user?.email || "No email"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {ticket.passId || "Default"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    ticket.status === "used"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-orange-100 text-orange-800"
                                  }`}
                                >
                                  {ticket.status === "used"
                                    ? "Scanned"
                                    : "Pending"}
                                </span>
                                {ticket.scannedAt && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    {new Date(
                                      ticket.scannedAt
                                    ).toLocaleTimeString()}
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
