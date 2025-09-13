import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import { ClerkProvider, ClerkLoaded, ClerkLoading } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import Header from "@/components/Header";
import SyncUserWithConvex from "@/components/SyncUserWithConvex";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
	title: "Ticketr - Your ultimate event ticketing solution.",
	description:
		"Ticketr helps you create, manage, and sell tickets for your events.",
};

export default function RootLayout({
									   children,
								   }: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" suppressHydrationWarning>
		<body className={GeistSans.className}>
		<ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
			<ConvexClientProvider>
				<SyncUserWithConvex />

				{/* 🔄 Loading state while Clerk is initializing */}
				<ClerkLoading>
					<div className="flex flex-col items-center justify-center h-screen space-y-4">
						<div className="w-3/4 h-12 bg-gray-300 animate-pulse rounded-lg" />
						<div className="w-5/6 h-64 bg-gray-200 animate-pulse rounded-xl" />
					</div>
				</ClerkLoading>

				{/* ✅ App Layout once Clerk is ready */}
				<ClerkLoaded>
					<div className="min-h-screen flex flex-col">
						<Header />
						<main className="flex-1">{children}</main>
						<Footer />
					</div>
				</ClerkLoaded>

				<Toaster />
			</ConvexClientProvider>
		</ClerkProvider>
		</body>
		</html>
	);
}
