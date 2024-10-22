// "use client";

// import React, { useEffect, useState } from "react";
// import {
//   LineChart,
//   Line,
//   BarChart,
//   Bar,
//   PieChart,
//   Pie,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   Cell,
// } from "recharts";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Calendar } from "@/components/ui/calendar";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Skeleton } from "@/components/ui/skeleton";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import { Button } from "@/components/ui/button";
// import { Calendar as CalendarIcon } from "lucide-react";
// import { format } from "date-fns";
// import { getAnalyticsData, getFilteredAnalytics } from "@/actions/analytics";

// const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

// const LoadingSkeleton = () => (
//   <div className="space-y-4">
//     <Skeleton className="h-[300px] w-full" />
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//       <Skeleton className="h-[200px]" />
//       <Skeleton className="h-[200px]" />
//     </div>
//   </div>
// );

// const Dashboard = () => {
//   const [data, setData] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const [dateRange, setDateRange] = useState<{
//     from: Date | undefined;
//     to: Date | undefined;
//   }>({
//     from: undefined,
//     to: undefined,
//   });
//   const [selectedRegion, setSelectedRegion] = useState<string>("");
//   const [selectedCategory, setSelectedCategory] = useState<string>("");

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const fetchData = async () => {
//     setLoading(true);
//     try {
//       const analyticsData = await getAnalyticsData();
//       setData(analyticsData);
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     }
//     setLoading(false);
//   };

//   const applyFilters = async () => {
//     setLoading(true);
//     try {
//       const filteredData = await getFilteredAnalytics({
//         startDate: dateRange.from
//           ? format(dateRange.from, "dd-MMM-yy")
//           : undefined,
//         endDate: dateRange.to ? format(dateRange.to, "dd-MMM-yy") : undefined,
//         region: selectedRegion || undefined,
//         category: selectedCategory || undefined,
//       });
//       setData(filteredData);
//     } catch (error) {
//       console.error("Error applying filters:", error);
//     }
//     setLoading(false);
//   };

//   if (loading) return <LoadingSkeleton />;
//   if (!data) return <div>Error loading dashboard data</div>;

//   return (
//     <div className="p-4 space-y-4">
//       {/* Filters */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Filters</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="flex flex-wrap gap-4">
//             <Popover>
//               <PopoverTrigger asChild>
//                 <Button variant="outline">
//                   <CalendarIcon className="mr-2 h-4 w-4" />
//                   {dateRange.from ? (
//                     dateRange.to ? (
//                       <>
//                         {format(dateRange.from, "LLL dd, y")} -{" "}
//                         {format(dateRange.to, "LLL dd, y")}
//                       </>
//                     ) : (
//                       format(dateRange.from, "LLL dd, y")
//                     )
//                   ) : (
//                     <span>Pick a date range</span>
//                   )}
//                 </Button>
//               </PopoverTrigger>
//               <PopoverContent className="w-auto p-0">
//                 <Calendar
//                   mode="range"
//                   selected={{
//                     from: dateRange.from,
//                     to: dateRange.to,
//                   }}
//                   onSelect={(range: any) => setDateRange(range)}
//                   initialFocus
//                 />
//               </PopoverContent>
//             </Popover>

//             <Select value={selectedRegion} onValueChange={setSelectedRegion}>
//               <SelectTrigger className="w-[180px]">
//                 <SelectValue placeholder="Select Region" />
//               </SelectTrigger>
//               <SelectContent>
//                 {data.regionalPerformance?.map((region: any) => (
//                   <SelectItem key={region._id} value={region._id}>
//                     {region._id}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>

//             <Select
//               value={selectedCategory}
//               onValueChange={setSelectedCategory}
//             >
//               <SelectTrigger className="w-[180px]">
//                 <SelectValue placeholder="Select Category" />
//               </SelectTrigger>
//               <SelectContent>
//                 {data.categoryPerformance?.map((category: any) => (
//                   <SelectItem key={category._id} value={category._id}>
//                     {category._id}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>

//             <Button onClick={applyFilters}>Apply Filters</Button>
//             <Button variant="outline" onClick={fetchData}>
//               Reset
//             </Button>
//           </div>
//         </CardContent>
//       </Card>

//       <Tabs defaultValue="overview" className="w-full">
//         <TabsList>
//           <TabsTrigger value="overview">Overview</TabsTrigger>
//           <TabsTrigger value="sales">Sales Analysis</TabsTrigger>
//           <TabsTrigger value="products">Products</TabsTrigger>
//           <TabsTrigger value="returns">Returns</TabsTrigger>
//         </TabsList>

