"use client";

import { useSearchParams } from "next/navigation";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, Suspense } from "react";

function PurchaseSuccessContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("payment_id");
  const [ticketCreated, setTicketCreated] = useState(false);


  useEffect(() => {
    if (paymentId && !ticketCreated) {
      // Create ticket manually since webhook isn't working
      fetch('/api/manual-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId,
          eventId: localStorage.getItem('lastEventId'),
          userId: localStorage.getItem('lastUserId'),
          quantity: parseInt(localStorage.getItem('lastQuantity') || '1'),
          amount: parseInt(localStorage.getItem('lastAmount') || '100'),
          passId: localStorage.getItem('lastPassId'),
        }),
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTicketCreated(true);
          console.log('Ticket created:', data.ticketId);
        }
      })
      .catch(err => console.error('Failed to create ticket:', err));
    }
  }, [paymentId, ticketCreated]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Successful!
        </h1>

        <p className="text-gray-600 mb-6">
          Your ticket purchase has been completed successfully.
          {ticketCreated && " Your ticket has been created!"}
        </p>

        {paymentId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500">Payment ID</p>
            <p className="font-mono text-sm text-gray-900 break-all">
              {paymentId}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <Link
            href="/"
            className="w-full bg-amber-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-amber-700 transition-colors block"
          >
            Back to Events
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PurchaseSuccess() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div></div>}>
      <PurchaseSuccessContent />
    </Suspense>
  );
}