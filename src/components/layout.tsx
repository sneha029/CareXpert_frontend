import { Outlet, useLocation } from "react-router-dom";
import { logger } from "@/lib/logger";
import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Button } from "./ui/button";
import { Menu, Heart } from "lucide-react";
import { useAuthStore } from "@/store/authstore";

export default function Layout({ children }: { children?: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const user = useAuthStore((state) => state.user);

  const sidebarPages = [
    "/dashboard/patient",
    "/dashboard/doctor",
    "/admin",
    "/profile",
    "/appointments",
    "/doctors",
    "/book-appointment",
    "/chat",
  ];


  const shouldShowSidebar =
    user && sidebarPages.some((page) => location.pathname.startsWith(page));

  const shouldShowSidebar = user && sidebarPages.some(page => 
    location.pathname.startsWith(page)
  );

  // Debug logging
  logger.debug('Layout render', { hasUser: !!user, pathname: location.pathname });


  if (!user || !shouldShowSidebar) {
    return (
      <div className="min-h-screen font-sans overflow-x-hidden">
        {children || <Outlet />}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-900 flex overflow-x-hidden">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-200/60 dark:border-zinc-700/60 bg-white/70 dark:bg-zinc-900/40 backdrop-blur-sm">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-sm">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white truncate">
              CareXpert
            </span>
          </div>

          <div className="w-8" />
        </div>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">
          {children || <Outlet />}
        </main>

      </div>
    </div>
  );
}