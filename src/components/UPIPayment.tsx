"use client";

import { useState } from "react";
import { createRazorpayOrder } from "../../actions/createRazorpayOrder";
import { verifyUpiPayment } from "../../actions/verifyUpiPayment";
import { Id } from "../../convex/_generated/dataModel";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface UPIPaymentProps {
  eventId: Id<"events">;
  eventName: string;
  amount: number;
}

export default function UPIPayment({ eventId, eventName, amount }: UPIPaymentProps) {
  const [loading, setLoading] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const [uid, setUid] = useState("");
  const [paymentSuccessful, setPaymentSuccessful] = useState(false);

  const handleUPIPayment = async () => {
    setShowQrCode(true);
  };

  const handleUidSubmit = async () => {
    setLoading(true); // Indicate that verification is in progress

    try {
      const result = await verifyUpiPayment({ uid, eventId, amount });
      if (result.success) {
        setPaymentSuccessful(true);
        // Optionally redirect to success page or show a success message
        window.location.href = `/tickets/purchase-success?payment_id=${uid}`;
      } else {
        alert(result.message);
        setPaymentSuccessful(false); // Ensure it's false on failure
      }
    } catch (error) {
      console.error("UPI verification failed:", error);
      alert("An error occurred during verification. Please try again.");
      setPaymentSuccessful(false);
    } finally {
      setLoading(false); // End loading
    }
  };

  return (
    <div className="flex flex-col items-center">
      {!showQrCode && (
        <button
          onClick={handleUPIPayment}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Processing..." : `Pay ₹${amount} via QR Code`}
        </button>
      )}

      {showQrCode && !paymentSuccessful && (
        <div className="flex flex-col items-center mt-4">
          <p className="text-lg font-semibold mb-2">Scan to Pay</p>
          <img src="/event-images/QR .jpg" alt="QR Code" className="w-64 h-64 object-contain" />
          <p className="text-sm text-gray-500 mt-2">Please scan the QR code to complete your payment.</p>
          <div className="mt-4 w-full">
            <input
              type="text"
              placeholder="Enter Payment UTR/Reference Number (optional)"
              value={uid}
              onChange={(e) => setUid(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
            <button
              onClick={handleUidSubmit}
              className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 mt-2"
            >
              Submit Payment UID
            </button>
          </div>
        </div>
      )}

      {paymentSuccessful && (
        <div className="mt-4 text-green-600 font-semibold">
          Payment successful! Your UID number is: {uid || "N/A"}
          {/* Here you would typically redirect to a success page or show further instructions */}
        </div>
      )}
    </div>
  );
}