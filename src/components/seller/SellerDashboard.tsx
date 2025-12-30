import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Car, CheckCircle, DollarSign, TrendingUp } from "lucide-react";
import StatsCard from "../common/StatsCard";
import PieChartComponent from "../common/PieChartComponent";
import BarChart from "../common/BarChart";
import LineChartComponent from "../common/LineChartComponent";
import PageHeader from "../common/PageHeader";
import { LayoutDashboard } from "lucide-react";

const SellerDashboard = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const token = localStorage.getItem("access_token");

        const res = await fetch(
          `${API_URL}/seller_listing/my-listing?page=1&size=200`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        setListings(data.items || []);
        setLoading(false);
      } catch (err) {
        console.error("ERROR:", err);
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  if (loading) {
    return (
      <div className="px-6 py-6 flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  const totalListings = listings.length;
  const activeListings = listings.filter(l => l.is_active && !l.is_sold).length;
  const soldListings = listings.filter(l => l.is_sold).length;

  // Calculate total revenue from sold listings
  const totalRevenue = listings
    .filter(l => l.is_sold)
    .reduce((sum, item) => sum + (item.price || 0), 0);

  // Category distribution
  const categoryData = listings.reduce((acc, item) => {
    const category = item.body_type?.name || "Unknown";
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieChartData = Object.entries(categoryData)
    .map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      count: value as number,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Make distribution
  const makeData = listings.reduce((acc, item) => {
    const make = item.make?.name || "Unknown";
    acc[make] = (acc[make] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const makeChartData = Object.entries(makeData)
    .map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      count: value as number,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Monthly sales data
  const soldCars = listings.filter(l => l.is_sold);

  const monthlySales = soldCars.reduce((acc, item) => {
    const date = new Date(item.updated_at || item.created_at);
    const monthIndex = date.getMonth();
    const month = monthNames[monthIndex];

    if (!acc[month]) {
      acc[month] = { sold: 0, revenue: 0 };
    }

    acc[month].sold += 1;
    acc[month].revenue += item.price || 0;

    return acc;
  }, {});

  const salesChartData = monthNames.map(m => ({
    month: m,
    sold: monthlySales[m]?.sold || 0,
    revenue: monthlySales[m]?.revenue || 0,
  }));

  return (
    <div>
      <PageHeader
        title="Seller Dashboard"
        description="Overview of your listings and sales"
        icon={LayoutDashboard}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link to="/seller/listings" className="block">
          <StatsCard
            title="Total Listings"
            value={totalListings}
            icon={Car}
            variant="blue"
            className="hover:shadow-md transition-shadow cursor-pointer h-full"
          />
        </Link>
        <StatsCard
          title="Active Listings"
          value={activeListings}
          icon={CheckCircle}
          variant="green"
        />
        <StatsCard
          title="Sold Listings"
          value={soldListings}
          icon={DollarSign}
          variant="orange"
        />
        <StatsCard
          title="Total Revenue"
          value={`AWG ${(totalRevenue / 1000).toFixed(1)}k`}
          icon={TrendingUp}
          variant="purple"
        />
      </div>

      {/* Monthly Sales Chart */}
      <div className="mb-8">
        <LineChartComponent
          title="Monthly Sales & Revenue"
          data={salesChartData}
          xKey="month"
          height={350}
          lines={[
            { dataKey: "sold", color: "#8b5cf6", name: "Vehicles Sold" },
            { dataKey: "revenue", color: "#10b981", name: "Revenue ($)" },
          ]}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <BarChart
          title="Listings by Body Type"
          data={pieChartData}
          dataKey="count"
          xKey="name"
          color="#8b5cf6"
          height={350}
        />
        <BarChart
          title="Listings by Make"
          data={makeChartData}
          dataKey="count"
          xKey="name"
          color="#3b82f6"
          height={350}
        />
      </div>

      {/* Pie Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PieChartComponent
          title="Body Type Distribution"
          data={pieChartData}
          dataKey="count"
          nameKey="name"
          height={350}
        />
        <PieChartComponent
          title="Make Distribution"
          data={makeChartData}
          dataKey="count"
          nameKey="name"
          height={350}
        />
      </div>
    </div>
  );
};

export default SellerDashboard;
