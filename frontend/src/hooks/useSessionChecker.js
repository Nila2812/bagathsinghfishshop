// src/hooks/useSessionChecker.js

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const useSessionChecker = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const user = localStorage.getItem("user");
      const userId = localStorage.getItem("userId");

      if (!user || !userId) {
        return; // User not logged in, skip check
      }

      try {
        const userData = JSON.parse(user);
        const sessionToken = userData.sessionToken;

        if (!sessionToken) {
          return; // Old user data without token, skip check
        }

        const response = await fetch("/api/auth/verify-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, sessionToken })
        });

        const data = await response.json();

        if (data.forceLogout) {
          // Session invalid - force logout
          localStorage.removeItem("user");
          localStorage.removeItem("userId");
          
          // Show alert
          alert("You have been logged in from another device. Please login again.");
          
          // Reload page to update navbar
          window.location.reload();
        }
      } catch (error) {
        console.error("Session check error:", error);
      }
    };

    // Check session every 30 seconds
    const interval = setInterval(checkSession, 30000);

    // Check immediately on mount
    checkSession();

    // Cleanup
    return () => clearInterval(interval);
  }, [navigate]);
};

export default useSessionChecker;