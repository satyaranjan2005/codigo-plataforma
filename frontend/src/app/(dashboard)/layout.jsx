"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import DashboardNavbar from "@/components/DashboardNavbar";

function DashboardLayout({ children }) {
  const [allowed, setAllowed] = useState(false);
  const [checked, setChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const raw = localStorage.getItem("authUser");
      if (!raw) {
        // not signed in -> redirect to home
        router.replace("/");
        return;
      }
      const parsed = JSON.parse(raw);
      const role = (parsed?.role || parsed?.roleName || "").toString().toLowerCase();
      // Only allow users with role 'admin' or 'superadmin'
      if (role === "admin" || role === "superadmin" || role === "administrator") {
        setAllowed(true);
      } else {
        // redirect non-admins away
        try { router.replace("/"); } catch (e) { /* ignore */ }
      }
    } catch (e) {
      try { router.replace("/"); } catch (err) { /* ignore */ }
    } finally {
      setChecked(true);
    }
  }, [router]);

  if (!checked) return null; // avoid flicker
  if (!allowed) return null;

  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex-1 min-h-screen flex flex-col md:ml-[--sidebar-width]">
        <DashboardNavbar />
        <main className="p-6">{children}</main>
      </div>
    </SidebarProvider>
  );
}

export default DashboardLayout;
