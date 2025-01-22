"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const exportToCSV = () => {
  const csvContent = [
    ["#", "Name", "Email", "Amount", "Message"],
    ...donations.map((d, i) => [
      i + 1,
      d.name,
      d.email,
      `$${d.amount.toFixed(2)}`,
      d.message || "—",
    ]),
  ]
    .map((row) => row.join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "donation_report.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default function ReportPage() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  const isAdmin = true;

  useEffect(() => {
    if (!isAdmin) {
      router.push("/");
    } else {
      fetchDonations();
    }
  }, [isAdmin]);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("http://localhost:5000/donations");
      if (!response.ok) throw new Error("Failed to fetch donations");

      const data = await response.json();
      setDonations(data.donations);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="bg-white p-6 rounded-md shadow-md max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-700 text-center mb-4">
          Donation Report
        </h2>

        {loading && <p className="text-center text-gray-500">Loading...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {!loading && donations.length === 0 && (
          <p className="text-center text-gray-500">No donations found.</p>
        )}

        {!loading && donations.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse border border-gray-300">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    #
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Name
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Email
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-right">
                    Amount
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Message
                  </th>
                </tr>
              </thead>
              <tbody>
                {donations.map((donation, index) => (
                  <tr key={donation.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">
                      {index + 1}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {donation.name}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {donation.email}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      ${donation.amount.toFixed(2)}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {donation.message || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