//         <TabsContent value="overview">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <Card>
//               <CardHeader>
//                 <CardTitle>Sales Overview</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="h-[300px]">
//                   <ResponsiveContainer width="100%" height="100%">
//                     <LineChart data={data.yearlySalesAndReturns}>
//                       <CartesianGrid strokeDasharray="3 3" />
//                       <XAxis dataKey="_id" />
//                       <YAxis />
//                       <Tooltip />
//                       <Legend />
//                       <Line
//                         type="monotone"
//                         dataKey="totalSales"
//                         stroke="#0088FE"
//                         name="Sales"
//                       />
//                       <Line
//                         type="monotone"
//                         dataKey="totalProfit"
//                         stroke="#00C49F"
//                         name="Profit"
//                       />
//                     </LineChart>
//                   </ResponsiveContainer>
//                 </div>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardHeader>
//                 <CardTitle>Category Distribution</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="h-[300px]">
//                   <ResponsiveContainer width="100%" height="100%">
//                     <PieChart>
//                       <Pie
//                         data={data.categoryPerformance}
//                         dataKey="totalSales"
//                         nameKey="_id"
//                         cx="50%"
//                         cy="50%"
//                         outerRadius={80}
//                         label
//                       >
//                         {data.categoryPerformance?.map(
//                           (_: number, index: number) => (
//                             <Cell
//                               key={`cell-${index}`}
//                               fill={COLORS[index % COLORS.length]}
//                             />
//                           )
//                         )}
//                       </Pie>
//                       <Tooltip />
//                       <Legend />
//                     </PieChart>
//                   </ResponsiveContainer>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </TabsContent>

//         <TabsContent value="sales">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <Card>
//               <CardHeader>
//                 <CardTitle>Regional Performance</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="h-[300px]">
//                   <ResponsiveContainer width="100%" height="100%">
//                     <BarChart data={data.regionalPerformance}>
//                       <CartesianGrid strokeDasharray="3 3" />
//                       <XAxis dataKey="_id" />
//                       <YAxis />
//                       <Tooltip />
//                       <Legend />
//                       <Bar dataKey="totalSales" fill="#0088FE" name="Sales" />
//                       <Bar dataKey="totalOrders" fill="#00C49F" name="Orders" />
//                     </BarChart>
//                   </ResponsiveContainer>
//                 </div>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardHeader>
//                 <CardTitle>Monthly Trends</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="h-[300px]">
//                   <ResponsiveContainer width="100%" height="100%">
//                     <LineChart data={data.monthlyTrends}>
//                       <CartesianGrid strokeDasharray="3 3" />
//                       <XAxis
//                         dataKey="_id"
//                         tickFormatter={(value) =>
//                           `${value.month} ${value.year}`
//                         }
//                       />
//                       <YAxis />
//                       <Tooltip />
//                       <Legend />
//                       <Line
//                         type="monotone"
//                         dataKey="totalSales"
//                         stroke="#0088FE"
//                         name="Sales"
//                       />
//                       <Line
//                         type="monotone"
//                         dataKey="orderCount"
//                         stroke="#00C49F"
//                         name="Orders"
//                       />
//                     </LineChart>
//                   </ResponsiveContainer>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </TabsContent>

//         <TabsContent value="products">
//           <Card>
//             <CardHeader>
//               <CardTitle>Top Products Performance</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="h-[400px]">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <BarChart
//                     data={data.topProducts}
//                     layout="vertical"
//                     margin={{ left: 150 }}
//                   >
//                     <CartesianGrid strokeDasharray="3 3" />
//                     <XAxis type="number" />
//                     <YAxis
//                       type="category"
//                       dataKey="_id.productName"
//                       width={150}
//                     />
//                     <Tooltip />
//                     <Legend />
//                     <Bar dataKey="totalSales" fill="#0088FE" name="Sales" />
//                     <Bar dataKey="totalProfit" fill="#00C49F" name="Profit" />
//                   </BarChart>
//                 </ResponsiveContainer>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="returns">
//           <Card>
//             <CardHeader>
//               <CardTitle>Returns by Region</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="h-[400px]">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <BarChart data={data.returnsAnalysis}>
//                     <CartesianGrid strokeDasharray="3 3" />
//                     <XAxis dataKey="_id" />
//                     <YAxis />
//                     <Tooltip />
//                     <Legend />
//                     <Bar dataKey="totalReturns" fill="#FF8042" name="Returns" />
//                   </BarChart>
//                 </ResponsiveContainer>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// };

// export default Dashboard;
