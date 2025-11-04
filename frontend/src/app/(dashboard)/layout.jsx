import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import DashboardNavbar from "@/components/DashboardNavbar";

function DashboardLayout({ children }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex-1 min-h-screen flex flex-col md:ml-[--sidebar-width]">
        <DashboardNavbar />
        <main className="p-6">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}

export default DashboardLayout;
