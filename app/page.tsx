// app/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { DatePickerWithRange } from "@/components/date-range-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React from "react";

// Types for our analytics data
interface AnalyticsData {
  yearlySalesAndReturns: Array<{
    _id: number;
    totalSales: number;
    totalOrders: number;
    totalReturns: number;
    totalProfit: number;
  }>;
  regionalPerformance: Array<{
    _id: string;
    totalSales: number;
    totalOrders: number;
    totalReturns: number;
    avgDeliveryDays: number;
  }>;
  categoryPerformance: Array<{
    _id: string;
    totalSales: number;
    totalProfit: number;
    totalQuantity: number;
  }>;
  monthlyTrends: Array<{
    _id: {
      year: number;
      month: number;
      quarter: number;
    };
    totalSales: number;
    totalProfit: number;
    orderCount: number;
  }>;
  metadata: {
    lastUpdated: string;
    totalRecords: number;
  };
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | null>(
    null
  );
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchParams, setSearchParams] = useState<string>("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateRange?.from)
        params.append("startDate", dateRange.from.toISOString());
      if (dateRange?.to) params.append("endDate", dateRange.to.toISOString());
      if (selectedRegion) params.append("region", selectedRegion);
      if (selectedCategory) params.append("category", selectedCategory);
      if (searchParams) params.append("search", searchParams);

      const response = await fetch(`/api/analytics?${params.toString()}`);
      const result = await response.json();

      // Update the URL with the search parameters without page reload
      window.history.pushState(
        {},
        "",
        `${window.location.pathname}?${params.toString()}`
      );

      setData(result);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateRange, selectedRegion, selectedCategory, searchParams]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        No data available
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Add search input before the filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Search..."
          value={searchParams}
          onChange={(e) => setSearchParams(e.target.value)}
          className="border rounded-md p-2"
        />
        <DatePickerWithRange
          date={dateRange}
          setDate={(date) =>
            setDateRange(
              date && date.from && date.to
                ? { from: date.from, to: date.to }
                : null
            )
          }
        />
        <Select value={selectedRegion} onValueChange={setSelectedRegion}>
          <SelectTrigger>
            <SelectValue placeholder="Select Region" />
          </SelectTrigger>
          <SelectContent>
            {data.regionalPerformance.map((region) => (
              <SelectItem key={region._id} value={region._id}>
                {region._id}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Select Category" />
          </SelectTrigger>
          <SelectContent>
            {data.categoryPerformance.map((category) => (
              <SelectItem key={category._id} value={category._id}>
                {category._id}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              $
              {data.yearlySalesAndReturns
                .reduce((acc, curr) => acc + curr.totalSales, 0)
                .toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {data.yearlySalesAndReturns
                .reduce((acc, curr) => acc + curr.totalOrders, 0)
                .toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Returns</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {data.yearlySalesAndReturns
                .reduce((acc, curr) => acc + curr.totalReturns, 0)
                .toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              $
              {data.yearlySalesAndReturns
                .reduce((acc, curr) => acc + curr.totalProfit, 0)
                .toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Monthly Sales Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Sales Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey={(d) => `${d._id.year}-${d._id.month}`}
                    angle={-45}
                    textAnchor="end"
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="totalSales"
                    stroke="#8884d8"
                    name="Sales"
                  />
                  <Line
                    type="monotone"
                    dataKey="totalProfit"
                    stroke="#82ca9d"
                    name="Profit"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Regional Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Regional Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.regionalPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalSales" fill="#8884d8" name="Sales" />
                  <Bar dataKey="totalReturns" fill="#82ca9d" name="Returns" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.categoryPerformance}
                    dataKey="totalSales"
                    nameKey="_id"
                    cx="50%"
                    cy="50%"
                    outerRadius={150}
                    label
                  >
                    {data.categoryPerformance.map((entry, index) => (
                      <Cell
                        key={entry._id}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Yearly Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Yearly Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.yearlySalesAndReturns}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalSales" fill="#8884d8" name="Sales" />
                  <Bar dataKey="totalProfit" fill="#82ca9d" name="Profit" />
                  <Bar dataKey="totalReturns" fill="#ffc658" name="Returns" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Metadata */}
      <div className="text-sm text-gray-500 flex justify-between items-center p-4 bg-gray-50 rounded-lg">
        <div>
          Last updated: {new Date(data.metadata.lastUpdated).toLocaleString()}
        </div>
        <div className="flex gap-4">
          <span>
            Total Records: {data.metadata.totalRecords.toLocaleString()}
          </span>
          <span>
            Filtered Results:{" "}
            {data.yearlySalesAndReturns
              .reduce((acc, curr) => acc + curr.totalOrders, 0)
              .toLocaleString()}
          </span>
        </div>
      </div>

      {/* Optional Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Loading data...</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Add Error Boundary
// class ErrorBoundary extends React.Component<
//   { children: React.ReactNode },
//   { hasError: boolean }
// > {
//   constructor(props: { children: React.ReactNode }) {
//     super(props);
//     this.state = { hasError: false };
//   }

//   static getDerivedStateFromError(_: Error) {
//     return { hasError: true };
//   }

//   componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
//     console.error('Dashboard Error:', error, errorInfo);
//   }

//   render() {
//     if (this.state.hasError) {
//       return (
//         <div className="min-h-screen flex items-center justify-center">
//           <div className="text-center">
//             <h2 className="text-2xl font-bold text-gray-900 mb-2">
//               Something went wrong
//             </h2>
//             <p className="text-gray-600 mb-4">
//               There was an error loading the dashboard.
//             </p>
//             <button
//               onClick={() => this.setState({ hasError: false })}
//               className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
//             >
//               Try again
//             </button>
//           </div>
//         </div>
//       );
//     }

//     return this.props.children;
//   }
// }
