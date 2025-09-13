"use client";

import { use } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { Calendar, MapPin, Ticket, ArrowLeft, Download } from "lucide-react";
import Link from "next/link";
import Spinner from "@/components/Spinner";

export default function GroupTicketsPage({ 
  params 
}: { 
  params: Promise<{ eventId: string; passId: string }> 
}) {
  const { user } = useUser();
  const { eventId, passId } = use(params);
  
  const event = useQuery(api.events.getById, { eventId: eventId as Id<"events"> });
  const passInfo = useQuery(api.passes.getPassById, { passId: passId as Id<"passes"> });
  const userTickets = useQuery(api.tickets.getUserTicketsForEvent, 
    user?.id ? {
      eventId: eventId as Id<"events">,
      userId: user.id,
    } : "skip"
  );

  // Ticcket Filter
  const passTickets = userTickets?.filter(ticket => ticket.passId === passId) || [];

  if (!event || !passInfo || !userTickets) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const totalAmount = passTickets.reduce((sum, ticket) => sum + (ticket.amount || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/tickets" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to My Tickets
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{passInfo.name} Tickets</h1>
          <p className="text-gray-600 mt-2">{event.name}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-2">{event.name}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span>{new Date(event.eventDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span>{event.location}</span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                  {passInfo.name}
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                  {passTickets.length} tickets
                </span>
              </div>
              
              {/*Main amount display*/}
              <div className="text-3xl font-bold text-gray-900 mb-1">
                ₹{totalAmount.toFixed(2)}
              </div>
              <div className="text-sm text-gray-500 mb-2">
                ₹{(totalAmount / passTickets.length).toFixed(2)} each
              </div>
              <div className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                valid
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Purchased: {new Date(passTickets[0]?.purchasedAt || Date.now()).toLocaleString()}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {passTickets.length} tickets: {passTickets.map(t => t._id.slice(-6)).join(', ')}
            </div>
          </div>
          
          {/*Action buttons*/}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  
                  // Download Button
                  passTickets.forEach(ticket => {
                    window.open(`/tickets/${ticket._id}`, '_blank');
                  });
                }}
                className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg text-sm hover:bg-green-700 flex items-center justify-center gap-2 font-medium"
              >
                <Download className="w-4 h-4" />
                Download All
              </button>
              <Link 
                href={`/tickets/${passTickets[0]?._id}`}
                className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg text-sm hover:bg-blue-700 text-center font-medium"
              >
                View Ticket
              </Link>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {passTickets.map((ticket, index) => (
            <div key={ticket._id} className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {passInfo.name} #{index + 1}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Ticket ID: {ticket._id}
                  </p>
                  <p className="text-sm text-gray-500">
                    Purchased: {new Date(ticket.purchasedAt).toLocaleString()}
                  </p>
                </div>
                
                <div className="text-left sm:text-right">
                  <div className="text-xl font-bold text-gray-900">₹{(ticket.amount || 0).toFixed(2)}</div>
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                    ticket.status === 'valid' ? 'bg-green-100 text-green-800' : 
                    ticket.status === 'used' ? 'bg-gray-100 text-gray-800' : 
                    'bg-red-100 text-red-800'
                  }`}>
                    {ticket.status}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 mt-4 pt-4 border-t">
                <button
                  onClick={() => window.open(`/tickets/${ticket._id}`, '_blank')}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <Link 
                  href={`/tickets/${ticket._id}`}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 text-center"
                >
                  View Full Ticket
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}