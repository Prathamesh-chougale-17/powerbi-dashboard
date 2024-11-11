// app/api/analytics/route.ts
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic'; // Add this line

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db("powerbi");
    const searchParams = request.nextUrl.searchParams;
    
    // Get filter parameters
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const region = searchParams.get('region');
    const category = searchParams.get('category');

    // Base match stage for filtering
    const matchStage: Record<string, string | { $gte?: string; $lte?: string }> = {};
    
    if (startDate || endDate) {
      matchStage['Order Date'] = {} as { $gte?: string; $lte?: string };
      if (startDate) matchStage['Order Date']['$gte'] = startDate;
      if (endDate) matchStage['Order Date']['$lte'] = endDate;
    }
    
    if (region) matchStage['Region'] = region;
    if (category) matchStage['Category'] = category;

    // Yearly Sales and Returns Analysis
    const yearlySalesAndReturns = await db.collection('orders').aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'returns',
          localField: 'Order ID',
          foreignField: 'Order ID',
          as: 'return_info'
        }
      },
      {
        $group: {
          _id: '$Year',
          totalSales: { $sum: '$CY Sales' },
          totalOrders: { $sum: 1 },
          totalReturns: {
            $sum: {
              $cond: [{ $gt: [{ $size: '$return_info' }, 0] }, 1, 0]
            }
          },
          totalProfit: { $sum: '$Profit' }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();

    // Regional Performance
    const regionalPerformance = await db.collection('orders').aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'returns',
          localField: 'Order ID',
          foreignField: 'Order ID',
          as: 'return_info'
        }
      },
      {
        $group: {
          _id: '$Region',
          totalSales: { $sum: '$CY Sales' },
          totalOrders: { $sum: 1 },
          totalReturns: {
            $sum: {
              $cond: [{ $gt: [{ $size: '$return_info' }, 0] }, 1, 0]
            }
          },
          avgDeliveryDays: { $avg: '$Delivery Days' }
        }
      }
    ]).toArray();

    // Category Performance
    const categoryPerformance = await db.collection('orders').aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$Category',
          totalSales: { $sum: '$CY Sales' },
          totalProfit: { $sum: '$Profit' },
          totalQuantity: { $sum: '$Quantity' }
        }
      }
    ]).toArray();

    // Monthly Trends
    const monthlyTrends = await db.collection('orders').aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'date-master',
          localField: 'Order Date',
          foreignField: 'Date',
          as: 'date_info'
        }
      },
      {
        $unwind: '$date_info'
      },
      {
        $group: {
          _id: {
            year: '$date_info.Year',
            month: '$date_info.Month',
            quarter: '$date_info.Qtr'
          },
          totalSales: { $sum: '$CY Sales' },
          totalProfit: { $sum: '$Profit' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]).toArray();

    return NextResponse.json({
      yearlySalesAndReturns,
      regionalPerformance,
      categoryPerformance,
      monthlyTrends,
      metadata: {
        lastUpdated: new Date().toISOString(),
        totalRecords: await db.collection('orders').countDocuments(matchStage)
      }
    });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}