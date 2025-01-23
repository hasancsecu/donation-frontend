"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  FaArrowLeft,
  FaArrowRight,
  FaEdit,
  FaEye,
  FaTrash,
  FaTimes,
  FaSort,
  FaSortUp,
  FaSortDown,
} from "react-icons/fa";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";

export default function ReportPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [donations, setDonations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    amount: "",
    message: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "" });

  const router = useRouter();

  const editDialogRef = useRef(null);
  const viewDialogRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setIsAdmin(decodedToken?.role === "admin");
      } catch (error) {
        console.error("Failed to decode token:", error);
      }
    } else {
      setIsAdmin(false);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (!isAdmin) {
        router.push("/");
      } else {
        fetchDonations(currentPage, pageSize, searchQuery, sortConfig);
      }
    }
  }, [isAdmin, isLoading, currentPage, pageSize, searchQuery, sortConfig]);

  const fetchDonations = async (page, limit, searchQuery, sortConfig) => {
    try {
      setLoading(true);
      setError("");

      let queryParams = `page=${page}&limit=${limit}`;

      if (searchQuery) queryParams += `&search=${searchQuery}`;
      if (sortConfig.key) queryParams += `&sortKey=${sortConfig.key}`;
      if (sortConfig.direction)
        queryParams += `&sortDirection=${sortConfig.direction}`;

      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found");

      const response = await fetch(
        `http://localhost:5000/donations?${queryParams}`,
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
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ["#", "Name", "Email", "Amount", "Message", "Paid On", "Updated On"],
      ...donations.map((d, i) => [
        i + 1,
        d.name,
        d.email,
        `BDT ${d.amount}`,
        d.message || "—",
        new Date(d.createdAt).toISOString(),
        new Date(d.updatedAt).toISOString(),
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

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleEdit = (donation) => {
    setSelectedDonation(donation);
    setFormData({
      name: donation.name,
      email: donation.email,
      amount: donation.amount,
      message: donation.message || "",
    });
    if (editDialogRef.current) {
      editDialogRef.current.showModal();
    }
  };

  const handleView = (donation) => {
    setSelectedDonation(donation);
    if (viewDialogRef.current) {
      viewDialogRef.current.showModal();
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this?");
    if (confirmed) {
      try {
        await fetch(`http://localhost:5000/donations/${id}`, {
          method: "DELETE",
        });
        fetchDonations(currentPage, pageSize, searchQuery, sortConfig);
      } catch (err) {
        setError("Failed to delete donation");
      }
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.amount) {
      alert("Please fill in all the required fields.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/donations/${selectedDonation.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            amount: formData.amount,
            message: formData.message,
          }),
        }
      );
      if (!response.ok) throw new Error("Failed to update donation");

      toast.success("Donation updated successfully!");
      fetchDonations(currentPage, pageSize, searchQuery, sortConfig);
      editDialogRef.current.close();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    isAdmin && (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="bg-white p-6 rounded-md shadow-md mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-700">
              Donation Report
            </h2>
            {donations && donations.length > 0 && (
              <button
                onClick={exportToCSV}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Download CSV
              </button>
            )}
          </div>

          <div className="mb-4">
            <input
              type="text"
              placeholder="Search donations..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-md px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      #
                    </th>
                    <th
                      className="border border-gray-300 px-4 py-2 text-left cursor-pointer"
                      onClick={() => handleSort("name")}
                    >
                      <span className="flex gap-2 items-center">
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
                      className="border border-gray-300 px-4 py-2 text-left cursor-pointer"
                      onClick={() => handleSort("email")}
                    >
                      <span className="flex gap-2 items-center">
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
                      className="border border-gray-300 px-4 py-2 text-left cursor-pointer"
                      onClick={() => handleSort("amount")}
                    >
                      <span className="flex gap-2 items-center">
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
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Message
                    </th>
                    <th
                      className="border border-gray-300 px-4 py-2 text-left cursor-pointer"
                      onClick={() => handleSort("createdAt")}
                    >
                      <span className="flex gap-2 items-center">
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
                    <th
                      className="border border-gray-300 px-4 py-2 text-left cursor-pointer"
                      onClick={() => handleSort("updatedAt")}
                    >
                      <span className="flex gap-2 items-center">
                        <span> Updated On</span>
                        <span>
                          {sortConfig.key === "updatedAt" &&
                          sortConfig.direction === "asc" ? (
                            <FaSortUp />
                          ) : sortConfig.key === "updatedAt" &&
                            sortConfig.direction === "desc" ? (
                            <FaSortDown />
                          ) : (
                            <FaSort />
                          )}
                        </span>
                      </span>
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Actions
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
                      <td className="border border-gray-300 px-4 py-2">
                        {donation.amount}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {donation.message}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {new Date(donation.createdAt).toLocaleString()}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {new Date(donation.updatedAt).toLocaleString()}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <button
                          onClick={() => handleEdit(donation)}
                          className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleView(donation)}
                          className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 ml-2"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => handleDelete(donation.id)}
                          className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 ml-2"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="flex justify-center items-center gap-3 mt-4">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                >
                  <FaArrowLeft />
                </button>
                <span className="text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                >
                  <FaArrowRight />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Edit Dialog */}
        <dialog
          ref={editDialogRef}
          className="p-6 bg-white rounded-md shadow-md w-[500px] mx-auto realtive"
        >
          <button
            onClick={() => editDialogRef.current.close()}
            className="absolute top-2 right-2 text-gray-500 text-xl"
          >
            <FaTimes />
          </button>
          <h2 className="text-xl font-semibold mb-4">Edit Donation</h2>
          <form onSubmit={handleSave}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-700">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="amount" className="block text-gray-700">
                Amount
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="message" className="block text-gray-700">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Save Changes
            </button>
          </form>
        </dialog>

        {/* View Dialog */}
        <dialog
          ref={viewDialogRef}
          className="p-6 bg-white rounded-md shadow-md w-[500px] mx-auto realtive"
        >
          <button
            onClick={() => viewDialogRef.current.close()}
            className="absolute top-2 right-2 text-gray-500 text-xl"
          >
            <FaTimes />
          </button>
          <h2 className="text-xl font-semibold mb-4">View Donation</h2>
          <p>
            <strong>Name:</strong> {selectedDonation?.name}
          </p>
          <p>
            <strong>Email:</strong> {selectedDonation?.email}
          </p>
          <p>
            <strong>Amount:</strong> BDT {selectedDonation?.amount}
          </p>
          <p>
            <strong>Message:</strong> {selectedDonation?.message}
          </p>
          <p>
            <strong>Paid On:</strong>{" "}
            {new Date(selectedDonation?.createdAt).toLocaleString()}
          </p>
          <p>
            <strong>Updated On:</strong>{" "}
            {new Date(selectedDonation?.updatedAt).toLocaleString()}
          </p>
        </dialog>
      </div>
    )
  );
}
