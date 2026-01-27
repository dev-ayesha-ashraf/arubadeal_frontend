import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Listings from "./pages/Listings";
import GlobalListings from "./pages/GlobalListings";
import ListingDetail from "./pages/ListingDetail";
import Dealers from "./pages/Dealers";
import TypeDetail from "./pages/TypeDetail";
import PrivateRoute from "./components/PrivateRoute";
import NotFound from "./pages/NotFound";
import AdminPortal from "./pages/AdminPortal";
import { HelmetProvider } from "react-helmet-async";
import { initGA } from "@/lib/analytics";
import { loadCarsPixel } from "./lib/init-pixel";
import Profile from "./components/common/Profile";
import { WhatsAppButton } from "./components/landing-page/WhatsAppButton";
import CarAccessories from "./components/landing-page/CarAccessories";
import AccessoriesDetails from "./pages/AccessoriesDetails";
import SellYourCarPage from "./pages/SellPage";
import LoginPage from "./pages/LoginPage";
import SellerLayout from "./components/seller/SellerLayout";
import MyListings from "./components/seller/MyListings";
import SellerDashboard from "./components/seller/SellerDashboard";
import SellerPrivateRoute from "./components/SellerPrivateRoute";
import LoginDialog from "./components/common/Login";
import SignupDialog from "./components/common/Signup";
import CarfaxReportOrder from "./pages/CarfaxSalesPage";

const queryClient = new QueryClient();
initGA();

const AppContent = () => {
  useEffect(() => {
    loadCarsPixel();
  }, []);

  useScrollToTop();

  const location = useLocation();
  const state = location.state as { background?: Location } | null;
  let background = state && state.background;
  if (background && (background.pathname.includes("/login") || background.pathname.includes("/signup"))) {
    background = { pathname: "/", search: "", hash: "", state: null, key: "default" } as any;
  }

  useEffect(() => {
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("track", "PageView");
    }
  }, [location.pathname]);
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
      <Routes location={background || location}>
        {/* Public routes */}
        <Route path="/" element={<Index />} />
        <Route path="/listings" element={<Listings />} />
        <Route path="/united-states-listings" element={<GlobalListings />} />
        <Route path="/listings/:slug" element={<ListingDetail />} />
        <Route path="/dealers" element={<Dealers />} />
        <Route path="/types/:typeSlug" element={<TypeDetail />} />
        <Route path="/accessories" element={<CarAccessories />} />
        <Route path="/buy-car-history" element={<CarfaxReportOrder />} />
        <Route path="/sellcar" element={<SellYourCarPage />} />
        <Route element={<SellerPrivateRoute />}>
          <Route
            path="/seller/*"
            element={
              <SellerLayout>
                <Routes>
                  <Route path="/" element={<SellerDashboard />} />
                  <Route path="listings" element={<MyListings />} />
                </Routes>
              </SellerLayout>
            }
          />
        </Route>

        <Route path="/accessorydetails/:slug" element={<AccessoriesDetails />} />

        <Route
          path="/login"
          element={
            <>
              <Index />
              <LoginDialog
                showLoginDialog={true}
                setShowLoginDialog={() => { }}
                isModal={true}
              />
            </>
          }
        />
        <Route
          path="/signup"
          element={
            <>
              <Index />
              <SignupDialog
                showDialog={true}
                setShowDialog={() => { }}
                isModal={true}
              />
            </>
          }
        />

        <Route element={<PrivateRoute />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin/*" element={<AdminPortal />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>

      {background && (
        <Routes>
          <Route
            path="/login"
            element={
              <LoginDialog
                showLoginDialog={true}
                setShowLoginDialog={() => { }}
                isModal={true}
              />
            }
          />
          <Route
            path="/signup"
            element={
              <SignupDialog
                showDialog={true}
                setShowDialog={() => { }}
                isModal={true}
              />
            }
          />
        </Routes>
      )}

      {!isAdminRoute && <WhatsAppButton />}
    </>
  );
};

const App = () => (
  <BrowserRouter>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster position="top-right" />
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </BrowserRouter>
);

export default App;
