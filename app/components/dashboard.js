"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaDollarSign, FaUsers, FaChartBar } from "react-icons/fa";

export default function AdminDashboard() {
  const router = useRouter();

  const [stats, setStats] = useState({
    todayDonation: 0,
    totalDonation: 0,
    totalUsers: 0,
    todayUsers: 0,
  });

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Authentication token not found");
        const response = await fetch(`http://localhost:5000/donations/stats`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setStats({
          todayDonation: data.todayDonation,
          totalDonation: data.totalDonation,
          totalUsers: data.totalUsers,
          todayUsers: data.todayUsers,
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      }
    };

    fetchDashboardStats();
  }, []);

  const navigateToReportPage = () => {
    router.push("/admin/report");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="container mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h1 className="text-3xl font-semibold text-gray-700">
            Welcome, Admin
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            Here’s a quick overview of today’s activity and total stats.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
            <div className="flex items-center">
              <FaDollarSign className="text-3xl text-green-500 mr-4" />
              <div>
                <h3 className="text-lg font-semibold text-gray-700">
                  Total Donations
                </h3>
                <p className="text-3xl font-bold text-green-500">
                  BDT {stats.totalDonation}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
            <div className="flex items-center">
              <FaDollarSign className="text-3xl text-green-500 mr-4" />
              <div>
                <h3 className="text-lg font-semibold text-gray-700">
                  Today's Donations
                </h3>
                <p className="text-3xl font-bold text-green-500">
                  BDT {stats.todayDonation}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
            <div className="flex items-center">
              <FaUsers className="text-3xl text-blue-500 mr-4" />
              <div>
                <h3 className="text-lg font-semibold text-gray-700">
                  Total Users
                </h3>
                <p className="text-3xl font-bold text-blue-500">
                  {stats.totalUsers}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
            <div className="flex items-center">
              <FaUsers className="text-3xl text-blue-500 mr-4" />
              <div>
                <h3 className="text-lg font-semibold text-gray-700">
                  Today's New Users
                </h3>
                <p className="text-3xl font-bold text-blue-500">
                  {stats.todayUsers}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 text-center">
          <button
            onClick={navigateToReportPage}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <FaChartBar className="inline mr-2" />
            Go to Reports
          </button>
        </div>
      </div>
    </div>
  );
}
