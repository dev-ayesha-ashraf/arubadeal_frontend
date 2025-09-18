import { Footer } from "@/components/common/Footer";
import { Header } from "@/components/common/Header";
import { Navbar } from "@/components/common/Navbar";
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

const Index = () => {
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
      <WhatsAppButton />
    </div>
  );
};

export default Index;
