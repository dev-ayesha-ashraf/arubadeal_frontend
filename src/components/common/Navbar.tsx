import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { LogIn, Menu, Search, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { trackCustomEvent } from "@/lib/init-pixel";
import { useAuth } from "@/contexts/AuthContext";
import Fuse from "fuse.js";
import { SearchSuggestions } from "./SearchSuggestions";

export const Navbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const isMobile = useIsMobile();
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const { user, logout } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);

  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [fuse, setFuse] = useState<Fuse<any> | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (user) {
      const fetchUserProfile = async () => {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL1}/me`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`
            },
          });

          if (response.ok) {
            const data = await response.json();
            setUserProfile(data);
          }
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
        }
      };

      fetchUserProfile();
    } else {
      setUserProfile(null);
    }
  }, [user]);

  useEffect(() => {
    const fetchSearchData = async () => {
      try {
        // Helper to remove LHD/RHD from text
        const cleanText = (text: string) => text.replace(/\s*\b(lhd|rhd)\b\s*/gi, "").trim();

        // Fetch local listings
        const localResponse = await fetch(`${import.meta.env.VITE_API_URL}/car_listing/listing?page=1&size=1000`);
        const localData = localResponse.ok ? await localResponse.json() : { items: [] };
        const localItems = localData.items || [];

        // Fetch USA listings (third-party)
        const usaResponse = await fetch(`${import.meta.env.VITE_API_URL}/api_listing/public?page=1&size=1000`);
        const usaData = usaResponse.ok ? await usaResponse.json() : { items: [] };

        const usaItems = (usaData.items || []).map((car: any) => {
          const primaryImage = car.images?.find((i: any) => i.is_primary) || car.images?.[0];
          return {
            _id: car.id,
            title: cleanText(`${car.year} ${car.meta_data?.make || ""} ${car.model || ""}`),
            make: {
              id: "usa-make",
              name: car.meta_data?.make || "Unknown",
              slug: car.meta_data?.make?.toLowerCase() || "unknown"
            },
            model: cleanText(car.model || "Unknown"),
            year: car.year,
            body_type: {
              id: "usa-body",
              name: car.meta_data?.bodyType || "Unknown",
              slug: car.meta_data?.bodyType?.toLowerCase() || "unknown"
            },
            fuel_type: {
              id: "usa-fuel",
              name: car.meta_data?.fuelType || "N/A"
            },
            transmission: {
              id: "usa-trans",
              name: cleanText(car.meta_data?.transmission || "N/A")
            },
            color: car.exteriorColor,
            slug: car.id,
            price: car.price,
            mileage: car.miles,
            status: 1,
            image: primaryImage ? `${import.meta.env.VITE_MEDIA_URL}${primaryImage.image_url}` : null,
            listedAt: car.createdAt,
            badges: [],
            badge: undefined,
            vehicle_id: car.vehical_id || "",
            location: `${car.city}, ${car.state}` || car.city || "",
            seats: car.seats,
            isThirdParty: true,
          };
        });

        // Fetch Copart listings
        const copartResponse = await fetch(`${import.meta.env.VITE_API_URL}/copart_listing/public?page=1&size=1000`);
        const copartData = copartResponse.ok ? await copartResponse.json() : { items: [] };

        const copartItems = (copartData.items || []).map((car: any) => {
          const primaryImage = car.images?.find((i: any) => i.is_primary) || car.images?.[0];
          return {
            _id: car.id,
            title: cleanText(`${car.year} ${car.make || ""} ${car.model_group || ""} ${car.model_detail || ""}`),
            make: {
              id: "cp-make",
              name: car.make || "Unknown",
              slug: car.make?.toLowerCase() || "unknown"
            },
            model: cleanText(car.model_detail || car.model_group || "Unknown"),
            year: Number(car.year),
            body_type: {
              id: "cp-body",
              name: car.body_style || "Unknown",
              slug: car.body_style?.toLowerCase() || "unknown"
            },
            fuel_type: {
              id: "cp-fuel",
              name: car.fuel_type || "N/A"
            },
            transmission: {
              id: "cp-trans",
              name: cleanText(car.transmission || "N/A")
            },
            color: car.color,
            slug: car.id,
            price: car.buy_it_now_price || car.est_retail_value || 0,
            mileage: car.odometer,
            status: 1,
            image: primaryImage ? `${import.meta.env.VITE_MEDIA_URL}${primaryImage.image_url}` : null,
            listedAt: car.create_date_time,
            badges: [],
            badge: undefined,
            vehicle_id: car.vehical_id || "",
            location: `${car.location_city}, ${car.location_state}` || car.location_city || "",
            seats: null,
            isCopart: true,
          };
        });

        // Combine all items
        const allItems = [...localItems, ...usaItems, ...copartItems];

        const fuseInstance = new Fuse(allItems, {
          keys: [
            'title',
            'make.name',
            'model',
            'year',
            'color',
            'fuel_type.name',
            'body_type.name',
            'transmission.name',
            'location',
          ],
          threshold: 0.4,
          distance: 100,
        });

        setFuse(fuseInstance);
      } catch (error) {
        console.error("Failed to init search:", error);
      }
    };
    fetchSearchData();
  }, []);

  const [placeholderText, setPlaceholderText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(150);

  const words = [
    "Color",
    "Make",
    "Model",
    "Year",
    "Left-hand steering",
    "Right-hand drive",
    "Engine type",
    "Fuel type",
    "Transmission",
    "Body Type"
  ];

  useEffect(() => {
    const handleType = () => {
      const i = loopNum % words.length;
      const fullText = words[i];

      setPlaceholderText(
        isDeleting
          ? fullText.substring(0, placeholderText.length - 1)
          : fullText.substring(0, placeholderText.length + 1)
      );

      setTypingSpeed(isDeleting ? 50 : 150);

      if (!isDeleting && placeholderText === fullText) {
        setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && placeholderText === "") {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      }
    };

    const timer = setTimeout(handleType, typingSpeed);
    return () => clearTimeout(timer);
  }, [placeholderText, isDeleting, loopNum, typingSpeed]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      trackCustomEvent("Search", { search_string: searchQuery.trim() });

      // Route to appropriate page
      let targetRoute = "/listings";
      if (location.pathname === "/united-states-listings") {
        targetRoute = "/united-states-listings";
      } else if (location.pathname === "/auction-vehicles") {
        targetRoute = "/auction-vehicles";
      }

      navigate(`${targetRoute}?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setSuggestions([]);
      setIsFocused(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    if (searchQuery.trim() && fuse) {
      const results = fuse.search(searchQuery).slice(0, 10);
      setSuggestions(results);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery, fuse]);

  const handleLoginClick = () => {
    trackCustomEvent("InitiateLogin", { source: "navbar" });
    navigate("/login", { state: { background: location } });
  };

  const handleMenuOpen = () => {
    setIsSidebarOpen(true);
    trackCustomEvent("OpenMenu", { device: isMobile ? "mobile" : "desktop" });
  };

  const LoginButton = () => (
    <Button
      onClick={handleLoginClick}
      className="flex items-center gap-1.5 text-sm text-primary bg-gradient-to-r from-dealership-primary/80 to-dealership-primary/100 px-4 py-1.5 h-auto"
    >
      <LogIn className="w-4 h-4" />
      Login
    </Button>
  );

  const ProfileButton = () => {
    if (!user) return null;
    const initials = `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase();
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
      setImageError(false);
    }, [user.id, userProfile?.image_url]);

    const getProfileImageUrl = () => {
      if (!userProfile?.image_url) return null;

      return `${import.meta.env.VITE_MEDIA_URL}${userProfile.image_url}`;
    };

    const profileImageUrl = getProfileImageUrl();

    return (
      <Link to="/profile" className="flex items-center gap-2 group">
        {profileImageUrl && !imageError ? (
          <img
            src={profileImageUrl}
            onError={() => setImageError(true)}
            className="w-8 h-8 rounded-full object-cover border-2 border-dealership-primary cursor-pointer"
            alt="Profile"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-dealership-primary text-white font-bold flex items-center justify-center cursor-pointer text-xs">
            {initials}
          </div>
        )}
      </Link>
    );
  };

  const MobileNav = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    if (!isMobile) return null;

    return (
      <>
        {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />}

        <div
          className={`fixed top-0 left-0 h-screen bg-white z-50 transition-transform duration-300 ease-in-out w-64 transform ${isOpen ? "translate-x-0" : "-translate-x-full"
            }`}
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
                  to="/united-states-listings"
                  className="text-lg hover:text-dealership-primary"
                  onClick={onClose}
                >
                  United State Listings
                </Link>
              </li>
              <li>
                <Link
                  to="/auction-vehicles"
                  className="text-lg hover:text-dealership-primary"
                  onClick={onClose}
                >
                  Auction Vehicles
                </Link>
              </li>
              <li>
                <Link
                  to="/accessories"
                  className="text-lg hover:text-dealership-primary"
                  onClick={onClose}
                >
                  Accessories
                </Link>
              </li>
              <li>
                <Link
                  to="/sellcar"
                  className="text-lg hover:text-dealership-primary"
                  onClick={onClose}
                >
                  Sell My Car
                </Link>
              </li>
              <li>
                <Link
                  to="/buy-car-history"
                  className="text-lg hover:text-dealership-primary"
                  onClick={onClose}
                >
                  Car History
                </Link>
              </li>

              {!user && <LoginButton />}
            </ul>
          </nav>
        </div>
      </>
    );
  };

  return (
    <>
      <nav
        className={`bg-white relative shadow-md py-4 z-50 ${isScrolled || isMobile ? "fixed top-0 left-0 right-0 z-50" : "relative"
          }`}
      >
        <div className="container mx-auto px-4">
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

              <div className="flex items-center gap-2">
                {user && <ProfileButton />}
                <button onClick={handleMenuOpen} className="p-2">
                  <Menu className="w-6 h-6 text-dealership-primary" />
                </button>
              </div>
            </div>

            <div className="relative w-full transition-all duration-300">
              <form onSubmit={handleSearch} className="relative w-full">
                <div className={`
                  flex items-center w-full px-4 py-2 
                  bg-gray-100/50 backdrop-blur-sm border-2 
                  ${isFocused ? 'border-dealership-primary bg-white shadow-lg ring-4 ring-dealership-primary/10' : 'border-gray-200'} 
                  rounded-lg transition-all duration-300
                `}>
                  <Search className={`w-5 h-5 transition-colors ${isFocused ? 'text-dealership-primary' : 'text-gray-400'}`} />
                  <input
                    type="text"
                    placeholder={`Search car by ${placeholderText}|`}
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                    className="w-full px-3 py-1 bg-transparent border-none focus:outline-none text-gray-800 placeholder-gray-400/70"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => { setSearchQuery(""); setSuggestions([]); }}
                      className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  )}
                </div>

                <SearchSuggestions
                  suggestions={suggestions}
                  visible={isFocused && searchQuery.trim().length > 0}
                  onClose={() => setIsFocused(false)}
                  searchQuery={searchQuery}
                />
              </form>
            </div>
          </div>

          <div className="hidden md:flex items-center justify-between gap-3">
            <Link
              to="/"
              className="flex items-center group transition-transform duration-300 hover:scale-105"
            >
              <img
                src="/logo.svg"
                alt="Logo"
                className="w-9 h-9"
                style={{
                  filter:
                    "brightness(0) saturate(100%) invert(48%) sepia(79%) saturate(2476%) hue-rotate(346deg) brightness(118%) contrast(119%)",
                }}
              />
              <div className="text-xl ml-1.5 font-bold text-dealership-primary group-hover:text-dealership-primary/80 transition-colors">
                Arudeal
              </div>
            </Link>

            <div className="flex items-center gap-4 flex-1 justify-center">
              <Link
                to="/"
                className="text-dealership-primary text-sm font-medium hover:text-dealership-primary/80 transition-colors whitespace-nowrap"
              >
                Home
              </Link>
              <Link
                to="/listings"
                className="text-dealership-primary text-sm font-medium hover:text-dealership-primary/80 transition-colors whitespace-nowrap"
              >
                Listings
              </Link>
              <Link
                to="/united-states-listings"
                className="text-dealership-primary text-sm font-medium hover:text-dealership-primary/80 transition-colors whitespace-nowrap"
              >
                United States Listings
              </Link>
              <Link
                to="/auction-vehicles"
                className="text-dealership-primary text-sm font-medium hover:text-dealership-primary/80 transition-colors whitespace-nowrap"
              >
                Auction Vehicles
              </Link>
              <Link
                to="/sellcar"
                className="text-dealership-primary text-sm font-medium hover:text-dealership-primary/80 transition-colors whitespace-nowrap"
              >
                Sell My Car
              </Link>
              <Link
                to="/buy-car-history"
                className="text-dealership-primary text-sm font-medium hover:text-dealership-primary/80 transition-colors whitespace-nowrap"
              >
                Car History
              </Link>
            </div>

            <div className={`relative w-full md:w-[350px] transition-all duration-300 ${isFocused ? 'scale-[1.02]' : ''}`}>
              <form onSubmit={handleSearch} className="relative w-full">
                <div className={`
                  flex items-center w-full px-3 py-1.5 
                  bg-gray-100/50 backdrop-blur-sm border-2 
                  ${isFocused ? 'border-dealership-primary bg-white shadow-lg ring-4 ring-dealership-primary/10' : 'border-transparent hover:border-gray-200'} 
                  rounded-full transition-all duration-300
                `}>
                  <Search className={`w-4 h-4 transition-colors ${isFocused ? 'text-dealership-primary' : 'text-gray-400'}`} />
                  <input
                    type="text"
                    placeholder={`Search car by ${placeholderText}|`}
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                    className="w-full px-2 py-0.5 bg-transparent border-none focus:outline-none text-sm text-gray-800 placeholder-gray-400/70"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => { setSearchQuery(""); setSuggestions([]); }}
                      className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      <X className="w-3 h-3 text-gray-400" />
                    </button>
                  )}
                </div>

                <SearchSuggestions
                  suggestions={suggestions}
                  visible={isFocused && searchQuery.trim().length > 0}
                  onClose={() => setIsFocused(false)}
                  searchQuery={searchQuery}
                />
              </form>

              <div className={`
                absolute -bottom-5 left-6 text-[9px] text-gray-400 font-medium 
                transition-all duration-300 pointer-events-none
                ${isFocused ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
              `}>
                Try: "Red Toyota", "2023 BMW", "SUV Diesel"...
              </div>
            </div>

            {user ? <ProfileButton /> : <LoginButton />}
          </div>

          <MobileNav isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        </div>
      </nav>
    </>
  );
};