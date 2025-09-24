import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("Starting dashboard stats fetch...");
    
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    console.log("Fetching basic stats...");
    // الإحصائيات الأساسية
    const [totalProducts, totalVehicles, totalPurchaseInvoices, totalSalesInvoices] = await Promise.all([
      prisma.product.count(),
      prisma.vehicle.count(),
      prisma.purchaseInvoice.count(),
      prisma.salesInvoice.count(),
    ]);

    console.log("Basic stats:", { totalProducts, totalVehicles, totalPurchaseInvoices, totalSalesInvoices });

    console.log("Fetching financial stats...");
    // الإحصائيات المالية - حساب إجمالي المبيعات من SalesInvoice
    const monthlySales = await prisma.salesInvoice.aggregate({
      where: {
        date: {
          gte: startOfMonth,
        },
      },
      _sum: {
        totalAmount: true,
      },
    });

    console.log("Monthly sales:", monthlySales);

    // الإحصائيات المالية - حساب إجمالي المشتريات بطريقة مختلفة
    const monthlyPurchaseItems = await prisma.purchaseInvoiceItem.findMany({
      where: {
        purchaseInvoice: {
          date: {
            gte: startOfMonth,
          },
        },
      },
      select: {
        quantity: true,
        purchasePrice: true,
      },
    });

    console.log("Monthly purchase items count:", monthlyPurchaseItems.length);

    // حساب إجمالي المشتريات
    const totalMonthlyPurchases = monthlyPurchaseItems.reduce(
      (sum, item) => sum + (item.quantity * item.purchasePrice),
      0
    );

    console.log("Total monthly purchases:", totalMonthlyPurchases);

    console.log("Fetching alerts...");
    // المنتجات منخفضة المخزون
    const lowStockProducts = await prisma.product.findMany({
      where: {
        batches: {
          some: {
            quantity: {
              lte: 10, // أقل من أو يساوي 10
            },
          },
        },
      },
      include: {
        batches: {
          where: {
            quantity: {
              lte: 10,
            },
          },
        },
      },
      take: 5,
    });

    // المنتجات التي نفدت
    const outOfStockProducts = await prisma.product.findMany({
      where: {
        batches: {
          none: {
            quantity: {
              gt: 0,
            },
          },
        },
      },
      take: 5,
    });

    // الفواتير المعلقة للموافقة
    const pendingApprovals = await prisma.salesInvoice.count({
      where: {
        approvalStatus: "Notapproved",
      },
    });

    // الفواتير المعلقة للصرف
    const pendingDisbursements = await prisma.salesInvoice.count({
      where: {
        approvalStatus: "Approved",
        disbursementStatus: "NotDisbursed",
      },
    });

    console.log("Alerts:", { 
      lowStockProducts: lowStockProducts.length, 
      outOfStockProducts: outOfStockProducts.length,
      pendingApprovals,
      pendingDisbursements
    });

    console.log("Fetching top products...");
    // أكثر المنتجات مبيعاً
    const topSellingProducts = await prisma.product.findMany({
      include: {
        salesItems: {
          include: {
            salesInvoice: true,
          },
        },
      },
      take: 5,
    });

    // حساب إجمالي المبيعات لكل منتج
    const productsWithSales = topSellingProducts.map(product => ({
      ...product,
      totalSold: product.salesItems.reduce((sum, item) => sum + item.soldQuantity, 0),
    })).sort((a, b) => b.totalSold - a.totalSold);

    console.log("Top products count:", productsWithSales.length);

    console.log("Fetching vehicle stats...");
    // إحصائيات المركبات - استخدام الأسماء الصحيحة للعلاقات
    const vehicleStats = await prisma.vehicle.findMany({
      include: {
        sales: true, // salesInvoices في schema
        purchaseItems: true,
      },
    });

    const vehiclesWithActivity = vehicleStats.map(vehicle => ({
      ...vehicle,
      totalSales: vehicle.sales.length,
      totalPurchases: vehicle.purchaseItems.length,
    })).sort((a, b) => (b.totalSales + b.totalPurchases) - (a.totalSales + a.totalPurchases));

    console.log("Vehicle stats count:", vehiclesWithActivity.length);

    const result = {
      basic: {
        totalProducts,
        totalVehicles,
        totalPurchaseInvoices,
        totalSalesInvoices,
      },
      financial: {
        monthlySales: monthlySales._sum.totalAmount || 0,
        monthlyPurchases: totalMonthlyPurchases,
        netProfit: (monthlySales._sum.totalAmount || 0) - totalMonthlyPurchases,
      },
      alerts: {
        lowStockProducts: lowStockProducts.length,
        outOfStockProducts: outOfStockProducts.length,
        pendingApprovals,
        pendingDisbursements,
      },
      topProducts: productsWithSales.slice(0, 5),
      topVehicles: vehiclesWithActivity.slice(0, 5),
      lowStockDetails: lowStockProducts,
      outOfStockDetails: outOfStockProducts,
    };

    console.log("Dashboard stats completed successfully");
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "فشل في جلب إحصائيات الداشبورد", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 