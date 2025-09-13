"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Ticket, Calendar, MapPin, Clock, Download, Tag } from "lucide-react";
import Link from "next/link";
import Spinner from "@/components/Spinner";

export default function MyTicketsPage() {
  const { user, isLoaded } = useUser();
  const tickets = useQuery(api.tickets.getUserTickets, 
    user ? { userId: user.id } : "skip"
  );
  
  // Get passes for all tickets
  const passes = useQuery(api.passes.getEventPasses, 
    tickets?.[0]?.eventId ? { eventId: tickets[0].eventId } : "skip"
  );

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Please sign in to view your tickets</h1>
      </div>
    );
  }

  if (!tickets) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Tickets</h1>
        <p className="text-gray-600 mt-2">View and manage your purchased tickets</p>
      </div>

      {tickets.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No tickets yet</h3>
          <p className="text-gray-600 mt-1">Purchase tickets to see them here</p>
          <Link href="/" className="inline-block mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Browse Events
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6">
          {(() => {
            // Group tickets by event and pass type
            const groupedTickets = tickets.reduce((groups, ticket) => {
              const key = `${ticket.eventId}-${ticket.passId || 'general'}`;
              if (!groups[key]) {
                groups[key] = [];
              }
              groups[key].push(ticket);
              return groups;
            }, {} as Record<string, typeof tickets>);

            return Object.values(groupedTickets).map((ticketGroup) => {
              const firstTicket = ticketGroup[0];
              const passInfo = passes?.find(p => p._id === firstTicket.passId);
              const totalPrice = ticketGroup.reduce((sum, t) => sum + Number(t.amount || t.price), 0);
              const ticketCount = ticketGroup.length;
              
              return (
                <div key={`${firstTicket.eventId}-${firstTicket.passId}`} className="bg-white rounded-lg shadow-md border p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{firstTicket.eventName}</h3>
                        <div className="flex flex-wrap gap-2">
                          {passInfo && (
                            <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium w-fit">
                              <Tag className="w-3 h-3" />
                              {passInfo.name}
                            </span>
                          )}
                          {ticketCount > 1 && (
                            <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium w-fit">
                              <Ticket className="w-3 h-3" />
                              {ticketCount} tickets
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(firstTicket.eventDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(firstTicket.eventDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {firstTicket.eventLocation}
                        </div>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <div className="text-base sm:text-lg font-bold text-gray-900">₹{totalPrice.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">
                        {ticketCount > 1 ? `₹${(totalPrice/ticketCount).toFixed(2)} each` : `₹${totalPrice.toFixed(2)}`}
                      </div>
                      <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                        firstTicket.status === 'valid' ? 'bg-green-100 text-green-800' : 
                        firstTicket.status === 'used' ? 'bg-gray-100 text-gray-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {firstTicket.status}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pt-4 border-t">
                    <div className="text-sm text-gray-500">
                      <div>Purchased: {new Date(firstTicket.purchasedAt).toLocaleString()}</div>
                      {ticketCount > 1 && (
                        <div className="text-xs text-gray-400 mt-1">
                          {ticketCount} tickets: {ticketGroup.map(t => t._id.slice(-6)).join(', ')}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <button
                        onClick={() => window.open(`/tickets/${firstTicket._id}`, '_blank')}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 flex items-center justify-center gap-1"
                      >
                        <Download className="w-4 h-4" />
                        Download {ticketCount > 1 ? 'All' : ''}
                      </button>
                      <Link 
                        href={`/tickets/${firstTicket._id}`}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 text-center"
                      >
                        View Ticket
                      </Link>
                    </div>
                  </div>
                </div>
              );
            });
          })()}
        </div>
      )}
    </div>
  );
}