import { PanelLeftClose, PanelLeft, Menu, Globe } from "lucide-react";
import { Link } from "react-router-dom";

export default function SellerTopbar({
  isSidebarOpen,
  setIsSidebarOpen,
  isCollapsed,
  toggleSidebar,
}: {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  isCollapsed: boolean;
  toggleSidebar: () => void;
}) {
  const isMobile = window.innerWidth < 1024;

  return (
    <div className="bg-white shadow-md fixed top-0 right-0 left-0 z-10 md:hidden">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="flex items-center group transition-transform duration-300 hover:scale-105">
            <img
              src="/logo.svg"
              alt="Logo"
              className="w-10 h-10"
              style={{
                filter:
                  "brightness(0) saturate(100%) invert(48%) sepia(79%) saturate(2476%) hue-rotate(346deg) brightness(118%) contrast(119%)",
              }}
            />
            <div className="text-2xl ml-2 font-bold text-dealership-primary group-hover:text-dealership-primary/80 transition-colors">
              Arudeal
            </div>
          </Link>
        </div>
        <div className="flex items-center gap-4 ml-auto">
          {isMobile ? (
            <button onClick={() => setIsSidebarOpen(true)} className="p-1">
              <Menu className="w-6 h-6" />
            </button>
          ) : (
            <button
              onClick={toggleSidebar}
              className="p-1 text-gray-600 hover:text-gray-900"
            >
              {isCollapsed ? <PanelLeft className="w-6 h-6" /> : <PanelLeftClose className="w-6 h-6" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}