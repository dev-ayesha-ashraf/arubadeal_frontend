import { useParams } from "react-router-dom";
import { Header } from "@/components/common/Header";
import { Navbar } from "@/components/common/Navbar";
import { ListingsFilter } from "@/components/common/ListingsFilter";
import { Footer } from "@/components/common/Footer";
// import ListingsContent from "./ListingsContent";
import ListingsContent from "./listingsContent";

const FilteredListings = () => {
  const { filter } = useParams<{ filter: string }>();

  return (
    <div className="min-h-screen">
      <Header />
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-8">
          <ListingsFilter />
          <ListingsContent initialFilter={filter || "newestfirst"} />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FilteredListings;
