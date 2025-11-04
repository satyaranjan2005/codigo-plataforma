"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthGuard({ children, redirectTo = "/" }) {
  const [checked, setChecked] = useState(() => {
    try {
      if (typeof window === "undefined") return false;
      const token = localStorage.getItem("authToken");
      return !token;
    } catch (e) {
      return true;
    }
  });
  const router = useRouter();

  useEffect(() => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
      if (token) {
        // already authenticated -> redirect away from auth pages
        router.push(redirectTo);
      }
    } catch (e) {
      // noop
    }
  }, [router, redirectTo]);

  if (!checked) return null;
  return children;
}
