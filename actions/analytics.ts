// // actions/analytics.ts
// import clientPromise from '@/lib/mongodb';

// export async function getAnalyticsData() {
//   try {
//     const client = await clientPromise;
//     const db = client.db("powerbi");

//     // Yearly Sales and Returns Analysis
//     const yearlySalesAndReturns = await db.collection('orders').aggregate([
//       {
//         $lookup: {
//           from: 'returns',
//           localField: 'Order ID',
//           foreignField: 'Order ID',
//           as: 'return_info'
//         }
//       },
//       {
//         $group: {
//           _id: '$Year',
//           totalSales: { $sum: '$CY Sales' },
//           totalOrders: { $sum: 1 },
//           totalReturns: {
//             $sum: {
//               $cond: [{ $gt: [{ $size: '$return_info' }, 0] }, 1, 0]
//             }
//           },
//           totalProfit: { $sum: '$Profit' }
//         }
//       },
//       { $sort: { _id: 1 } }
//     ]).toArray();

//     // Regional Performance
//     const regionalPerformance = await db.collection('orders').aggregate([
//       {
//         $lookup: {
//           from: 'returns',
//           localField: 'Order ID',
//           foreignField: 'Order ID',
//           as: 'return_info'
//         }
//       },
//       {
//         $group: {
//           _id: '$Region',
//           totalSales: { $sum: '$CY Sales' },
//           totalOrders: { $sum: 1 },
//           totalReturns: {
//             $sum: {
//               $cond: [{ $gt: [{ $size: '$return_info' }, 0] }, 1, 0]
//             }
//           },
//           avgDeliveryDays: { $avg: '$Delivery Days' }
//         }
//       }
//     ]).toArray();

//     // Category Performance
//     const categoryPerformance = await db.collection('orders').aggregate([
//       {
//         $group: {
//           _id: '$Category',
//           totalSales: { $sum: '$CY Sales' },
//           totalProfit: { $sum: '$Profit' },
//           totalQuantity: { $sum: '$Quantity' }
//         }
//       }
//     ]).toArray();

//     // Monthly Trends with Quarter Analysis
//     const monthlyTrends = await db.collection('orders').aggregate([
//       {
//         $lookup: {
//           from: 'date-master',
//           localField: 'Order Date',
//           foreignField: 'Date',
//           as: 'date_info'
//         }
//       },
//       {
//         $unwind: '$date_info'
//       },
//       {
//         $group: {
//           _id: {
//             year: '$date_info.Year',
//             month: '$date_info.Month',
//             quarter: '$date_info.Qtr'
//           },
//           totalSales: { $sum: '$CY Sales' },
//           totalProfit: { $sum: '$Profit' },
//           orderCount: { $sum: 1 }
//         }
//       },
//       { 
//         $sort: { 
//           '_id.year': 1,
//           '_id.month': 1
//         } 
//       }
//     ]).toArray();

//     // Top Performing Products
//     const topProducts = await db.collection('orders').aggregate([
//       {
//         $group: {
//           _id: {
//             productId: '$Product ID',
//             productName: '$Product Name',
//             category: '$Category',
//             subCategory: '$Sub-Category'
//           },
//           totalSales: { $sum: '$CY Sales' },
//           totalQuantity: { $sum: '$Quantity' },
//           totalProfit: { $sum: '$Profit' }
//         }
//       },
//       {
//         $sort: { totalSales: -1 }
//       },
//       {
//         $limit: 10
//       }
//     ]).toArray();

//     // Returns Analysis by Region
//     const returnsAnalysis = await db.collection('returns').aggregate([
//       {
//         $group: {
//           _id: '$Region',
//           totalReturns: { $sum: '$Returned Order' }
//         }
//       },
//       {
//         $sort: { totalReturns: -1 }
//       }
//     ]).toArray();

//     return {
//       yearlySalesAndReturns,
//       regionalPerformance,
//       categoryPerformance,
//       monthlyTrends,
//       topProducts,
//       returnsAnalysis,
//       // Add metadata for the dashboard
//       metadata: {
//         lastUpdated: new Date().toISOString(),
//         totalRecords: await db.collection('orders').countDocuments()
//       }
//     };
//   } catch (error) {
//     console.error('Database Error:', error);
//     throw new Error('Failed to fetch analytics data');
//   }
// }

// // Add a new function for fetching filtered data
// export async function getFilteredAnalytics(filters: {
//   startDate?: string;
//   endDate?: string;
//   region?: string;
//   category?: string;
// }) {
//   try {
//     const client = await clientPromise;
//     const db = client.db("powerbi");

//     const matchStage: any = {};

//     if (filters.startDate || filters.endDate) {
//       matchStage['Order Date'] = {};
//       if (filters.startDate) matchStage['Order Date']['$gte'] = filters.startDate;
//       if (filters.endDate) matchStage['Order Date']['$lte'] = filters.endDate;
//     }

//     if (filters.region) matchStage['Region'] = filters.region;
//     if (filters.category) matchStage['Category'] = filters.category;

//     const filteredData = await db.collection('orders').aggregate([
//       {
//         $match: matchStage
//       },
//       {
//         $group: {
//           _id: {
//             year: '$Year',
//             month: { $substr: ['$Order Date', 3, 3] }
//           },
//           totalSales: { $sum: '$CY Sales' },
//           totalProfit: { $sum: '$Profit' },
//           orderCount: { $sum: 1 }
//         }
//       },
//       {
//         $sort: {
//           '_id.year': 1,
//           '_id.month': 1
//         }
//       }
//     ]).toArray();

//     return filteredData;
//   } catch (error) {
//     console.error('Database Error:', error);
//     throw new Error('Failed to fetch filtered analytics data');
//   }
// }