"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { jwtDecode } from "jwt-decode";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        if (decodedToken?.role === "admin") {
          router.push("/admin/report");
        } else {
          router.push("/donate");
        }
      } catch (error) {
        console.error("Failed to decode token:", error);
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrors({});

    if (!name) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        name: "Please provide a your full name.",
      }));
      return;
    }

    if (!email || !validateEmail(email)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        email: "Please provide a valid Email.",
      }));
      return;
    }

    if (password.length < 6) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        password: "Password must be at least 6 characters long.",
      }));
      return;
    }

    if (password !== confirmPassword) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        confirmPassword: "Passwords do not match!",
      }));
      return;
    }

    setLoading(true);
    const loadingToastId = toast.loading("Signing up...");

    try {
      const response = await fetch("http://localhost:5000/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, confirmPassword }),
      });

      if (response.ok) {
        const data = await response.json();

        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);

        toast.dismiss(loadingToastId);
        toast.success("Signed up successfully!");

        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        const error = await response.json();
        toast.dismiss(loadingToastId);
        toast.error(error.message || "Failed to sign up. Please try again.");
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
    if (password.length < 6) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        password: "Password must be at least 6 characters long.",
      }));
    } else {
      setErrors((prevErrors) => {
        const { password, ...rest } = prevErrors;
        return rest;
      });
    }
  };

  const validateConfirmPassword = (confirmPassword) => {
    if (confirmPassword !== password) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        confirmPassword: "Passwords do not match!",
      }));
    } else {
      setErrors((prevErrors) => {
        const { confirmPassword, ...rest } = prevErrors;
        return rest;
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-md shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold text-gray-700 text-center">
          Sign Up
        </h2>
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="mb-4">
            <label className="block text-sm text-gray-600">Full Name</label>
            <input
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.name ? "border-red-500" : ""
              }`}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name}</p>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm text-gray-600">Email</label>
            <input
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
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
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
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
          <div className="mb-4">
            <label className="block text-sm text-gray-600">
              Confirm Password
            </label>
            <input
              type="password"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.confirmPassword ? "border-red-500" : ""
              }`}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                validateConfirmPassword(e.target.value);
              }}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-red-500 mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>
          <button
            type="submit"
            className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600"
            disabled={loading}
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>
        <p className="mt-4 text-sm text-gray-600 text-center">
          Already have an account?{" "}
          <Link href="/auth/sign-in" className="text-green-500 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
