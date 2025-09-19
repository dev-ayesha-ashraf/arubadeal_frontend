import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Listings from "./pages/Listings";
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
import CarAccessories from "./components/landing-page/CarAccessories";
import AccessoriesDetails from "./pages/AccessoriesDetails";

const queryClient = new QueryClient();
initGA();

const AppContent = () => {
  useEffect(() => {
    loadCarsPixel();
  }, []);

  useScrollToTop();

  const location = useLocation();

  useEffect(() => {
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("track", "PageView");
    }
  }, [location.pathname]);
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Index />} />
      <Route path="/listings" element={<Listings />} />
      <Route path="/listings/:slug" element={<ListingDetail />} />
      <Route path="/dealers" element={<Dealers />} />
      <Route path="/types/:typeSlug" element={<TypeDetail />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/accessories" element={<CarAccessories />} />
      <Route path="/accessorydetails" element={<AccessoriesDetails />} />
      {/* <Route path="/admin/*" element={<AdminPortal />} /> */}
      {/* Protected /admin */}
      <Route element={<PrivateRoute />}>
        <Route path="/admin/*" element={<AdminPortal />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
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
