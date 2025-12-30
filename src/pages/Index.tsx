import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Car, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import { Footer } from "@/components/common/Footer";
import { Header } from "@/components/common/Header";
import { Navbar } from "@/components/common/Navbar";
// import { SubscriptionBox } from "@/components/common/SubscriptionPopup";
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
import { FeedbackBar } from "@/components/common/FeedbackBar";
import { FeedbackModal } from "@/components/common/FeedbackModal";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const Index = () => {
  // const [showPopup, setShowPopup] = useState(false);
  const [showFeedbackBar, setShowFeedbackBar] = useState(true);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<string>("all");
  const { toast } = useToast();

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     setShowPopup(true);
  //     toast({
  //       title: "Welcome to our dealership!",
  //       description: "Subscribe for exclusive offers!",
  //       duration: 2000,
  //     });
  //   }, 2000);

  //   return () => clearTimeout(timer);
  // }, [toast]);

  const handleFeedbackClick = () => {
    setShowFeedbackModal(true);
  };

  const handleCloseFeedbackBar = () => {
    setShowFeedbackBar(false);
  };

  return (
    <div className="min-h-screen">
      <Toaster />

      <Header />
      <div className="hidden md:block">
        <FeedbackBar
          onFeedbackClick={handleFeedbackClick}
          onClose={handleCloseFeedbackBar}
          isVisible={showFeedbackBar}
        />
      </div>
      <Navbar />

      {/* Mobile Sell Car Button */}
      <div className="block md:hidden px-4 py-3 bg-white/90 backdrop-blur-md border-b border-indigo-50/50 shadow-sm">
        <Link to="/sellcar">
          <Button
            className="w-full bg-gradient-to-r from-white to-slate-50/50 text-dealership-navy border border-dealership-gold/30 shadow-[0_2px_12px_-4px_rgba(206,131,57,0.15)] hover:shadow-[0_4px_16px_-6px_rgba(206,131,57,0.25)] hover:border-dealership-gold/50 transition-all duration-300 group h-12 rounded-xl justify-between px-2 pl-2 pr-4"
            variant="outline"
          >
            <div className="flex items-center">
              <div className="bg-dealership-gold/10 p-2 rounded-lg mr-3 group-hover:bg-dealership-gold/20 transition-colors duration-300">
                <Car className="h-5 w-5 text-dealership-gold" />
              </div>
              <span className="font-semibold text-[15px] tracking-wide text-dealership-navy/90">Sell My Car</span>
            </div>
            <div className="flex items-center text-xs font-medium text-gray-400 group-hover:text-dealership-primary transition-colors">
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </div>
          </Button>
        </Link>
      </div>

      <div className="block md:hidden">
        <FeedbackBar
          onFeedbackClick={handleFeedbackClick}
          onClose={handleCloseFeedbackBar}
          isVisible={showFeedbackBar}
        />
      </div>
      <Hero />
      <CarFilter selectedBadge={selectedBadge} onBadgeChange={setSelectedBadge} />
      <OurCars badgeFilter={selectedBadge} />
      <BrowseByType />
      <BrowseByMake />
      <BrowseAccessories />
      <ReviewSection />
      <StatsSection />
      <WhyChooseUs />
      <Footer />
      <WhatsAppButton />
      {/* 
      <Dialog open={showPopup} onOpenChange={setShowPopup}>
        <DialogContent className="max-w-[86%] max-h-[85vh] sm:max-w-[56%] overflow-auto">
          <SubscriptionBox />
        </DialogContent>
      </Dialog> */}

      <FeedbackModal
        open={showFeedbackModal}
        onOpenChange={setShowFeedbackModal}
      />
    </div>
  );
};

export default Index;