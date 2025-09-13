"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { api } from "../../convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import ReleaseTicket from "./ReleaseTicket";
import {
	Ticket,
	Plus,
	Minus,
	Clock,
	OctagonXIcon,
	LoaderCircle,
	CircleArrowRight,
} from "lucide-react";
import { Id } from "../../convex/_generated/dataModel";
import { WAITING_LIST_STATUS } from "../../convex/constants";
import { toast } from "sonner";
import { ConvexError } from "convex/values";

export default function PurchaseTicket({ eventId }: { eventId: Id<"events"> }) {
	const router = useRouter();
	const { user } = useUser();

	const event = useQuery(api.events.getById, { eventId });
	const queuePosition = useQuery(api.waitingList.getQueuePosition, {
		eventId,
		userId: user?.id ?? "",
	});
	const availability = useQuery(api.events.checkAvailability, { eventId });
	const userTicket = useQuery(api.tickets.getUserTicketForEvent, {
		eventId,
		userId: user?.id ?? "",
	});
	const joinWaitingList = useMutation(api.events.joinWaitingList);

	const [timeRemaining, setTimeRemaining] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [quantity, setQuantity] = useState(1);

	const offerExpiresAt = queuePosition?.offerExpiresAt ?? 0;
	const isExpired = Date.now() > offerExpiresAt;
	const totalAmount = event ? event.price * quantity : 0;
	const isEventOwner = user?.id === event?.userId;
	const isPastEvent = event ? event.eventDate < Date.now() : false;

	// Countdown timer
	useEffect(() => {
		const calculateTimeRemaining = () => {
			if (isExpired) {
				setTimeRemaining("Expired");
				return;
			}

			const diff = offerExpiresAt - Date.now();
			const minutes = Math.floor(diff / 1000 / 60);
			const seconds = Math.floor((diff / 1000) % 60);

			if (minutes > 0) {
				setTimeRemaining(
					`${minutes} minute${minutes === 1 ? "" : "s"} ${seconds} second${
						seconds === 1 ? "" : "s"
					}`
				);
			} else {
				setTimeRemaining(`${seconds} second${seconds === 1 ? "" : "s"}`);
			}
		};

		calculateTimeRemaining();
		const interval = setInterval(calculateTimeRemaining, 1000);
		return () => clearInterval(interval);
	}, [offerExpiresAt, isExpired]);

	const handleQuantityChange = (change: number) => {
		const newQuantity = quantity + change;
		const maxAvailable = availability
			? availability.totalTickets - availability.purchasedCount
			: 1;
		const maxAllowed = Math.min(maxAvailable, 10);
		if (newQuantity >= 1 && newQuantity <= maxAllowed) {
			setQuantity(newQuantity);
		}
	};

	const handleJoinQueue = async () => {
		if (!user) return;

		try {
			const result = await joinWaitingList({ eventId, userId: user.id });
			if (result.success) {
				toast.success("Joined queue successfully!");
			}
		} catch (error) {
			if (
				error instanceof ConvexError &&
				error.message.includes("joined the waiting list too many times")
			) {
				toast.error("Slow down there!", {
					description: error.data,
					duration: 5000,
				});
			} else {
				console.error("Error joining waiting list:", error);
				toast.error("Uh oh! Something went wrong.", {
					description: "Failed to join queue. Please try again later.",
				});
			}
		}
	};

	const handlePurchase = async () => {
		if (!user || !event || !queuePosition) return;

		try {
			setIsLoading(true);

			const response = await fetch("/api/create-phonepe-order", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					amount: totalAmount,
					eventId: eventId,
					userId: user.id,
					waitingListId: queuePosition._id,
					quantity: quantity,
				}),
			});

			if (!response.ok) {
				const errorText = await response.text();
				console.error("API Error:", errorText);
				throw new Error(`API Error: ${response.status} - ${errorText}`);
			}

			const data = await response.json();
			if (data.error) {
				toast.error(data.error);
				return;
			}

			// Redirect user to PhonePe payment page
			window.location.href = data.redirectUrl;
		} catch (error) {
			console.error("Error creating payment:", error);
			alert("Payment failed. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const renderQueuePosition = () => {
		if (!queuePosition || queuePosition.status !== "waiting") return null;

		if (availability && availability.purchasedCount >= availability.totalTickets) {
			return (
				<div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
					<div className="flex items-center">
						<Ticket className="w-5 h-5 text-gray-400 mr-2" />
						<span className="text-gray-600">Event is sold out</span>
					</div>
				</div>
			);
		}

		if (queuePosition.position === 1) {
			return (
				<div className="flex flex-col lg:flex-row items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-100">
					<div className="flex items-center">
						<CircleArrowRight className="w-5 h-5 text-amber-500 mr-2" />
						<span className="text-amber-700 font-medium">
              You're next in line! (Queue position: {queuePosition.position})
            </span>
					</div>
					<div className="flex items-center">
						<LoaderCircle className="w-4 h-4 mr-1 animate-spin text-amber-500" />
						<span className="text-amber-600 text-sm">Waiting for ticket</span>
					</div>
				</div>
			);
		}

		return (
			<div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
				<div className="flex items-center">
					<LoaderCircle className="w-4 h-4 mr-2 animate-spin text-blue-500" />
					<span className="text-blue-700">Queue position</span>
				</div>
				<span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
          #{queuePosition.position}
        </span>
			</div>
		);
	};

	if (!user || !event || !availability) {
		return null;
	}

	// If user has an active offer, show the purchase interface
	if (queuePosition && queuePosition.status === "offered") {
		return (
			<div className="bg-white p-6 rounded-xl shadow-lg border border-amber-200">
				<div className="space-y-4">
					<div className="bg-white rounded-lg p-6 border border-gray-200">
						<div className="flex flex-col gap-4">
							<div className="flex items-center gap-3">
								<div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
									<Ticket className="w-6 h-6 text-amber-600" />
								</div>
								<div>
									<h3 className="text-lg font-semibold text-gray-900">
										Ticket Reserved
									</h3>
									<p className="text-sm text-gray-500">
										Expires in {timeRemaining}
									</p>
								</div>
							</div>

							<div className="text-sm text-gray-600 leading-relaxed">
								A ticket has been reserved for you. Complete your purchase before
								the timer expires to secure your spot at this event.
							</div>
						</div>
					</div>

					{/* Quantity Selector */}
					<div className="bg-gray-50 rounded-lg p-4">
						<div className="flex items-center justify-between">
							<div>
								<h4 className="font-medium text-gray-900">Quantity</h4>
								<p className="text-sm text-gray-600">₹{event?.price} per ticket</p>
							</div>
							<div className="flex items-center gap-3">
								<button
									onClick={() => handleQuantityChange(-1)}
									disabled={quantity <= 1}
									className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
								>
									<Minus className="w-4 h-4" />
								</button>
								<span className="w-8 text-center font-medium">{quantity}</span>
								<button
									onClick={() => handleQuantityChange(1)}
									disabled={
										quantity >=
										Math.min(
											availability
												? availability.totalTickets - availability.purchasedCount
												: 1,
											10
										)
									}
									className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
								>
									<Plus className="w-4 h-4" />
								</button>
							</div>
						</div>
						<div className="mt-2 text-right">
              <span className="text-lg font-bold text-gray-900">
                Total: ₹{totalAmount}
              </span>
						</div>
					</div>

					<button
						onClick={handlePurchase}
						disabled={isExpired || isLoading}
						className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white px-8 py-4 rounded-lg font-bold shadow-md hover:from-amber-600 hover:to-amber-700 transform hover:scale-[1.02] transition-all duration-200 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:hover:scale-100 text-lg"
					>
						{isLoading
							? "Redirecting to PhonePe..."
							: `Pay ₹${totalAmount} with UPI/Card →`}
					</button>

					<div className="mt-4">
						<ReleaseTicket eventId={eventId} waitingListId={queuePosition._id} />
					</div>
				</div>
			</div>
		);
	}

	// Show queue status or join button
	return (
		<div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
			<div className="space-y-4">
				{/* Show queue position if user is in queue */}
				{queuePosition && queuePosition.status === "waiting" && (
					<div className="space-y-3">
						<h3 className="text-lg font-semibold text-gray-900">
							You're in the queue!
						</h3>
						{renderQueuePosition()}
					</div>
				)}

				{/* Show join queue button if not in queue or expired */}
				{(!queuePosition ||
					queuePosition.status === WAITING_LIST_STATUS.EXPIRED ||
					(queuePosition.status === WAITING_LIST_STATUS.OFFERED &&
						queuePosition.offerExpiresAt &&
						queuePosition.offerExpiresAt <= Date.now())) && (
					<>
						{isEventOwner ? (
							<div className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-lg">
								<OctagonXIcon className="w-5 h-5" />
								<span>You cannot buy a ticket for your own event</span>
							</div>
						) : isPastEvent ? (
							<div className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gray-100 text-gray-500 rounded-lg cursor-not-allowed">
								<Clock className="w-5 h-5" />
								<span>Event has ended</span>
							</div>
						) : availability.purchasedCount >= availability.totalTickets ? (
							<div className="text-center p-4">
								<p className="text-lg font-semibold text-red-600">
									Sorry, this event is sold out
								</p>
							</div>
						) : (
							<div className="space-y-3">
								<h3 className="text-lg font-semibold text-gray-900">
									Get Your Ticket
								</h3>
								<p className="text-gray-600 text-sm">
									Join the queue to purchase your ticket for this event.
								</p>
								<button
									onClick={() => router.push(`/event/${eventId}/passes`)}
									disabled={isPastEvent || isEventOwner}
									className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 shadow-md flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
								>
									Select Pass
								</button>
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
}
