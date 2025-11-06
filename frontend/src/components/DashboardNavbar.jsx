"use client"

import { usePathname, useRouter } from "next/navigation"
import { RefreshCw, Search, User } from "lucide-react"
import { useState, useEffect } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"

export default function DashboardNavbar() {
  const pathname = usePathname() || "/"
  const router = useRouter()
  const showSearch = pathname.startsWith("/dashboard/students")
  const [user, setUser] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    // Get user from localStorage
    try {
      const raw = localStorage.getItem("authUser")
      if (raw) {
        setUser(JSON.parse(raw))
      }
    } catch (e) {
      console.error("Error loading user:", e)
    }
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    // Refresh Next.js router cache
    router.refresh()
    // Also reload the entire page to refetch all data
    window.location.reload()
  }

  const userName = user?.name || user?.full_name || "User"
  const userRole = user?.role || user?.roleName || "User"

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

            {/* Refresh Button */}
            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-md hover:bg-slate-50 transition"
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 text-slate-700 ${refreshing ? 'animate-spin' : ''}`} />
            </button>

            {/* User Info */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-100">
              <div className="flex items-center gap-2 p-1">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-medium text-sm">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:flex flex-col text-sm text-left">
                  <span className="font-medium text-slate-900">{userName}</span>
                  <span className="text-xs text-slate-500 capitalize">{userRole}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}




