"use client";

import Welcome from "./components/welcome";
import AdminDashboard from "./components/dashboard";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";

export default function Home() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setIsAdmin(decodedToken?.role === "admin");
        setLoading(false);
      } catch (error) {
        toast.error("Failed to decode token:", error);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);
  return !loading && <>{isAdmin ? <AdminDashboard /> : <Welcome />}</>;
}
