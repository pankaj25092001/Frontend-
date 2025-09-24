// src/components/AuthStatus.tsx

"use client"; // This MUST be a client component

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "./ui/button";
import { toast } from "sonner";
import axios from "axios";

export default function AuthStatus() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  // On component load, check if the token exists in localStorage
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = async () => {
    try {
      // Call the backend logout endpoint (optional, but good practice)
      await axios.post("http://localhost:8000/api/v1/users/logout");
      
      // The MOST IMPORTANT step: remove the token from the browser
      localStorage.removeItem("accessToken");
      
      setIsLoggedIn(false);
      toast.success("Logged out successfully");
      
      // Redirect to login page to complete the logout flow
      router.push("/login");

    } catch (error) {
      toast.error("Logout failed. Please try again.");
      console.error("Logout error:", error);
    }
  };

  if (isLoggedIn) {
    return (
      <div className="text-center">
        <p className="mb-4">You are currently logged in.</p>
        <Button onClick={handleLogout} variant="destructive">
          Log Out
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center">
      <p className="mb-4">You are not logged in.</p>
      <Link href="/login">
        <Button>Go to Login</Button>
      </Link>
    </div>
  );
}