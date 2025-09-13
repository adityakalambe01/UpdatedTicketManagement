"use client";

import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { Id } from "../../convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useStorageUrl } from "@/lib/utils";

import { CalendarDays, Check, CircleArrowRight, LoaderCircle, MapPin, PencilIcon, QrCode, StarIcon, Ticket, XCircle } from "lucide-react";
import { SignInButton } from "@clerk/nextjs";
import PurchaseTicket from "./PurchaseTicket";

export default function EventCard({ eventId, hideBuyButton = false }: { eventId: Id<"events">, hideBuyButton?: boolean }) {
  const { user } = useUser();
  const router = useRouter();
  const event = useQuery(api.events.getById, { eventId });
  
  const availability = useQuery(api.events.getEventAvailability, { 
    eventId,
    
  });
  
  const userTickets = useQuery(api.tickets.getUserTicketsForEvent, {
    eventId,
    userId: user?.id ?? "",
  });
  const userTicket = userTickets?.[0]; 
  const queuePosition = useQuery(api.waitingList.getQueuePosition, {
    eventId,
    userId: user?.id ?? "",
  });
  const imageUrl = useStorageUrl(event?.imageStorageId);
  const passes = useQuery(api.passes.getEventPasses, 
    event ? { eventId } : "skip"
  );

  if (!event || !availability) {
    return null;
  }

  const isPastEvent = event.eventDate < Date.now();

  const isEventOwner = user?.id === event?.userId;

  const renderQueuePosition = () => {
    if (!queuePosition || queuePosition.status !== "waiting") return null;

    if (availability.purchasedCount >= availability.totalTickets) {
      return (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Ticket className="w-5 h-5 text-gray-400 mr-2" />
            <span className="text-gray-600">Event is sold out</span>
          </div>
        </div>
      );
    }

    if (queuePosition.position === 2) {
      return (
        <div className="flex flex-col lg:flex-row items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-100">
          <div className="flex items-center">
            <CircleArrowRight className="w-5 h-5 text-amber-500 mr-2" />
            <span className="text-amber-700 font-medium">
              You&apos;re next in line! (Queue position: {queuePosition.position})
            </span>
          </div>
          <div className="flex items-center">
            <LoaderCircle className="w-4 h-4 mr-1 animate-spin text-amber-500" />
            <span className="text-amber-600 text-sm">Waiting for ticket</span>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
        <div className="flex items-center">
          <LoaderCircle className="w-4 h-4 mr-2 animate-spin text-blue-500" />
          <span className="text-blue-700">Queue position</span>
        </div>
        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
          #{queuePosition.position}
        </span>
      </div>
    );
  };

  const renderTicketStatus = () => {
    if (!user) {
      return (
        <div className="mt-4">
          <SignInButton mode="modal">
            <button className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg text-base font-medium hover:bg-blue-700 transition-colors duration-200 shadow-sm">
              Sign In to Buy Tickets
            </button>
          </SignInButton>
        </div>
      );
    }

    if (isEventOwner) {
      return (
        <div className="mt-4 space-y-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/seller/events/${eventId}/scan`);
            }}
            className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg text-base font-medium hover:bg-blue-700 transition-colors duration-200 shadow-sm flex items-center justify-center gap-2"
          >
            <QrCode className="w-5 h-5" />
            Scan Tickets
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/seller/events/${eventId}/edit`);
            }}
            className="w-full bg-gray-100 text-gray-700 px-4 py-3 rounded-lg text-base font-medium hover:bg-gray-200 transition-colors duration-200 shadow-sm flex items-center justify-center gap-2"
          >
            <PencilIcon className="w-5 h-5" />
            Edit Event
          </button>
        </div>
      );
    }

    if (userTicket && !isEventOwner) {
      return (
        <div className="mt-4">
          <div className="bg-green-50 rounded-lg border border-green-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <Check className="w-5 h-5 text-green-600 mr-2" />
                <div>
                  <span className="text-green-700 font-medium">
                    You have {userTickets?.length || 1} ticket{(userTickets?.length || 1) > 1 ? 's' : ''}!
                  </span>
                  {userTickets && userTickets.length > 0 && (
                    <div className="mt-1 text-xs text-green-600">
                      {(() => {
                        const passCounts: Record<string, number> = {};
                        userTickets.forEach(ticket => {
                          const passInfo = passes?.find(p => p._id === ticket.passId);
                          const passName = passInfo?.name || 'General';
                          passCounts[passName] = (passCounts[passName] || 0) + 1;
                        });
                        return Object.entries(passCounts).map(([passName, count], index) => (
                          <span key={passName} className="inline-block mr-2">
                            {passName}: {count > 1 ? `${count - 1}+` : count}{index < Object.keys(passCounts).length - 1 ? ', ' : ''}
                          </span>
                        ));
                      })()
                    }
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => router.push(`/tickets`)}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg font-medium shadow-sm transition-colors duration-200"
              >
                View Your Tickets
              </button>
              {!isPastEvent && availability.purchasedCount < availability.totalTickets && !hideBuyButton && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/event/${eventId}/passes`);
                  }}
                  className="w-full bg-amber-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-amber-700 transition-colors duration-200 shadow-sm"
                >
                  Buy More Tickets
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (queuePosition && !isEventOwner) {
      return (
        <div className="mt-4">
          {queuePosition.status === "offered" && (
            <PurchaseTicket eventId={eventId} />
          )}
          {renderQueuePosition()}
          {queuePosition.status === "expired" && (
            <div className="p-3 bg-red-50 rounded-lg border border-red-100">
              <span className="text-red-700 font-medium flex items-center">
                <XCircle className="w-5 h-5 mr-2" />
                Offer expired
              </span>
            </div>
          )}
        </div>
      );
    }

    // For non-owners - show buy button or purchase component
    if (!isEventOwner && !isPastEvent && availability.purchasedCount < availability.totalTickets && !hideBuyButton) {
      if (!queuePosition) {
        return (
          <div className="mt-4">
            <PurchaseTicket eventId={eventId} />
          </div>
        );
      }
    }

    return null;
  };

  return (
    <div
      onClick={() => router.push(`/event/${eventId}`)}
      className={`bg-white rounded-lg shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-300 border border-gray-100 cursor-pointer overflow-hidden relative group ${
        isPastEvent ? "opacity-75 hover:opacity-100" : ""
      }`}
    >
      <div className="relative w-full h-40 sm:h-56 md:h-72 overflow-hidden">
        <Image
          src={imageUrl || '/placeholder-image.jpg'}
          alt={event.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          priority
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
          placeholder="blur"
          blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmMWYxZjEiLz48L3N2Zz4="
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          key={imageUrl} // Ensures the image component re-renders when the source changes
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent group-hover:from-black/60 transition-all duration-300" />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {isPastEvent && (
          <div className="absolute inset-0 bg-black/30">
            <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
              ENDED
            </div>
          </div>
        )}
      </div>

      <div className="p-4 sm:p-6 relative">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex flex-col items-start gap-2">
              {isEventOwner && (
                <span className="inline-flex items-center gap-1 bg-blue-600/90 text-white px-2 py-1 rounded-full text-xs font-medium">
                  <StarIcon className="w-3 h-3" />
                  Your Event
                </span>
              )}
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{event.name}</h2>
            </div>
            {isPastEvent && (
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-red-100 text-red-800 mt-2">
                Event Ended
              </span>
            )}
          </div>

          {/* Price Tag */}
          <div className="flex flex-col items-end gap-2 ml-10">
            {!isPastEvent && (
              <span
                className={`px-2 sm:px-9 py-1 sm:py-1.5 text-sm sm:text-base font-semibold rounded-full ${
                  availability.remainingTickets > 0
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {availability.remainingTickets > 0 ? "Available" : "Sold Out"}
              </span>
            )}
            <div>
              {!isPastEvent && availability.activeOffers > 0 && !userTicket && (
                <span className="text-amber-600 text-sm ml-2">
                  ({availability.activeOffers}{" "}
                  {availability.activeOffers === 1 ? "person" : "people"} trying
                  to buy)
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex items-center text-gray-600">
            <MapPin className="w-4 h-4 mr-2" />
            <span>{event.location}</span>
          </div>

          <div className="flex items-center text-gray-600">
            <CalendarDays className="w-4 h-4 mr-2" />
            <span>
              {new Date(event.eventDate).toLocaleDateString()}{" "}
              {isPastEvent && "(Ended)"}
            </span>
          </div>

          <div className="flex items-center text-gray-600">
            <Ticket className="w-4 h-4 mr-2" />
            <span>
              {isEventOwner ? (
                <>
                  {availability.purchasedCount} tickets sold ({isPastEvent || availability.remainingTickets === 0 ? 'Sold Out' : `${availability.remainingTickets} available`})
                </>
              ) : (
                <>
                  {isPastEvent || availability.remainingTickets === 0 ? 'Sold Out' : 'Passes Are Available'}
                </>
              )}
              {!isPastEvent && availability.remainingTickets > 0 && availability.activeOffers > 0 && !userTicket && (
                <span className="text-amber-600 text-sm ml-2">
                  ({availability.activeOffers}{" "}
                  {availability.activeOffers === 1 ? "person" : "people"} trying
                  to buy)
                </span>
              )}
            </span>
          </div>
        </div>

        <p className="mt-4 text-gray-600 text-xs sm:text-sm line-clamp-2 sm:line-clamp-none">
          {event.description}
        </p>

        <div onClick={(e) => e.stopPropagation()}>
          {!isPastEvent && renderTicketStatus()}
        </div>
      </div>
    </div>
  );
}