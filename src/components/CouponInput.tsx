"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tag, Check, X, Loader2 } from "lucide-react";

interface CouponInputProps {
  originalAmount: number;
  eventId?: string;
  onCouponApplied: (discountInfo: {
    code: string;
    discountPercentage: number;
    discountAmount: number;
    finalAmount: number;
    couponId: string;
  }) => void;
  onCouponRemoved: () => void;
}

export default function CouponInput({
  originalAmount,
  eventId,
  onCouponApplied,
  onCouponRemoved,
}: CouponInputProps) {
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get current user
  const { user } = useUser();
  
  // Ensure coupon exists (useful for dev/demo codes like YOLO15)
  const ensureCouponExists = useMutation(api.coupons.ensureCouponExists);
  const createYoloClubCoupon = useMutation(api.coupons.createYoloClubCoupon);

  // Query for discount calculation when a coupon is applied
  const discountInfo = useQuery(
    api.coupons.calculateDiscountedAmount,
    appliedCoupon && user
      ? {
          code: appliedCoupon,
          amount: originalAmount,
          userId: user.id,
          eventId: eventId as any
        }
      : "skip"
  );

  // Update parent component when discount changes
  useEffect(() => {
    if (!discountInfo || !appliedCoupon || !user) return;
    
    // Store current values to avoid stale closures
    const currentCoupon = appliedCoupon;
    const currentDiscountInfo = discountInfo;
    
    if (currentDiscountInfo.success) {
      try {
        onCouponApplied({
          code: currentCoupon,
          discountPercentage: currentDiscountInfo.discountPercentage ?? 0,
          discountAmount: currentDiscountInfo.discountAmount ?? 0,
          finalAmount: currentDiscountInfo.finalAmount ?? originalAmount,
          couponId: currentDiscountInfo.couponId ?? ''
        });
      } catch (error) {
        console.error("Error applying coupon:", error);
        setError("Failed to apply coupon");
        setAppliedCoupon(null);
      }
    } else {
      setError(currentDiscountInfo.message || "Invalid coupon");
      setAppliedCoupon(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discountInfo, appliedCoupon, user, originalAmount]);

  // Handle coupon code input change
  const handleCouponChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCouponCode(e.target.value.toUpperCase());
    setError(null);
  };

  // Apply coupon
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setError("Please enter a coupon code");
      return;
    }

    if (!user) {
      setError("Please sign in to apply a coupon");
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      // Best-effort ensure code exists in dev, then apply
      try {
        if (couponCode === "YOLO-CLUB") {
          await createYoloClubCoupon();
        } else {
          await ensureCouponExists({ code: couponCode });
        }
      } catch {}
      setAppliedCoupon(couponCode);
    } catch (err) {
      setError("Failed to apply coupon");
      console.error("Error applying coupon:", err);
    } finally {
      setIsValidating(false);
    }
  };

  // Remove applied coupon
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setError(null);
    onCouponRemoved();
  };

  // This effect is now handled in the main useEffect above

  return (
    <div className="space-y-3">
      <div className="flex items-center">
        <Tag className="w-4 h-4 mr-2 text-gray-600" />
        <h4 className="font-medium text-gray-900">Coupon Code</h4>
      </div>

      {appliedCoupon && discountInfo?.success ? (
        <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center">
            <Check className="w-4 h-4 text-green-600 mr-2" />
            <div>
              <p className="font-medium text-green-800">{appliedCoupon}</p>
              <p className="text-sm text-green-700">
                {discountInfo.discountPercentage}% off applied
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemoveCoupon}
            className="text-gray-600 hover:text-gray-900"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={handleCouponChange}
              className={`${error ? "border-red-300" : ""}`}
              disabled={isValidating}
            />
            {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
          </div>
          <Button
            onClick={handleApplyCoupon}
            disabled={isValidating || !couponCode.trim()}
            className="whitespace-nowrap"
          >
            {isValidating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Validating
              </>
            ) : (
              "Apply"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}