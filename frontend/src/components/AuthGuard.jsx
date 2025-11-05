"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthGuard({ children, redirectTo = "/" }) {
  const [checked, setChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
      if (token) {
        // already authenticated -> redirect away from auth pages
        router.push(redirectTo);
      } else {
        // No token, show the auth page
        setTimeout(() => setChecked(true), 0);
      }
    } catch (e) {
      // On error, show the auth page
      setTimeout(() => setChecked(true), 0);
    }
  }, [router, redirectTo]);

  if (!checked) return null;
  return children;
}
