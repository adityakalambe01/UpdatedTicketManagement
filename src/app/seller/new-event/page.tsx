"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Mail, Shield } from "lucide-react";
import EventForm from "@/components/EventForm";

// Authorized event creators (add developer-approved user IDs here)
const AUTHORIZED_CREATORS: string[] = [
  // Add authorized user IDs here
  "user_30vHGOIpgMB2gXYCo6fEAxQzA0W",
];

export default function NewEventPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/");
      return;
    }
  }, [isLoaded, user, router]);

  if (!isLoaded) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg text-center p-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isAuthorized = AUTHORIZED_CREATORS.includes(user.id);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 sm:p-8 text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Access Restricted</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-6">Event creation is currently limited to authorized users only.</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <Mail className="w-5 h-5 text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-blue-800">Interested in becoming an event organizer?</p>
            
            <p className="text-sm text-blue-600 mt-1">Contact developers for approval</p>
            <span>anirudhsonawane111@gmail.com</span>
          </div>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  // Show EventForm for authorized users
  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Create New Event</h1>
          <p className="text-gray-600 mt-2">Fill in the details to create your event</p>
        </div>
        <EventForm mode="create" />
      </div>
    </div>
  );
}