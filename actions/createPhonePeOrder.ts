"use server";

import { getConvexClient } from "@/lib/convex";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { auth } from "@clerk/nextjs/server";
import crypto from "crypto";

export async function createPhonePeOrder({
											 eventId,
										 }: {
	eventId: Id<"events">;
}) {
	const { userId } = await auth();
	if (!userId) throw new Error("Not authenticated");

	// 🔑 Check required environment variables
	if (
		!process.env.PHONEPE_MERCHANT_ID ||
		!process.env.PHONEPE_CLIENT_ID ||
		!process.env.PHONEPE_CLIENT_SECRET
	) {
		throw new Error("PhonePe credentials are missing");
	}

	const merchantId = process.env.PHONEPE_MERCHANT_ID!;
	const clientSecret = process.env.PHONEPE_CLIENT_SECRET!;
	const clientVersion = process.env.PHONEPE_CLIENT_VERSION || "1";
	const env = process.env.PHONEPE_ENV || "SANDBOX";

	const convex = getConvexClient();
	const event = await convex.query(api.events.getById, { eventId });
	if (!event) throw new Error("Event not found");

	const queuePosition = await convex.query(api.waitingList.getQueuePosition, {
		eventId,
		userId,
	});

	if (!queuePosition || queuePosition.status !== "offered") {
		throw new Error("No valid ticket offer found");
	}

	// 📌 Generate transaction ID
	const merchantTransactionId = `txn_${eventId}_${userId}_${Date.now()}`;

	// 📌 Prepare payload
	const payload = {
		merchantId,
		merchantTransactionId,
		merchantUserId: userId,
		amount: Math.round(event.price * 100), // in paise
		redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success?transactionId=${merchantTransactionId}`,
		redirectMode: "POST",
		callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/phonepe-callback`,
		paymentInstrument: {
			type: "PAY_PAGE",
		},
	};

	// 📌 Base64 encode payload
	const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64");

	// 📌 Create checksum
	const stringToSign = base64Payload + "/pg/v1/pay" + clientSecret;
	const checksum = crypto.createHash("sha256").update(stringToSign).digest("hex");
	const xVerify = `${checksum}###${clientVersion}`;

	// 📌 Base URL
	const phonePeBaseUrl =
		env === "PROD"
			? "https://api.phonepe.com/apis/pg/v1"
			: "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1";

	// 📌 Call PhonePe API
	const response = await fetch(`${phonePeBaseUrl}/pay`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"X-VERIFY": xVerify,
			"X-MERCHANT-ID": merchantId,
		},
		body: JSON.stringify({ request: base64Payload }),
	});

	const data = await response.json();

	if (!response.ok || !data.success) {
		throw new Error(data.message || "PhonePe order creation failed");
	}

	return {
		success: true,
		merchantTransactionId,
		redirectUrl: data.data?.instrumentResponse?.redirectInfo?.url,
	};
}
