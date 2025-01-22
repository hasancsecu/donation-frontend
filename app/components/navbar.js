"use client";

import { jwtDecode } from "jwt-decode";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setIsLoggedIn(true);
        setIsAdmin(decodedToken?.role === "admin");
      } catch (error) {
        console.error("Failed to decode token:", error);
        setIsLoggedIn(false);
      }
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  return (
    <nav className="bg-blue-500 text-white fixed top-0 w-full z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/">
              <span className="text-lg font-semibold">App</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-4">
            <Link href="/">
              <span className="hover:bg-blue-600 px-3 py-2 rounded-md">
                Home
              </span>
            </Link>
            {!isLoggedIn ? (
              <>
                <Link href="/auth/sign-in">
                  <span className="hover:bg-blue-600 px-3 py-2 rounded-md">
                    Sign In
                  </span>
                </Link>
                <Link href="/auth/sign-up">
                  <span className="hover:bg-blue-600 px-3 py-2 rounded-md">
                    Sign Up
                  </span>
                </Link>
              </>
            ) : isAdmin ? (
              <>
                <Link href="/donation-report">
                  <span className="hover:bg-blue-600 px-3 py-2 rounded-md">
                    Donation Report
                  </span>
                </Link>
              </>
            ) : (
              <>
                <Link href="/donate">
                  <span className="hover:bg-blue-600 px-3 py-2 rounded-md">
                    Donate
                  </span>
                </Link>
                <Link href="/my-donations">
                  <span className="hover:bg-blue-600 px-3 py-2 rounded-md">
                    My Donations
                  </span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-blue-600">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link href="/" onClick={() => setIsOpen(!isOpen)}>
              <span className="block hover:bg-blue-700 px-3 py-2 rounded-md">
                Home
              </span>
            </Link>
            {!isLoggedIn ? (
              <>
                <Link href="/auth/sign-in" onClick={() => setIsOpen(!isOpen)}>
                  <span className="block hover:bg-blue-700 px-3 py-2 rounded-md">
                    Sign In
                  </span>
                </Link>
                <Link href="/auth/sign-up" onClick={() => setIsOpen(!isOpen)}>
                  <span className="block hover:bg-blue-700 px-3 py-2 rounded-md">
                    Sign Up
                  </span>
                </Link>
              </>
            ) : isAdmin ? (
              <>
                <Link
                  href="/donation-report"
                  onClick={() => setIsOpen(!isOpen)}
                >
                  <span className="block hover:bg-blue-700 px-3 py-2 rounded-md">
                    Donation Report
                  </span>
                </Link>
              </>
            ) : (
              <>
                <Link href="/donate" onClick={() => setIsOpen(!isOpen)}>
                  <span className="block hover:bg-blue-700 px-3 py-2 rounded-md">
                    Donate
                  </span>
                </Link>
                <Link href="/my-donations" onClick={() => setIsOpen(!isOpen)}>
                  <span className="block hover:bg-blue-700 px-3 py-2 rounded-md">
                    My Donations
                  </span>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
