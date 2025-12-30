import BagsManagement from "@/components/admin-panel/Bags";
import BannerManagement from "@/components/admin-panel/BannerManagment";
import CarMake from "@/components/admin-panel/CarMake";
import CarTypes from "@/components/admin-panel/CarType";
import Dashboard from "@/components/admin-panel/Dashboard";
import DealerManagement from "@/components/admin-panel/DealerManagement";
import EnginesManagement from "@/components/admin-panel/Engines";
import FuelTypesManagement from "@/components/admin-panel/FuelTypes";
import Messages from "@/components/admin-panel/Messages";
import Profile from "@/components/common/Profile";
import SubscriptionsManagement from "@/components/admin-panel/SubscriptionsManagement";
import TransmissionsManagement from "@/components/admin-panel/Transmissions";
import VehicleManagement from "@/components/admin-panel/VehicleManagment";
import VehicleProperties from "@/components/admin-panel/VehicleProperties";
import UserManagement from "@/components/admin-panel/UserManagement";
import { Button } from "@/components/ui/button";
import ListingDetail from "./ListingDetail";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Car,
  ImagePlus,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Tags,
  User,
  X,
  Badge,
  Fuel,
  Zap,
  Workflow,
  Globe,
  ChevronDown,
  PanelLeftClose,
  PanelLeft,
  Mail,
  Package,
  ClipboardList,
  Users,
} from "lucide-react";
import { MouseEvent, useState, useEffect } from "react";
import {
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import VehicleManager from "@/components/admin-panel/VehicleManagment";
import CarAccessory from "@/components/admin-panel/CarAccessories";
import CategoryPage from "@/components/admin-panel/CategoryPage";
import CarListingRequests from "@/components/admin-panel/CarListingRequests";

const Sidebar = ({
  isOpen,
  onClose,
  onToggle,
  isCollapsed,
}: {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
  isCollapsed: boolean;
}) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/", icon: Globe, label: "Explore Site" },
    { path: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/admin/vehicles", icon: Car, label: "Vehicle Management" },
    { path: "/admin/vehicle-properties", icon: Tags, label: "Properties" },
    { path: "/admin/car-accessories", icon: Package, label: "Accessories Management" },
    { path: "/admin/car-requests", icon: ClipboardList, label: "Car Listing Requests" },
    { path: "/admin/users", icon: Users, label: "User Management" },
    { path: "/admin/dealers", icon: User, label: "Dealers" },
    { path: "/admin/messages", icon: MessageSquare, label: "Messages" },
    { path: "/admin/banners", icon: ImagePlus, label: "Banners" },
    { path: "/admin/subscriptions", icon: Mail, label: "Subscriptions & Feedbacks" },
  ];

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
        transition-all duration-300 ease-in-out flex flex-col
        ${isCollapsed && !isMobile ? "w-20" : "w-64"} 
        ${isMobile ? (isOpen ? "translate-x-0" : "-translate-x-full") : ""}
      `}
      >
        <div className="p-4 flex justify-between items-center border-b shrink-0">
          {!isCollapsed && (
            <h2 className="text-xl font-bold text-dealership-primary">
              Admin Panel
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

        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-dealership-primary/50 scrollbar-track-transparent ">
          <nav className="py-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={isMobile ? onClose : undefined}
                className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'justify-start px-4'} py-3 hover:bg-gray-100 ${isActive(item.path) ? "bg-gray-100 text-dealership-primary" : ""
                  }`}
                title={isCollapsed ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="ml-3 whitespace-nowrap truncate">
                    {item.label}
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
};

const AdminPortal = () => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  useEffect(() => {
    const savedState = localStorage.getItem('sidebar-collapsed');
    if (savedState) {
      setIsCollapsed(savedState === 'true');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', isCollapsed.toString());
  }, [isCollapsed]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const openMainWebsite = () => {
    window.open("/", "_blank");
  };

  return (
    <div className="min-h-screen">
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

      <div className="pt-16 md:pt-0 flex">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onToggle={toggleSidebar}
          isCollapsed={isCollapsed}
        />
        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${!isMobile ? (isCollapsed ? "ml-20" : "ml-64") : ""
            }`}
        >
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/banners" element={<BannerManagement />} />
            <Route path="/car-makes" element={<CarMake />} />
            <Route path="/bags" element={<BagsManagement />} />
            <Route path="/engines" element={<EnginesManagement />} />
            <Route
              path="/transmissions"
              element={<TransmissionsManagement />}
            />
            <Route path="/fuel-types" element={<FuelTypesManagement />} />
            <Route path="/dealers" element={<DealerManagement />} />
            <Route path="/car-types" element={<CarTypes />} />
            <Route path="/vehicles" element={<VehicleManagement />} />
            <Route path="/vehicle-properties" element={<VehicleProperties />} />
            <Route path="/car-accessories" element={<CarAccessory />} />
            <Route path="/category-management" element={<CategoryPage />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/subscriptions" element={<SubscriptionsManagement />} />
            <Route path="/car-requests" element={<CarListingRequests />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/listings/:slug" element={<ListingDetail isAdmin />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminPortal;