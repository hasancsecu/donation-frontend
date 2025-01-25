"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { FaDonate } from "react-icons/fa";

export default function DonatePage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    amount: "",
    message: "",
  });
  const [errors, setErrors] = useState({
    name: false,
    email: false,
    amount: false,
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (user && token) {
      setIsLoggedIn(true);
      const parsedUser = JSON.parse(user);
      setFormData({
        ...formData,
        name: parsedUser.name || "",
        email: parsedUser.email || "",
      });
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (value) {
      setErrors({
        ...errors,
        [name]: false,
      });
    } else {
      if (name !== "email")
        setErrors({
          ...errors,
          [name]: true,
        });
    }
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, email, amount, message } = formData;
    const newErrors = { name: false, email: false, amount: false };

    if (!name.trim()) {
      newErrors.name = true;
    }

    if (email && !validateEmail(email)) {
      newErrors.email = true;
    }

    if (!amount.trim() || isNaN(amount) || Number(amount) < 1) {
      newErrors.amount = true;
    }

    setErrors(newErrors);

    if (Object.values(newErrors).some((hasError) => hasError)) {
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/donations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, amount, message }),
      });

      if (response.ok) {
        toast.success("Thank you for your donation!");
        setFormData({ name: "", email: "", amount: "", message: "" });

        setTimeout(() => {
          if (isLoggedIn) {
            router.push("/user/report");
          } else {
            router.push("/");
          }
        }, 1000);
      } else {
        const error = await response.json();
        toast.error(
          error.message ||
            "Failed to process the donation. Please try again later."
        );
      }
    } catch (err) {
      toast.error("Failed to process the donation. Please try again later.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 md:px-6 px-3">
      <div className="bg-white p-6 rounded-md shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold text-gray-700 text-center mb-4">
          Make a Donation
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm text-gray-600">Full Name *</label>
            <input
              type="text"
              name="name"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.name
                  ? "border-red-500 focus:ring-red-500"
                  : "focus:ring-green-500"
              }`}
              value={formData.name}
              onChange={handleChange}
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">
                Please provide your full name
              </p>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm text-gray-600">
              Email (Optional)
            </label>
            <input
              type="text"
              name="email"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.email
                  ? "border-red-500 focus:ring-red-500"
                  : "focus:ring-green-500"
              } ${isLoggedIn ? "cursor-not-allowed" : ""}`}
              value={formData.email}
              onChange={handleChange}
              disabled={isLoggedIn}
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">
                Please provide a valid email
              </p>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm text-gray-600">
              Donation Amount (BDT) *
            </label>
            <input
              type="text"
              name="amount"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.amount
                  ? "border-red-500 focus:ring-red-500"
                  : "focus:ring-green-500"
              }`}
              value={formData.amount}
              onChange={handleChange}
            />
            {errors.amount && (
              <p className="text-xs text-red-500 mt-1">
                Minimum donation amount is BDT 1
              </p>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm text-gray-600">
              Message (Optional)
            </label>
            <textarea
              name="message"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              value={formData.message}
              onChange={handleChange}
              rows="4"
            ></textarea>
          </div>
          <button
            type="submit"
            className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 flex items-center justify-center gap-2"
          >
            <FaDonate className="text-white text-lg" />
            <span>Donate Now</span>
          </button>
        </form>
      </div>
    </div>
  );
}
