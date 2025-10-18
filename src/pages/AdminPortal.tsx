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
  Package
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
    { path: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/admin/vehicles", icon: Car, label: "Vehicle Management" },
    { path: "/admin/vehicle-properties", icon: Tags, label: "Properties" },
    { path: "/admin/car-accessories", icon: Package, label: "Accessories Management" },
    { path: "/admin/dealers", icon: User, label: "Dealers" },
    { path: "/admin/messages", icon: MessageSquare, label: "Messages" },
    { path: "/admin/banners", icon: ImagePlus, label: "Banners" },
    { path: "/admin/subscriptions", icon: Mail, label: "Subscriptions" },

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
        transition-all duration-300 ease-in-out
        ${isCollapsed && !isMobile ? "w-20" : "w-64"} 
        ${isMobile ? (isOpen ? "translate-x-0" : "-translate-x-full") : ""}
      `}
      >
        <div className="p-4 flex justify-between items-center border-b">
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
        
        <nav className="py-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={isMobile ? onClose : undefined}
              className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'justify-start px-4'} py-3 hover:bg-gray-100 ${
                isActive(item.path) ? "bg-gray-100 text-dealership-primary" : ""
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
};

const AdminPortal = () => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  // Load sidebar collapsed state from localStorage on component mount
  useEffect(() => {
    const savedState = localStorage.getItem('sidebar-collapsed');
    if (savedState) {
      setIsCollapsed(savedState === 'true');
    }
  }, []);

  // Save sidebar collapsed state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', isCollapsed.toString());
  }, [isCollapsed]);

  // if (!user || user.role !== 1) {
  //   return <Navigate to="/" />;
  // }

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Type the onClick event handler correctly
  const handleProfileClick = (e: MouseEvent<HTMLDivElement>) => {
    navigate("/profile");
  };

  // Function to open the main website in a new tab
  const openMainWebsite = () => {
    // Open the main website in a new tab without setting any session flags
    window.open("/", "_blank");
  };

  return (
    <div className="min-h-screen">
      <div className="bg-white shadow-md fixed top-0 right-0 left-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
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
          <div className="flex items-center gap-4 ml-auto">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={openMainWebsite}
            >
              <Globe className="w-4 h-4" />
              View Website
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Admin User
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white">
                <DropdownMenuItem onClick={handleProfileClick}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="pt-16 flex">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onToggle={toggleSidebar}
          isCollapsed={isCollapsed}
        />
        <div 
          className={`flex-1 transition-all duration-300 ease-in-out ${
            !isMobile ? (isCollapsed ? "ml-20" : "ml-64") : ""
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
            <Route path="/listings/:slug" element={<ListingDetail isAdmin />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminPortal;
