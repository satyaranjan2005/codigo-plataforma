"use client"

import { usePathname } from "next/navigation"
import { Bell, Search, ChevronDown, User } from "lucide-react"
import NotificationsPanel from "@/components/NotificationsPanel"
import { useState } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"

export default function DashboardNavbar() {
  const pathname = usePathname() || "/"
  const showSearch = pathname.startsWith("/dashboard/students")
  const [open, setOpen] = useState(false)

  const notifications = [
    { title: "New registration", description: "A user registered for Event A" },
    { title: "Certificate issued", description: "Certificates issued for Event B" },
    { title: "Result published", description: "Winners announced for Event C" },
  ]

  return (
    <header className="w-full bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile sidebar trigger */}
            <div className="md:hidden">
              <SidebarTrigger />
            </div>

            {/* Page title */}
            <div className="text-lg font-semibold text-slate-900">Dashboard</div>
          </div>

          <div className="flex items-center gap-3">
            {showSearch && (
              <div className="hidden md:flex items-center bg-slate-50 rounded-md px-2 py-1">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  aria-label="Search"
                  className="ml-2 bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400"
                  placeholder="Search"
                />
              </div>
            )}

            <div className="relative">
              <button onClick={() => setOpen((v) => !v)} className="relative p-2 rounded-md hover:bg-slate-50">
                <Bell className="w-5 h-5 text-slate-700" />
                <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-medium leading-none text-white bg-rose-600 rounded">3</span>
              </button>
              <NotificationsPanel open={open} onClose={() => setOpen(false)} items={notifications} />
            </div>

            <div className="flex items-center gap-2 pl-2 border-l border-slate-100">
              <button className="flex items-center gap-2 p-1 rounded hover:bg-slate-50">
                <User className="w-6 h-6 text-slate-700" />
                <div className="hidden sm:flex flex-col text-sm text-left">
                  <span className="font-medium text-slate-900">Satya</span>
                  <span className="text-xs text-slate-500">Admin</span>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}


