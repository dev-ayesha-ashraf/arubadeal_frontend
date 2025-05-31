import React from "react";
import { SelectContent, SelectItem } from "@/components/ui/select";

const ListingSubFilter = () => {
  return (
    <SelectContent>
      <SelectItem value="newestfirst">Newest First</SelectItem>
      <SelectItem value="oldestfirst">Oldest First</SelectItem>
      <SelectItem value="price-low-high">Price: Low to High</SelectItem>
      <SelectItem value="price-high-low">Price: High to Low</SelectItem>
    </SelectContent>
  );
};

export default ListingSubFilter;
