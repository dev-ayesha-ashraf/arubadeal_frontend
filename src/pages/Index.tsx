import { useEffect, useState } from "react";
import { Footer } from "@/components/common/Footer";
import { Header } from "@/components/common/Header";
import { Navbar } from "@/components/common/Navbar";
import { SubscriptionBox } from "@/components/common/SubscriptionPopup";
import { BrowseByMake } from "@/components/landing-page/BrosweByMake";
import BrowseAccessories from "@/components/landing-page/BrowseAccesories";
import { BrowseByType } from "@/components/landing-page/BrowseByType";
import { CarFilter } from "@/components/landing-page/CarFilter";
import { Hero } from "@/components/landing-page/Hero";
import { OurCars } from "@/components/landing-page/OurCars";
import { ReviewSection } from "@/components/landing-page/ReviewSection";
import { StatsSection } from "@/components/landing-page/StatsSection";
import { WhatsAppButton } from "@/components/landing-page/WhatsAppButton";
import { WhyChooseUs } from "@/components/landing-page/WhyChooseUs";

import { Dialog, DialogContent } from "@/components/ui/dialog";

const Index = () => {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPopup(true);
    }, 8000); 
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <Navbar />
      <Hero />
      <CarFilter />
      <OurCars />
      <BrowseByType />
      <BrowseByMake />
      <BrowseAccessories />
      <ReviewSection />
      <StatsSection />
      <WhyChooseUs />
      <Footer />
      <Dialog open={showPopup} onOpenChange={setShowPopup} >
        <DialogContent >
          <SubscriptionBox />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
