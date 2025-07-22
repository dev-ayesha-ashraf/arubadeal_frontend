import { DealerCard } from "@/components/common/DealerCard";
import { Footer } from "@/components/common/Footer";
import { Header } from "@/components/common/Header";
import { Navbar } from "@/components/common/Navbar";

const Dealers = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navbar />
      <div className="container mx-auto px-4 py-8 mt-16 md:mt-0">
        <h1 className="text-3xl font-bold text-dealership-primary mb-8">
          Our Trusted Dealers
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Placeholder dealers */}
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <DealerCard key={item} />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dealers;
