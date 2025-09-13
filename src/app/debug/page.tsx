"use client";

import { useUser } from "@clerk/nextjs";

export default function DebugPage() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return <div className="p-8">Loading...</div>;
  }

  if (!user) {
    return <div className="p-8">Please sign in to see your user ID</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Debug Information</h1>
        <div className="space-y-2">
          <p><strong>User ID:</strong> {user.id}</p>
          <p><strong>Email:</strong> {user.primaryEmailAddress?.emailAddress}</p>
          <p><strong>Name:</strong> {user.fullName}</p>
        </div>
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <p className="text-sm text-gray-600">Copy your User ID and add it to the AUTHORIZED_CREATORS array in:</p>
          <p className="text-sm font-mono">src/app/seller/new-event/page.tsx</p>
        </div>
      </div>
    </div>
  );
}