"use client";

import { useEffect } from "react";
import api from "@/lib/api";

export default function KeepAlive() {
  useEffect(() => {
    // Skip if mock backend mode is active
    if (process.env.NEXT_PUBLIC_MOCK_BACKEND === "true") return;

    const pingBackend = async () => {
      try {
        await api.get("/health");
      } catch {
        // Silently ignore ping failures during cold boot
      }
    };

    // Immediate wake-up ping on user entry
    pingBackend();

    // Ping every 8 minutes to keep Render alive while user is active
    const interval = setInterval(pingBackend, 8 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return null;
}
