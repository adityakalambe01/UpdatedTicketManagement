"use client";

import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import SellerEventList from "@/components/SellerEventList";

export default function SellerEventsPage() {
  const { user } = useUser();
  
  if (!user) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SellerEventList />
    </div>
  );
}