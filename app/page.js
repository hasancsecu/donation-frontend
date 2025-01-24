"use client";

import Welcome from "./components/welcome";
import AdminDashboard from "./components/dashboard";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

export default function Home() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setIsAdmin(decodedToken?.role === "admin");
      } catch (error) {
        console.error("Failed to decode token:", error);
      }
    }
  }, []);
  return <>{isAdmin ? <AdminDashboard /> : <Welcome />}</>;
}
