import { useEffect, useState } from "react";
import { Car, Users, UserCheck, ShoppingCart } from "lucide-react";
import StatsCard from "../common/StatsCard";
import PieChartComponent from "../common/PieChartComponent";
import BarChart from "../common/BarChart";
import LineChartComponent from "../common/LineChartComponent";
import PageHeader from "../common/PageHeader";
import { LayoutDashboard } from "lucide-react";

interface DashboardData {
  total_vehical: number;
  active_dealer: number;
  active_seller: number;
  active_user: number;
  vehical_types: Array<{
    id: string;
    name: string;
    slug: string;
    image_url: string;
    count: number;
  }>;
  vehical_makes: Array<{
    id: string;
    name: string;
    slug: string;
    image_url: string;
    count: number;
  }>;
  monthly_sale: Array<{
    month: number;
    total_sold: number;
    total_sale: number;
  }>;
}

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/dashboard/`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="px-6 py-6 flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="px-6 py-6">
        <div className="text-lg text-red-600">Failed to load dashboard data</div>
      </div>
    );
  }
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const monthlySalesData = dashboardData.monthly_sale.map((item) => ({
    month: monthNames[item.month - 1],
    sold: item.total_sold,
    revenue: item.total_sale,
  }));

  const topVehicleTypes = dashboardData.vehical_types
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    .map((item) => ({
      name: item.name.charAt(0).toUpperCase() + item.name.slice(1),
      count: item.count,
    }));

  const topVehicleMakes = dashboardData.vehical_makes
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    .map((item) => ({
      name: item.name.charAt(0).toUpperCase() + item.name.slice(1),
      count: item.count,
    }));

  const totalRevenue = dashboardData.monthly_sale.reduce(
    (sum, item) => sum + item.total_sale,
    0
  );

  return (
    <div className="px-6 py-6">
      <PageHeader
        title="Admin Dashboard"
        description="Overview of your dealership performance"
        icon={LayoutDashboard}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Vehicles"
          value={dashboardData.total_vehical}
          icon={Car}
          variant="blue"
        />
        <StatsCard
          title="Active Sellers"
          value={dashboardData.active_seller}
          icon={UserCheck}
          variant="green"
        />
        <StatsCard
          title="Active Users"
          value={dashboardData.active_user}
          icon={Users}
          variant="orange"
        />
        <StatsCard
          title="Total Revenue"
          value={`AWG ${(totalRevenue / 1000).toFixed(1)}k`}
          icon={ShoppingCart}
          variant="purple"
        />
      </div>

      {/* Monthly Sales Chart */}
      <div className="mb-8">
        <LineChartComponent
          title="Monthly Sales & Revenue"
          data={monthlySalesData}
          xKey="month"
          height={350}
          lines={[
            { dataKey: "sold", color: "#8b5cf6", name: "Vehicles Sold" },
            { dataKey: "revenue", color: "#10b981", name: "Revenue (AWG)" },
          ]}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <BarChart
          title="Top 10 Vehicle Types"
          data={topVehicleTypes}
          dataKey="count"
          xKey="name"
          color="#8b5cf6"
          height={350}
        />
        <BarChart
          title="Top 10 Vehicle Makes"
          data={topVehicleMakes}
          dataKey="count"
          xKey="name"
          color="#3b82f6"
          height={350}
        />
      </div>

      {/* Pie Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PieChartComponent
          title="Vehicle Types Distribution"
          data={topVehicleTypes}
          dataKey="count"
          nameKey="name"
          height={350}
        />
        <PieChartComponent
          title="Vehicle Makes Distribution"
          data={topVehicleMakes}
          dataKey="count"
          nameKey="name"
          height={350}
        />
      </div>
    </div>
  );
};

export default Dashboard;
