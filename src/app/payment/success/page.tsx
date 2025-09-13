"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import {ToastService} from "../../../../services/toaster.service";

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const transactionId = searchParams.get("transactionId");

  useEffect(() => {
    if (transactionId) {
      fetch("/api/verify-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.verified) {
            router.replace(`/tickets/purchase-success?payment_id=${transactionId}`);
          } else {
            // Show error or redirect to failure page
            ToastService.error("Transaction verification failed!");
			router.replace(`/`);
		  }
        })
        .catch(() => {
          ToastService.error("An error occurred while verifying the transaction.")
        });
    }
  }, [transactionId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div>Verifying your payment...</div>
    </div>
  );
}

