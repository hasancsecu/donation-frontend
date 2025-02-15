"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { FaSignInAlt, FaSpinner } from "react-icons/fa";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/");
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    if (!email || !validateEmail(email)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        email: "Please provide a valid Email.",
      }));
      return;
    }
    if (!password) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        password: "Please provide password.",
      }));
      return;
    }
    setLoading(true);
    const loadingToastId = toast.loading("Signing in...");

    try {
      const response = await fetch(`${process.env.API_URL}auth/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();

        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);

        toast.dismiss(loadingToastId);
        toast.success("Signed in successfully!");

        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        const error = await response.json();
        toast.dismiss(loadingToastId);
        toast.error(error.message || "Failed to sign in. Please try again.");
      }
    } catch (err) {
      toast.dismiss(loadingToastId);
      toast.error("An error occurred. Please try again.");
    } finally {
      toast.dismiss(loadingToastId);
      setLoading(false);
    }
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePassword = (password) => {
    if (!password) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        password: "Please provide password",
      }));
    } else {
      setErrors((prevErrors) => {
        const { password, ...rest } = prevErrors;
        return rest;
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-3">
      <div className="bg-white p-6 rounded-md shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold text-gray-700 text-center">
          Sign In
        </h2>
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="mb-4">
            <label className="block text-sm text-gray-600">Email</label>
            <input
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500  ${
                errors.email ? "border-red-500" : ""
              }`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email}</p>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm text-gray-600">Password</label>
            <input
              type="password"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500  ${
                errors.password ? "border-red-500" : ""
              }`}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                validatePassword(e.target.value);
              }}
            />
            {errors.password && (
              <p className="text-xs text-red-500 mt-1">{errors.password}</p>
            )}
          </div>
          <button
            type="submit"
            className={`w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 flex items-center justify-center gap-2 ${
              loading ? "cursor-not-allowed opacity-75" : ""
            }`}
            disabled={loading}
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin text-white text-lg" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <FaSignInAlt className="text-white text-lg" />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>
        <p className="mt-4 text-sm text-gray-600 text-center">
          Don&apos;t have an account?{" "}
          <Link href="/auth/sign-up" className="text-green-500 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
