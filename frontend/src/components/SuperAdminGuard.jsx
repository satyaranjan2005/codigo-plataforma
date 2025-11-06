"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SuperAdminGuard({ children }) {
  const [allowed, setAllowed] = useState(false);
  const [checked, setChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const raw = localStorage.getItem("authUser");
      if (!raw) {
        router.replace("/dashboard/events");
        return;
      }
      const parsed = JSON.parse(raw);
      const role = (parsed?.role || parsed?.roleName || "").toString().toLowerCase();
      
      // Only allow superadmins
      if (role === "superadmin") {
        setAllowed(true);
      } else {
        // Redirect admins to events page
        router.replace("/dashboard/events/registration");
        return;
      }
    } catch (e) {
      router.replace("/dashboard/events/registration");
    } finally {
      setChecked(true);
    }
  }, [router]);

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p className="mt-2 text-sm text-slate-600">Verifying access...</p>
        </div>
      </div>
    );
  }
  
  if (!allowed) return null;

  return <>{children}</>;
}
