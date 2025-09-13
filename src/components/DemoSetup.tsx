"use client";

import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Database, Loader2 } from "lucide-react";

export default function DemoSetup() {
  const populateSampleData = useMutation(api.events.populateSampleData);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handlePopulateData = async () => {
    try {
      setIsLoading(true);
      const result = await populateSampleData({});
      setMessage(result.message);
    } catch (error) {
      console.error("Error populating sample data:", error);
      setMessage("Error populating sample data");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
      <div className="flex items-center gap-3 mb-4">
        <Database className="w-6 h-6 text-blue-600" />
        <h3 className="text-lg font-semibold text-blue-900">Demo Setup</h3>
      </div>
      <p className="text-blue-700 mb-4">
        Click the button below to populate the database with sample events for demonstration.
      </p>
      <Button
        onClick={handlePopulateData}
        disabled={isLoading}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Populating...
          </>
        ) : (
          <>
            <Database className="w-4 h-4 mr-2" />
            Populate Sample Data
          </>
        )}
      </Button>
      {message && (
        <p className="mt-2 text-sm text-blue-600">{message}</p>
      )}
    </div>
  );
} 