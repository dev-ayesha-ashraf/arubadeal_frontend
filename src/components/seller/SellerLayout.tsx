import { useEffect, useState } from "react";
import SellerSidebar from "./SellerSidebar";
import SellerTopbar from "./SellerTopbar";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isMobile = window.innerWidth < 1024;

  useEffect(() => {
    const savedState = localStorage.getItem('seller-sidebar-collapsed');
    if (savedState) {
      setIsCollapsed(savedState === 'true');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('seller-sidebar-collapsed', isCollapsed.toString());
  }, [isCollapsed]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="min-h-screen">
      <div className="bg-white shadow-md fixed top-0 right-0 left-0 z-10">
        <SellerTopbar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          isCollapsed={isCollapsed}
          toggleSidebar={toggleSidebar}
        />
      </div>

      <div className="pt-16 md:pt-0 flex">
        <SellerSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onToggle={toggleSidebar}
          isCollapsed={isCollapsed}
        />
        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${!isMobile ? (isCollapsed ? "ml-20" : "ml-64") : ""
            }`}
        >
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
