"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  FaEdit,
  FaEye,
  FaTrash,
  FaTimes,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaDownload,
  FaSave,
} from "react-icons/fa";
import toast from "react-hot-toast";
import { AuthGuard } from "@/app/utils/AuthGuard";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Pagination from "@/app/components/pagination";
import ConfirmationDialog from "@/app/components/confirm-dialog";

function AdminReportPage() {
  const [donations, setDonations] = useState([]);
  const [totalDonation, setTotalDonation] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
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
    adminRemarks: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "" });
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const router = useRouter();

  const editDialogRef = useRef(null);
  const viewDialogRef = useRef(null);

  useEffect(() => {
    fetchDonations(
      currentPage,
      pageSize,
      searchQuery,
      sortConfig,
      fromDate,
      toDate
    );
  }, [
    currentPage,
    pageSize,
    searchQuery,
    sortConfig,
    router,
    fromDate,
    toDate,
  ]);

  const fetchDonations = async (
    page,
    limit,
    searchQuery,
    sortConfig,
    fromDate,
    toDate
  ) => {
    try {
      setLoading(true);
      setError("");

      let queryParams = `page=${page}&limit=${limit}`;

      if (searchQuery) queryParams += `&search=${searchQuery}`;
      if (fromDate)
        queryParams += `&from=${fromDate.toLocaleDateString("en-CA")}`;
      if (toDate) queryParams += `&to=${toDate.toLocaleDateString("en-CA")}`;

      if (sortConfig.key) queryParams += `&sortKey=${sortConfig.key}`;
      if (sortConfig.direction)
        queryParams += `&sortDirection=${sortConfig.direction}`;

      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found");

      const response = await fetch(
        `${process.env.API_URL}donations?${queryParams}`,
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
      setTotalRecords(data.totalRecords);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      [
        "#",
        "Name",
        "Email",
        "Amount",
        "Message",
        "Admin Remarks",
        "Paid On",
        "Updated On",
      ],
      ...donations.map((d, i) => [
        i + 1,
        d.name,
        d.email || "-",
        `BDT ${d.amount}`,
        d.message || "—",
        d.adminRemarks || "—",
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
      adminRemarks: donation.adminRemarks || "",
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

  const openConfirmDialog = (id) => {
    setDeleteTargetId(id);
    setIsConfirmDialogOpen(true);
  };

  const closeConfirmDialog = () => {
    setIsConfirmDialogOpen(false);
    setDeleteTargetId(null);
  };

  const handleDelete = async () => {
    if (deleteTargetId) {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Authentication token not found");

        await fetch(`${process.env.API_URL}donations/${deleteTargetId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        fetchDonations(
          currentPage,
          pageSize,
          searchQuery,
          sortConfig,
          fromDate,
          toDate
        );
        toast.success("Donation deleted successfully!");
      } catch (err) {
        toast.error("Failed to delete donation");
      } finally {
        closeConfirmDialog();
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

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found");

      const response = await fetch(
        `${process.env.API_URL}donations/${selectedDonation.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            adminRemarks: formData.adminRemarks,
          }),
        }
      );
      if (response.ok) {
        toast.success("Donation updated successfully!");
        fetchDonations(
          currentPage,
          pageSize,
          searchQuery,
          sortConfig,
          fromDate,
          toDate
        );
        editDialogRef.current.close();
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to update donation");
        throw new Error("Failed to update donation");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 md:px-6 px-3">
      <div className="bg-white py-6 sm:px-6 px-3 rounded-md shadow-md mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-700">
            Donation Report
          </h2>
          {donations && donations.length > 0 && (
            <button
              onClick={exportToCSV}
              className="flex items-center justify-center bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 gap-2"
            >
              <FaDownload className="text-white text-lg" />
              <span>Download CSV</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap justify-between items-center gap-3">
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              placeholder="Search donations..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-md px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
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
          <div className="text-right font-semibold">
            <span>Total Donation Amount: BDT {totalDonation}</span>
          </div>
        </div>
        <div className="my-2 font-semibold">Total Records: {totalRecords}</div>

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
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    Admin Remarks
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
                  <th
                    className="border border-gray-300 px-4 py-2 text-center cursor-pointer"
                    onClick={() => handleSort("updatedAt")}
                  >
                    <span className="flex justify-center gap-2 items-center">
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
                  <th className="border border-gray-300 px-4 py-2 text-center">
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
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      {donation.amount}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {donation.message}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {donation.adminRemarks}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {new Date(donation.createdAt).toLocaleString()}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {new Date(donation.updatedAt).toLocaleString()}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEdit(donation)}
                        className="bg-green-500 text-white p-1 rounded hover:bg-green-600"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleView(donation)}
                        className="bg-blue-500 text-white p-1 rounded hover:bg-blue-600"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => openConfirmDialog(donation.id)}
                        className="bg-red-500 text-white p-1 rounded hover:bg-red-600"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={setPageSize}
            />
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
          className="absolute top-2 right-2 text-red-500 text-xl"
        >
          <FaTimes />
        </button>
        <h2 className="text-xl font-semibold mb-4">Edit Donation</h2>
        <form onSubmit={handleSave}>
          <p className="mb-3">
            <strong>Name:</strong> {selectedDonation?.name}
          </p>
          <p className="mb-3">
            <strong>Email:</strong> {selectedDonation?.email}
          </p>
          <p className="mb-3">
            <strong>Amount:</strong> BDT {selectedDonation?.amount}
          </p>
          <p className="mb-3">
            <strong>Message:</strong> {selectedDonation?.message}
          </p>
          <div className="mb-4">
            <label htmlFor="adminRemarks" className="block">
              <strong>Admin Remarks:</strong>
            </label>
            <textarea
              id="adminRemarks"
              name="adminRemarks"
              value={formData.adminRemarks}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            ></textarea>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 gap-2"
            >
              <FaSave className="text-white text-lg" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </dialog>

      {/* View Dialog */}
      <dialog
        ref={viewDialogRef}
        className="p-6 bg-white rounded-md shadow-md w-[500px] mx-auto realtive"
      >
        <button
          onClick={() => viewDialogRef.current.close()}
          className="absolute top-2 right-2 text-red-500 text-xl"
        >
          <FaTimes />
        </button>
        <h2 className="text-xl font-semibold mb-4">View Donation</h2>
        <p className="mb-3">
          <strong>Name:</strong> {selectedDonation?.name}
        </p>
        <p className="mb-3">
          <strong>Email:</strong> {selectedDonation?.email}
        </p>
        <p className="mb-3">
          <strong>Amount:</strong> BDT {selectedDonation?.amount}
        </p>
        <p className="mb-3">
          <strong>Message:</strong> {selectedDonation?.message}
        </p>
        <p className="mb-3">
          <strong>Admin Remarks:</strong> {selectedDonation?.adminRemarks}
        </p>
        <p className="mb-3">
          <strong>Paid On:</strong>{" "}
          {new Date(selectedDonation?.createdAt).toLocaleString()}
        </p>
        <p className="mb-3">
          <strong>Updated On:</strong>{" "}
          {new Date(selectedDonation?.updatedAt).toLocaleString()}
        </p>
      </dialog>

      {/* Delete Dialog */}
      <ConfirmationDialog
        isOpen={isConfirmDialogOpen}
        onClose={closeConfirmDialog}
        onConfirm={handleDelete}
        message="Are you sure you want to delete this donation?"
      />
    </div>
  );
}

export default AuthGuard(AdminReportPage, ["admin"]);
