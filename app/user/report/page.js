"use client";

import { useState, useEffect } from "react";
import {
  FaArrowLeft,
  FaArrowRight,
  FaSort,
  FaSortUp,
  FaSortDown,
} from "react-icons/fa";
import { AuthGuard } from "@/app/utils/AuthGuard";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function UserDonationPage() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "" });
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [totalDonation, setTotalDonation] = useState(0);

  useEffect(() => {
    fetchDonations(currentPage, pageSize, sortConfig, fromDate, toDate);
  }, [currentPage, pageSize, sortConfig, fromDate, toDate]);

  const fetchDonations = async (page, limit, sortConfig, fromDate, toDate) => {
    try {
      setLoading(true);
      setError("");

      let queryParams = `page=${page}&limit=${limit}`;
      if (fromDate)
        queryParams += `&from=${fromDate.toLocaleDateString("en-CA")}`;
      if (toDate) queryParams += `&to=${toDate.toLocaleDateString("en-CA")}`;
      if (sortConfig.key) queryParams += `&sortKey=${sortConfig.key}`;
      if (sortConfig.direction)
        queryParams += `&sortDirection=${sortConfig.direction}`;

      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found");
      const response = await fetch(
        `http://localhost:5000/donations/user?${queryParams}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch donations");

      const data = await response.json();
      setDonations(data.data);
      setTotalDonation(data.totalDonation);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFromDateChange = (date) => {
    setFromDate(date);
  };

  const handleToDateChange = (date) => {
    setToDate(date);
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 md:px-6 px-3">
      <div className="bg-white py-6 sm:px-6 px-3 rounded-md shadow-md mx-auto">
        <div className="flex justify-center items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-700">My Donations</h2>
        </div>
        <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
          <div className="flex flex-wrap gap-3">
            <div>
              <DatePicker
                selected={fromDate}
                onChange={handleFromDateChange}
                placeholderText="From"
                className="w-md px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                dateFormat="dd/MM/yyyy"
              />
            </div>
            <div>
              <DatePicker
                selected={toDate}
                onChange={handleToDateChange}
                placeholderText="To"
                className="w-md px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                dateFormat="dd/MM/yyyy"
              />
            </div>
          </div>
          <div className="mb-4 text-right font-semibold">
            <span>Total Donation Amount: BDT {totalDonation}</span>
          </div>
        </div>

        {loading && <p className="text-center text-gray-500">Loading...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {!loading && donations && donations.length === 0 && (
          <p className="text-center text-gray-500">No donations found.</p>
        )}

        {!loading && donations && donations.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse border border-gray-300">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    #
                  </th>
                  <th
                    className="border border-gray-300 px-4 py-2 text-center cursor-pointer"
                    onClick={() => handleSort("name")}
                  >
                    <span className="flex justify-center gap-2 items-center">
                      <span>Name</span>
                      <span>
                        {sortConfig.key === "name" &&
                        sortConfig.direction === "asc" ? (
                          <FaSortUp />
                        ) : sortConfig.key === "name" &&
                          sortConfig.direction === "desc" ? (
                          <FaSortDown />
                        ) : (
                          <FaSort />
                        )}
                      </span>
                    </span>
                  </th>
                  <th
                    className="border border-gray-300 px-4 py-2 text-center cursor-pointer"
                    onClick={() => handleSort("email")}
                  >
                    <span className="flex justify-center gap-2 items-center">
                      <span>Email</span>
                      <span>
                        {sortConfig.key === "email" &&
                        sortConfig.direction === "asc" ? (
                          <FaSortUp />
                        ) : sortConfig.key === "email" &&
                          sortConfig.direction === "desc" ? (
                          <FaSortDown />
                        ) : (
                          <FaSort />
                        )}
                      </span>
                    </span>
                  </th>
                  <th
                    className="border border-gray-300 px-4 py-2 text-center cursor-pointer"
                    onClick={() => handleSort("amount")}
                  >
                    <span className="flex justify-center gap-2 items-center">
                      <span>Amount</span>
                      <span>
                        {sortConfig.key === "amount" &&
                        sortConfig.direction === "asc" ? (
                          <FaSortUp />
                        ) : sortConfig.key === "amount" &&
                          sortConfig.direction === "desc" ? (
                          <FaSortDown />
                        ) : (
                          <FaSort />
                        )}
                      </span>
                    </span>
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    Message
                  </th>
                  <th
                    className="border border-gray-300 px-4 py-2 text-center cursor-pointer"
                    onClick={() => handleSort("createdAt")}
                  >
                    <span className="flex justify-center gap-2 items-center">
                      <span> Paid On</span>
                      <span>
                        {sortConfig.key === "createdAt" &&
                        sortConfig.direction === "asc" ? (
                          <FaSortUp />
                        ) : sortConfig.key === "createdAt" &&
                          sortConfig.direction === "desc" ? (
                          <FaSortDown />
                        ) : (
                          <FaSort />
                        )}
                      </span>
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {donations.map((donation, index) => (
                  <tr key={donation.id}>
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
                      {donation.amount}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {donation.message}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {new Date(donation.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex justify-center items-center gap-3 mt-4">
              <div>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                  }}
                  className="border rounded px-2 py-1"
                >
                  {[10, 20, 50, 100].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
              >
                <FaArrowLeft />
              </button>
              <span className="text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
              >
                <FaArrowRight />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AuthGuard(UserDonationPage, ["user", "admin"]);
