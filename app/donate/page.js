"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

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

  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    setErrors({
      ...errors,
      [name]: false,
    });
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
      toast.error("Full name is required.");
    }

    if (email && !validateEmail(email)) {
      newErrors.email = true;
      toast.error("Invalid email format.");
    }

    if (!amount.trim() || isNaN(amount) || Number(amount) <= 0) {
      newErrors.amount = true;
      toast.error("Donation amount must be a positive number.");
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
          router.push("/");
        }, 1000);
      } else {
        toast.error("Failed to process the donation. Please try again later.");
      }
    } catch (err) {
      toast.error("Failed to process the donation. Please try again later.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
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
                  : "focus:ring-blue-500"
              }`}
              value={formData.name}
              onChange={handleChange}
            />
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
                  : "focus:ring-blue-500"
              }`}
              value={formData.email}
              onChange={handleChange}
            />
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
                  : "focus:ring-blue-500"
              }`}
              value={formData.amount}
              onChange={handleChange}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm text-gray-600">
              Message (Optional)
            </label>
            <textarea
              name="message"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.message}
              onChange={handleChange}
              rows="4"
            ></textarea>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
          >
            Donate Now
          </button>
        </form>
      </div>
    </div>
  );
}
