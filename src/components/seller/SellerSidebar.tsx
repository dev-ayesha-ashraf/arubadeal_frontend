import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Car, PlusCircle, User, PanelLeftClose, PanelLeft, X , Globe } from "lucide-react";

const nav = [
  { path: "/", icon: Globe, label: "Explore Site" },
  { label: "Dashboard", path: "/seller", icon: LayoutDashboard },
  { label: "My Listings", path: "/seller/listings", icon: Car },
  { label: "Create Listing", path: "/sellcar", icon: PlusCircle },
  { label: "Profile", path: "/profile", icon: User },
];

export default function SellerSidebar({
  isOpen,
  onClose,
  onToggle,
  isCollapsed,
}: {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
  isCollapsed: boolean;
}) {
  const location = useLocation();
  const isMobile = window.innerWidth < 1024;

  return (
    <>
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={onClose}
        />
      )}

      <div
        className={`
        fixed top-0 left-0 h-screen bg-white border-r z-30
        transition-all duration-300 ease-in-out
        ${isCollapsed && !isMobile ? "w-20" : "w-64"} 
        ${isMobile ? (isOpen ? "translate-x-0" : "-translate-x-full") : ""}
      `}
      >
        <div className="p-4 flex justify-between items-center border-b">
          {!isCollapsed && (
            <h2 className="text-xl font-bold text-dealership-primary">
              Seller Panel
            </h2>
          )}
          <div className="flex items-center">
            {!isMobile && (
              <button
                onClick={onToggle}
                className="p-1 text-gray-600 hover:text-gray-900"
                title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {isCollapsed ? <PanelLeft className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
              </button>
            )}
            {isMobile && (
              <button onClick={onClose} className="p-1">
                <X className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>

        <nav className="py-4">
          {nav.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={isMobile ? onClose : undefined}
              className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'justify-start px-4'} py-3 hover:bg-gray-100 ${location.pathname === item.path ? "bg-gray-100 text-dealership-primary" : ""
                }`}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5" />
              {!isCollapsed && <span className="ml-3">{item.label}</span>}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
