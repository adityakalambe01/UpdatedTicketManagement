"use client";

import Image from "next/image";
import Link  from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/nextjs";
import SearchBar from "./SearchBar";

function Header() {
  const { isLoaded } = useUser();

  return (
    <div className="border-b relative z-40">
      <div className="flex flex-col lg:flex-row items-center gap-4 p-4">
        <div className="flex items-center justify-between w-full lg:w-auto">
          <Link href="/" className="font-bold shrink-0">
            <Image
              src="https://res.cloudinary.com/dths6fn80/image/upload/v1757783574/logo_xbkhuu.png"
              alt="logo"
              width={100}
              height={100}
              className="w-24 lg:w-28"
              priority
            />
          </Link>

          {isLoaded && (
          <div className="lg:hidden flex items-center relative z-50">
            <SignedIn>
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10 border-2 border-gray-200 shadow-sm",
                    userButtonPopoverRootBox: "z-50"
                  }
                }}
              />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="bg-gray-100 text-gray-800 px-3 py-1.5 text-sm rounded-lg hover:bg-gray-200 transition border border-gray-300">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        )}
        </div>

        {/* Search Bar - full width on mobile*/}
        <div className="w-full lg:max-w-2xl">
          <SearchBar />
        </div>

        {/* Desktop Action Buttons */}
        <div className="hidden lg:block ml-auto">
          <SignedIn>
            <div className="flex items-center gap-3">
              <Link href="/seller/new-event">
                <button className="bg-blue-600 text-white px-3 py-1.5 text-sm rounded-lg
                hover:bg-blue-700 transition">
                  Sell Tickets
                </button>
              </Link>

            <Link href="/tickets">
              <button className="bg-gray-100 text-gray-800 px-3 py-1.5 text-sm rounded-lg
              hover:bg-gray-200 transition border border-gray-300">
                My Tickets
              </button>
            </Link>
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8 border-2 border-gray-200 shadow-sm",
                  userButtonPopoverCard: "z-50",
                  userButtonPopoverRootBox: "z-50"
                }
              }}
            />
            </div>
          </SignedIn>

          <SignedOut>
            <SignInButton mode="modal">
              <button className="bg-gray-100 text-gray-800 px-3 py-1.5 text-sm rounded-lg
              hover:bg-gray-200 transition border border-gray-300">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
        </div>

        {/* Mobile Action Buttons */}
        <div className="lg:hidden w-full flex justify-center gap-3">
          <SignedIn>
            <Link href="/seller/new-event" className="flex-1">
              <button className="w-full bg-blue-600 text-white px-3 py-1.5 text-sm rounded-lg
              hover:bg-blue-700 transition">
                Sell Tickets
              </button>
            </Link>

            <Link href="/tickets" className="flex-1">
              <button className="w-full bg-gray-100 text-gray-800 px-3 py-1.5 text-sm rounded-lg
              hover:bg-gray-200 transition border border-gray-300">
                My Tickets
              </button>
            </Link>
          </SignedIn>
        </div>
      </div>
    </div>
  );
}

export default Header;