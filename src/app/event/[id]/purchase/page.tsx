"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { useState,  useMemo } from "react";
import { ArrowLeft, Plus, Minus, Tag, Check } from "lucide-react";
import Spinner from "@/components/Spinner";
import { Button } from "@/components/ui/button";
// Removed: import Image from "next/image"; // Removed remote's Image import
import CouponInput from "@/components/CouponInput";
import {ToastService} from "../../../../../services/toaster.service";
// Removed: import { useAction } from "convex/react"; // No longer needed as we removed the UPI action

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PurchasePage() {
  // All hooks are called unconditionally at the top level
  const { user } = useUser();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  // Correctly assign eventId from params.id and passId from searchParams
  const eventId = params.id as Id<"events">;
  const currentPassId = searchParams.get("passId") as Id<"passes">;
  const urlSelectedDates = searchParams.get("selectedDates");

  const event = useQuery(api.events.getById, eventId ? { eventId } : "skip");
  const allPasses = useQuery(api.passes.getEventPasses, eventId ? { eventId } : "skip");
  const fetchedPass = useQuery(api.passes.getPassById, currentPassId ? { passId: currentPassId } : "skip");
	console.log(fetchedPass)
  
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDates, setSelectedDates] = useState<string[]>(urlSelectedDates ? urlSelectedDates.split(',') : []);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountPercentage: number;
    discountAmount: number;
    finalAmount: number;
    couponId?: string;
  } | null>(null);
  // Removed: const [showUpiPayment, setShowUpiPayment] = useState(false); // Removed remote's UPI state
  // Removed: const [uidInput, setUidInput] = useState(""); // Removed remote's UPI state

  // Removed: const createUpiPayment = useMutation(api.upi.createUpiPayment); // Removed remote's UPI mutation

  const selectedPass = fetchedPass; // Now correctly refers to the specific pass fetched
  
  const getOriginalAmount = () => {
    if (!selectedPass) return 0;
    return selectedPass.price * quantity;
  };
  
  const originalAmount = getOriginalAmount();
  const totalAmount = useMemo(() => {
    return appliedCoupon ? appliedCoupon.finalAmount : originalAmount;
  }, [appliedCoupon, originalAmount]);
  const availableQuantity = selectedPass ? selectedPass.totalQuantity - selectedPass.soldQuantity : 0;
  
  // Conditional rendering based on hook results, after all hooks are called
  if (!event || !fetchedPass || !selectedPass) { 
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    const maxAllowed = Math.min(availableQuantity, 10);
    if (newQuantity >= 1 && newQuantity <= maxAllowed) {
      setQuantity(newQuantity);
    }
  };

  const handlePurchase = async () => {
    if (!user || !event || !selectedPass) return;
  
    try {
      setIsLoading(true);
      
      // Prepare the order data
      const orderData = {
        amount: totalAmount,
        eventId: eventId,
        userId: user.id,
        quantity: quantity,
        passId: currentPassId,
        couponCode: appliedCoupon?.code || null,
        couponId: appliedCoupon?.couponId || null,
        selectedDates: selectedDates,
      };

      // Make API call to create order
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }
      
      const order = await response.json();
      // Redirect to PhonePe payment page using SDK's redirectUrl
      if (order.redirectUrl) {
        window.open(order.redirectUrl);
      } else {
        alert('Payment failed. Please try again.');
        return;
      }

      // Save to localStorage for later use (e.g., marking coupon as used)
      localStorage.setItem('lastEventId', eventId);
      localStorage.setItem('lastUserId', user.id);
      localStorage.setItem('lastQuantity', quantity.toString());
      localStorage.setItem('lastAmount', totalAmount.toString());
      localStorage.setItem('lastPassId', currentPassId);
      if (appliedCoupon) {
        localStorage.setItem('lastCouponCode', appliedCoupon.code);
        localStorage.setItem('lastCouponId', appliedCoupon.couponId || '');

        // Mark coupon as used by this user for this event
        try {
          fetch('/api/mark-coupon-used', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              code: appliedCoupon.code,
              couponId: appliedCoupon.couponId,
              userId: user.id,
              eventId: eventId
            })
          });
        } catch (error) {
          console.error("Error marking coupon as used:", error);
          // Continue with purchase even if marking coupon fails
        }
      }

      // Redirect to success page after a short delay
      setTimeout(() => {
        router.push(`/tickets/purchase-success?payment_id=${order.orderId}`);
      }, 2000);
    } catch (error) {
      console.error("Error creating payment:", error);
      ToastService.error('Payment failed. Please try again.')
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Passes
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Complete Your Purchase
          </h1>
          <p className="text-gray-600">
            {event.name}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Selected Pass Info */}
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Tag className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {selectedPass.name}
                </h3>
                <p className="text-gray-600 mb-3">
                  {selectedPass.description}
                </p>
                <div className="text-2xl font-bold text-gray-900">
                  ₹{selectedPass.price.toFixed(2)} per ticket
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {selectedPass.totalQuantity} / {availableQuantity} available
                </div>
                {(selectedPass.category === "Seasonal Pass" || selectedPass.name?.toLowerCase().includes("seasonal")) && selectedDates.length > 1 && (
                  <div className="text-sm text-blue-600 mt-1">
                    Total: ₹{(selectedPass.price * selectedDates.length).toFixed(2)} for {selectedDates.length} dates
                  </div>
                )}
              </div>
            </div>

            {/* Benefits */}
            {selectedPass.benefits.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold text-gray-900 mb-3">
                  What's included:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedPass.benefits.map((benefit, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 text-sm text-gray-600"
                    >
                      <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Date Selector for Seasonal Pass 
          {(selectedPass?.category === "Seasonal Pass" || selectedPass?.name?.toLowerCase().includes("seasonal")) && (
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <DateSelector
                selectedDates={selectedDates}
                onDateChange={setSelectedDates}
                disabled={isLoading}
              />
            </div>
          )} */}

          {/* Quantity Selector */}
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Quantity</h4>
                <p className="text-sm text-gray-600">
                  Select number of tickets
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="w-10 h-10 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-semibold text-lg">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= Math.min(availableQuantity, 10)}
                  className="w-10 h-10 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Coupon Code */}
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <CouponInput
              originalAmount={originalAmount}
              eventId={eventId}
              onCouponApplied={(discountInfo) => setAppliedCoupon(discountInfo)}
              onCouponRemoved={() => setAppliedCoupon(null)}
            />
          </div>

          {/* Total & Purchase */}
          <div className="p-4 sm:p-6">
            <div className="space-y-3 mb-6">
              {/* Show breakdown for Seasonal Pass with multiple dates */}
              {(selectedPass?.category === "Seasonal Pass" || selectedPass?.name?.toLowerCase().includes("seasonal")) && selectedDates.length > 1 ? (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">
                      Pass Price (×{quantity}):
                    </span>
                    <span className="text-gray-900">
                      ₹{(selectedPass.price * quantity).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">
                      Dates Selected (×{selectedDates.length}):
                    </span>
                    <span className="text-gray-900">
                      ₹{(selectedPass.price * quantity * selectedDates.length).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <span className="text-gray-600 font-medium">
                      Subtotal:
                    </span>
                    <span className="text-gray-900 font-medium">
                      ₹{originalAmount.toFixed(2)}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">
                    Subtotal:
                  </span>
                  <span className="text-gray-900">
                    ₹{originalAmount.toFixed(2)}
                  </span>
                </div>
              )}
              
              {appliedCoupon && (
                <div className="flex justify-between items-center text-green-600">
                  <span>
                    Discount ({appliedCoupon.discountPercentage}%):
                  </span>
                  <span>
                    -₹{appliedCoupon.discountAmount.toFixed(2)}
                  </span>
                </div>
              )}
              
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <span className="text-lg font-semibold text-gray-900">
                  Total Amount:
                </span>
                <span className="text-2xl font-bold text-gray-900">
                  ₹{totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <Button
                onClick={handlePurchase}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-4 rounded-lg text-lg transition-all duration-200"
              >
                {isLoading ? "Processing..." : `Pay ₹${totalAmount.toFixed(2)} with PhonePe`}
              </Button>
            </div>

            {user && (
              <p className="text-xs text-gray-500 text-center mt-3">
                Secure payment powered by PhonePe
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
    
    );
}