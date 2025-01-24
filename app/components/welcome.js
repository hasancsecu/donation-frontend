"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FaHandHoldingHeart, FaSignInAlt, FaDonate } from "react-icons/fa";

export default function Welcome() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full md:w-[60%] lg:w-[40%]">
        <div className="flex flex-col items-center text-center mb-6">
          <FaHandHoldingHeart className="text-green-500 text-6xl mb-4" />
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome to Our Donation Platform
          </h1>
          <p className="text-gray-600 mt-4">
            Join hands to make a difference! Your contributions help us support
            communities worldwide. Together, we can create lasting change.
          </p>
        </div>

        {!isLoggedIn ? (
          <>
            <div className="flex flex-wrap justify-center items-center gap-5 mt-6">
              <Link href="/auth/sign-in">
                <button className="flex items-center gap-2 bg-green-500 text-white py-2 px-6 rounded-md hover:bg-green-600 transition">
                  <FaSignInAlt className="text-white" />
                  Sign In and Donate
                </button>
              </Link>
              <Link href="/donate">
                <button className="flex items-center gap-2 bg-gray-500 text-white py-2 px-6 rounded-md hover:bg-gray-600 transition">
                  <FaDonate className="text-white" />
                  Donate Without Signing In
                </button>
              </Link>
            </div>
            <div className="text-sm text-gray-500 mt-4">
              <p>
                <strong>Note:</strong> If you sign in, you can view and manage
                your donation history.
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-center items-center mt-6">
              <Link href="/donate">
                <button className="flex items-center gap-2 bg-green-500 text-white py-2 px-6 rounded-md hover:bg-green-600 transition">
                  <FaDonate className="text-white" />
                  Make a Donation
                </button>
              </Link>
            </div>
            <div className="text-sm text-gray-500 mt-4">
              Thank you for your continued support! You are making a real
              difference in the world.
            </div>
          </>
        )}
      </div>
    </main>
  );
}
