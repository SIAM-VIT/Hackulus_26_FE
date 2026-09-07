"use client";

/**
 * MockProvider
 * ------------
 * Wraps the app to synchronously activate the mock backend.
 * The import below has side-effects that register axios-mock-adapter.
 * The env guard lives inside mock-backend.ts → setupMockBackend().
 */
import "@/lib/mock-bootstrap";

import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";
import { jwtDecode } from "jwt-decode";

export default function MockProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [role, setRole] = useState<string>("user");

  useEffect(() => {
    const token = getToken();
    if (token) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const decoded: any = jwtDecode(token);
        setRole(decoded.role || "user");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_e) {}
    }
  }, []);

  const toggleRole = () => {
    const newRole = role === "user" ? "admin" : "user";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof window !== "undefined" && (window as any).switchMockUser) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).switchMockUser(newRole);
    }
  };

  return (
    <>
      {children}
      {process.env.NEXT_PUBLIC_MOCK_BACKEND === "true" && (
        <button
          onClick={toggleRole}
          className="fixed bottom-4 right-4 z-[9999] bg-[#CF3D00] text-white px-4 py-2 rounded-full font-bold shadow-2xl border-2 border-black hover:scale-105 transition-transform"
        >
          {role === "judge" ? "Dev: Switch to User" : "Dev: Switch to Admin"}
        </button>
      )}
    </>
  );
}
