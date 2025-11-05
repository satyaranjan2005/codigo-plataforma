"use client"

import { useMemo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calendar, Home, Users, BarChart2, Settings, ClipboardList, Award, FileCheck, FileText } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// Menu items: only the requested tabs
const items = [
  { title: "Home", url: "/dashboard", icon: Home },
  { title: "Members", url: "/dashboard/members", icon: Users },
  { title: "Total Students", url: "/dashboard/students", icon: BarChart2 },
  { title: "Event", url: "/dashboard/events", icon: Calendar },
]

export function AppSidebar() {
  const pathname = usePathname() || "/"

  const menu = useMemo(() => {
    return items.map((item) => {
      const isActive = item.url && pathname === item.url || (item.url !== "/" && pathname.startsWith(item.url + "/"))
      return { ...item, isActive }
    })
  }, [pathname])

  const eventSub = [
    { title: "Event Page", url: "/dashboard/events" , icon: Calendar},
    { title: "Event Settings", url: "/dashboard/events/settings", icon: Settings },
    { title: "Registration", url: "/dashboard/events/registration", icon: ClipboardList },
    { title: "Problem Statement", url: "/dashboard/events/case-study", icon: FileText },
    { title: "Certificate", url: "/dashboard/events/certificate", icon: FileCheck },
  ]

  return (
    // make sidebar responsive: offcanvas on mobile, persistent on md+
    <Sidebar collapsible="offcanvas">
      <SidebarContent>
        {/* Brand / header */}
        <div className="px-4 py-6 border-b border-sidebar-border">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-md bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-bold text-xl">CP</div>
            <div>
              <div className="text-xl font-semibold text-sidebar-foreground">Codigo</div>
              <div className="text-sm text-sidebar-foreground/70">Platform</div>
            </div>
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sm">Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menu.map((item) => {
                if (item.title !== "Event") {
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={item.isActive} size="lg" tooltip={item.title}>
                        <Link href={item.url} className="flex items-center gap-5 w-full py-3 px-2 group-data-[collapsible=icon]:justify-center" aria-label={item.title}>
                          <item.icon className="w-8 h-8" />
                          <span className="flex-1 text-sm font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                }

                // Event item with submenu
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={item.isActive} size="lg" tooltip={item.title}>
                      <Link href={item.url} className="flex items-center gap-5 w-full py-3 px-2" aria-label={item.title}>
                        <item.icon className="w-8 h-8" />
                        <span className="flex-1 text-sm font-medium">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>

                    <SidebarMenuSub>
                      {eventSub.map((s) => {
                        const active = pathname === s.url || pathname.startsWith(s.url + "/")
                        return (
                          <SidebarMenuSubItem key={s.title}>
                            <SidebarMenuSubButton asChild isActive={active}>
                              <Link href={s.url} className="flex items-center gap-3 w-full py-2 px-2">
                                <s.icon className="w-4 h-4 text-slate-500" />
                                <span className="text-sm">{s.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        )
                      })}
                    </SidebarMenuSub>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}