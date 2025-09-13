"use server";

import crypto from "crypto";

export async function testPhonePe() {
	try {
		// ✅ Check environment variables
		if (!process.env.PHONEPE_MERCHANT_ID) {
			throw new Error("PHONEPE_MERCHANT_ID is missing");
		}
		if (!process.env.PHONEPE_CLIENT_ID) {
			throw new Error("PHONEPE_CLIENT_ID is missing");
		}
		if (!process.env.PHONEPE_CLIENT_SECRET) {
			throw new Error("PHONEPE_CLIENT_SECRET is missing");
		}

		const merchantId = process.env.PHONEPE_MERCHANT_ID!;
		const clientId = process.env.PHONEPE_CLIENT_ID!;
		const clientSecret = process.env.PHONEPE_CLIENT_SECRET!;
		const clientVersion = process.env.PHONEPE_CLIENT_VERSION || "1";
		const env = process.env.PHONEPE_ENV || "SANDBOX";

		// Base URL
		const phonePeBaseUrl =
			env === "PROD"
				? "https://api.phonepe.com/apis/pg-sandbox/pg/v1"
				: "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1";

		// Create a test transaction ID
		const merchantTransactionId = `test_txn_${Date.now()}`;

		// Sample payload
		const payload = {
			merchantId,
			merchantTransactionId,
			merchantUserId: "test_user",
			amount: 100, // 1 rupee in paise
			redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success?transactionId=${merchantTransactionId}`,
			redirectMode: "POST",
			callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/phonepe-callback`,
			paymentInstrument: {
				type: "PAY_PAGE",
			},
		};

		// Encode payload
		const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64");

		// Create checksum
		const stringToSign = base64Payload + "/pg/v1/pay" + clientSecret;
		const checksum = crypto
			.createHash("sha256")
			.update(stringToSign)
			.digest("hex");
		const xVerify = `${checksum}###${clientVersion}`;

		// Call PhonePe API
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

		if (response.ok && data.success) {
			return {
				success: true,
				merchantTransactionId,
				redirectUrl: data.data?.instrumentResponse?.redirectInfo?.url || null,
			};
		} else {
			return {
				success: false,
				error: data.message || "PhonePe API error",
				raw: data,
			};
		}
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
			env: {
				merchantId: process.env.PHONEPE_MERCHANT_ID ? "Present" : "Missing",
				clientId: process.env.PHONEPE_CLIENT_ID ? "Present" : "Missing",
				clientSecret: process.env.PHONEPE_CLIENT_SECRET ? "Present" : "Missing",
			},
		};
	}
}
