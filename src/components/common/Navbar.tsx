import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { LogIn, Menu, Search, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LoginDialog from "./Login";
import { trackCustomEvent } from "@/lib/init-pixel";
import { useAuth } from "@/contexts/AuthContext";

export const Navbar = () => {
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const isMobile = useIsMobile();
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  const { user, logout } = useAuth();
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      trackCustomEvent("Search", { search_string: searchQuery.trim() });
      navigate(`/listings?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const handleLoginClick = () => {
    setShowLoginDialog(true);
    trackCustomEvent("InitiateLogin", { source: "navbar" });
  };

  const handleMenuOpen = () => {
    setIsSidebarOpen(true);
    trackCustomEvent("OpenMenu", { device: isMobile ? "mobile" : "desktop" });
  };

  const ProfileButton = () => (
    <button
      onClick={() => navigate("/profile")}
      className="flex items-center gap-2 px-4 py-2 text-lg text-primary hover:text-dealership-primary transition-colors"
    >
      {user?.image ? (
        <img
          src={user.image}
          alt={user.name}
          className="w-8 h-8 rounded-full object-cover border border-gray-300"
        />
      ) : (
        <User className="w-6 h-6" />
      )}
      <span className="hidden md:inline">{user?.name?.split(" ")[0]}</span>
    </button>
  );

  const LoginButton = () => (
    <Button
      onClick={handleLoginClick}
      className="flex items-center gap-2 text-lg text-primary bg-gradient-to-r from-dealership-primary/80 to-dealership-primary/100 px-6"
    >
      <LogIn className="w-5 h-5" />
      Login
    </Button>
  );

  const MobileNav = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    if (!isMobile) return null;

    return (
      <>
        {isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />
        )}

        <div
          className={`
            fixed top-0 left-0 h-screen bg-white z-50
            transition-transform duration-300 ease-in-out
            w-64 transform
            ${isOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          <div className="p-4 flex justify-between items-center border-b">
            <h2 className="text-xl font-bold text-dealership-primary">Menu</h2>
            <button onClick={onClose} className="p-1">
              <X className="w-6 h-6" />
            </button>
          </div>
          <nav className="p-4">
            <ul className="space-y-4">
              <li>
                <Link to="/" className="text-lg hover:text-dealership-primary" onClick={onClose}>
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/listings"
                  className="text-lg hover:text-dealership-primary"
                  onClick={onClose}
                >
                  Listings
                </Link>
              </li>
              <li>
                <Link
                  to="/accessories"
                  className="text-lg hover:text-dealership-primary"
                  onClick={onClose}
                >
                  Accesories
                </Link>
              </li>
                {/* <li>
                <Link
                  to="/sellcar"
                  className="text-lg hover:text-dealership-primary"
                  onClick={onClose}
                >
                  Sell Cars
                </Link>
              </li> */}
              <div>{user ? <ProfileButton /> : <LoginButton />}</div>
            </ul>
          </nav>
        </div>
      </>
    );
  };

  return (
    <>
      <nav
        className={`bg-white shadow-md py-4 z-50 ${isScrolled || isMobile ? "fixed top-0 left-0 right-0 z-50" : "relative"
          }`}
      >
        <div className="container mx-auto px-4">
          {/* Mobile Layout */}
          <div className="md:hidden flex flex-col gap-4">
            <div className="flex items-center justify-between">
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

              <button onClick={handleMenuOpen} className="p-2">
                <Menu className="w-6 h-6 text-dealership-primary" />
              </button>
            </div>

            <form onSubmit={handleSearch} className="relative w-full">
              <input
                type="text"
                placeholder="Search cars..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-dealership-primary/50"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-dealership-primary"
              >
                <Search className="w-5 h-5" />
              </button>
            </form>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:flex items-center justify-between gap-6">
            <Link
              to="/"
              className="flex items-center group transition-transform duration-300 hover:scale-105"
            >
              <img
                src="/logo.svg"
                alt="Logo"
                className="w-12 h-12"
                style={{
                  filter:
                    "brightness(0) saturate(100%) invert(48%) sepia(79%) saturate(2476%) hue-rotate(346deg) brightness(118%) contrast(119%)",
                }}
              />
              <div className="text-2xl ml-2 font-bold text-dealership-primary group-hover:text-dealership-primary/80 transition-colors">
                Arudeal
              </div>
            </Link>

            <div className="flex items-center gap-6 flex-1 justify-center">
              <Link
                to="/"
                className="text-dealership-primary text-lg font-medium hover:text-dealership-primary/80 transition-colors"
              >
                Home
              </Link>
              <Link
                to="/listings"
                className="text-dealership-primary text-lg font-medium hover:text-dealership-primary/80 transition-colors"
              >
                Listings
              </Link>
               <Link
                to="/accessories"
                className="text-dealership-primary text-lg font-medium hover:text-dealership-primary/80 transition-colors"
              >
                Accesories
              </Link>
                 {/* <Link
                to="/sellcar"
                className="text-dealership-primary text-lg font-medium hover:text-dealership-primary/80 transition-colors"
              >
                Sell Cars
              </Link> */}
            </div>

            <form onSubmit={handleSearch} className="relative w-64">
              <input
                type="text"
                placeholder="Search cars..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-dealership-primary/50"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-dealership-primary"
              >
                <Search className="w-5 h-5" />
              </button>
            </form>

            {user ? <ProfileButton /> : <LoginButton />}
          </div>

          <MobileNav isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        </div>
      </nav>

      <LoginDialog showLoginDialog={showLoginDialog} setShowLoginDialog={setShowLoginDialog} />
    </>
  );
};
