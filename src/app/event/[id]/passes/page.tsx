"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { Check, ArrowLeft, Tag } from "lucide-react";
import Spinner from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import DateSelector from "@/components/DateSelector";

export default function PassSelectionPage() {
  const { user } = useUser();
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as Id<"events">;

  const event = useQuery(api.events.getById, { eventId });
  const passes = useQuery(api.passes.getEventPasses, { eventId });
  const createDefaultPasses = useMutation(api.seedPasses.createDefaultPasses);

  const [selectedDates, setSelectedDates] = useState<Record<string, string[]>>({});

  // Auto-create default passes if none exist
  if (event && passes && passes.length === 0) {
    createDefaultPasses({ eventId });
  }

  if (!event || !passes) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const handlePassSelect = (passId: Id<"passes">, pass: any) => {
    // For Seasonal Pass, validate date selection
    if ((pass.category === "Seasonal Pass" || pass.name?.toLowerCase().includes("seasonal")) && (!selectedDates[passId] || selectedDates[passId].length === 0)) {
      alert("Please select at least one date for your seasonal pass");
      return;
    }
    
    // Pass selected dates as query parameter
    const dates = selectedDates[passId] || [];
    const url = dates.length > 0 
      ? `/event/${eventId}/purchase?passId=${passId}&selectedDates=${dates.join(',')}`
      : `/event/${eventId}/purchase?passId=${passId}`;
    
    router.push(url);
  };

  const handleDateChange = (passId: string, dates: string[]) => {
    setSelectedDates(prev => ({
      ...prev,
      [passId]: dates
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Event
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Choose Your Pass
          </h1>
          <p className="text-gray-600">
            Select the perfect pass for {event.name}
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {passes.map((pass, index) => {
            const isPopular = index === 1;
            const availableQuantity = pass.totalQuantity - pass.soldQuantity;
            const isAvailable = availableQuantity > 0;
            
            // Debug: Log pass details
            console.log("Pass:", pass.name, "Category:", pass.category);

            return (
              <div
                key={pass._id}
                className={`relative bg-white rounded-xl shadow-lg border-2 transition-all duration-200 hover:shadow-xl ${
                  isPopular
                    ? "border-blue-500 transform scale-105"
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="p-4 sm:p-6">
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Tag className="w-5 h-5 text-blue-600" />
                      <h3 className="text-xl font-bold text-gray-900">
                        {pass.name}
                      </h3>
                      {pass.category && (
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {pass.category}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-4">
                      {pass.description}
                    </p>
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                      ₹{pass.price.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {event.userId === user?.id ? 
                        `${pass.totalQuantity} / ${availableQuantity} available` : 
                        'Passes Are Available'
                      }
                    </div>
                  </div>

                  {pass.benefits.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3">
                        What's included:
                      </h4>
                      <ul className="space-y-2">
                        {pass.benefits.map((benefit, benefitIndex) => (
                          <li
                            key={benefitIndex}
                            className="flex items-start gap-2 text-sm text-gray-600"
                          >
                            <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Date Selector for Seasonal Pass */}
                  {(pass.category === "Seasonal Pass" || pass.name?.toLowerCase().includes("seasonal")) && (
                    <div className="mb-6">
                      <DateSelector
                        selectedDates={selectedDates[pass._id] || []}
                        onDateChange={(dates) => handleDateChange(pass._id, dates)}
                        disabled={!isAvailable || !user}
                      />
                    </div>
                  )}

                  <Button
                    onClick={() => handlePassSelect(pass._id, pass)}
                    disabled={!isAvailable || !user}
                    className={`w-full py-3 rounded-lg font-semibold transition-colors duration-200 ${
                      isPopular
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-gray-900 hover:bg-gray-800 text-white"
                    } disabled:bg-gray-300 disabled:cursor-not-allowed`}
                  >
                    {!user
                      ? "Sign in to Purchase"
                      : !isAvailable
                      ? "Sold Out"
                      : "Select This Pass"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {passes.length === 0 && (
          <div className="text-center py-12">
            <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No passes available
            </h3>
            <p className="text-gray-600">
              The event organizer hasn't created any passes yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}