"use client";

import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export function AuthGuard(Component, roles = []) {
  return function AuthGuard(props) {
    const [isClient, setIsClient] = useState(false);
    const router = useRouter();

    useEffect(() => {
      setIsClient(true);
    }, []);

    const isAuthenticated = () => {
      if (typeof window === "undefined") return false;
      const token = localStorage.getItem("token");
      if (!token) return false;

      try {
        const decodedToken = jwtDecode(token);
        return decodedToken && decodedToken.exp * 1000 > Date.now();
      } catch (error) {
        toast.error("Invalid token");
        return false;
      }
    };

    const hasRequiredRole = () => {
      if (typeof window === "undefined") return false;
      const token = localStorage.getItem("token");
      if (!token) return false;

      try {
        const decodedToken = jwtDecode(token);
        return roles.includes(decodedToken.role);
      } catch (error) {
        toast.error("Error decoding token:", error);
        return false;
      }
    };

    useEffect(() => {
      if (!isAuthenticated()) {
        router.replace("/auth/sign-in");
        return;
      }

      if (!hasRequiredRole()) {
        router.replace("/forbidden");
        return;
      }
    }, [router]);

    if (!isClient) {
      return null;
    }

    if (!isAuthenticated() || !hasRequiredRole()) {
      return null;
    }

    return <Component {...props} />;
  };
}
