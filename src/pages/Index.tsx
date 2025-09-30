import { Footer } from "@/components/common/Footer";
import { Header } from "@/components/common/Header";
import { Navbar } from "@/components/common/Navbar";
import { BrowseByMake } from "@/components/landing-page/BrosweByMake";
// import BrowseAccessories from "@/components/landing-page/BrowseAccesories";
import { BrowseByType } from "@/components/landing-page/BrowseByType";
import { CarFilter } from "@/components/landing-page/CarFilter";
import { Hero } from "@/components/landing-page/Hero";
import { OurCars } from "@/components/landing-page/OurCars";
import { ReviewSection } from "@/components/landing-page/ReviewSection";
import { StatsSection } from "@/components/landing-page/StatsSection";
import { WhatsAppButton } from "@/components/landing-page/WhatsAppButton";
import { WhyChooseUs } from "@/components/landing-page/WhyChooseUs";
import { Helmet } from "react-helmet-async";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Cars Arudeal | Buy & Sell Cars</title>
        <meta name="description" content="Arudeal – Find and buy your dream car with trusted dealers." />

        <meta property="og:title" content="Cars Arudeal" />
        <meta property="og:description" content="Find and buy your dream car with trusted dealers at Arudeal." />
        <meta property="og:image" content="https://carsarubadeal.vercel.app/cars.png" /> 
        <meta property="og:url" content="https://cars.arudeal.com/" />
        <meta property="og:type" content="website" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Cars Arudeal" />
        <meta name="twitter:description" content="Find and buy your dream car with trusted dealers at Arudeal." />
        <meta name="twitter:image" content="https://carsarubadeal.vercel.app/cars.png" />
      </Helmet>
      <Header />
      <Navbar />
      <Hero />
      <CarFilter />
      <OurCars />
      <BrowseByType />
      <BrowseByMake />
      {/* <BrowseAccessories /> */}
      <ReviewSection />
      <StatsSection />
      <WhyChooseUs />
      <Footer />
    </div>
  );
};

export default Index;
