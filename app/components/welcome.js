"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Welcome() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <main className="flex items-center justify-center min-h-screen">
      <div>
        <div className="flex justify-center text-center">
          <div className="w-full md:w-[75%] text-xl  font-semibold mb-5">
            Welcome to our platform! Our worldwide services require your
            support. Please support us with your valuable donations....
          </div>
        </div>
        {!isLoggedIn ? (
          <>
            <div className="flex justify-center items-center gap-5">
              <Link href="/auth/sign-in">
                <button className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600">
                  Sign In and Donate
                </button>
              </Link>
              <Link href="/donate">
                <button className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600">
                  Donate Without Signing in
                </button>
              </Link>
            </div>
            <div className="flex justify-center items-center text-center text-sm font-base mt-3">
              Note: If you Sign in and donate, then you can see your donation
              history.
            </div>{" "}
          </>
        ) : (
          <>
            <div className="flex justify-center items-center">
              <Link href="/donate">
                <button className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600">
                  Make a Donation
                </button>
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
