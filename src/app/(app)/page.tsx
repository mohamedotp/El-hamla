// app/dashboard/page.tsx
import DashboardClient from "./-components/Dashboardclient";
import { prisma } from "@/lib/prisma";

async function getDashboardData() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // الإحصائيات الأساسية
    const [totalProducts, totalVehicles, totalPurchaseInvoices, totalSalesInvoices] = await Promise.all([
      prisma.product.count(),
      prisma.vehicle.count(),
      prisma.purchaseInvoice.count(),
      prisma.salesInvoice.count(),
    ]);

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

    // الإحصائيات المالية - حساب إجمالي المشتريات
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

    const totalMonthlyPurchases = monthlyPurchaseItems.reduce(
      (sum, item) => sum + (item.quantity * item.purchasePrice),
      0
    );

    // المنتجات منخفضة المخزون
    const lowStockProducts = await prisma.product.findMany({
      where: {
        batches: {
          some: {
            quantity: {
              lte: 10,
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

    const productsWithSales = topSellingProducts.map(product => ({
      ...product,
      totalSold: product.salesItems.reduce((sum, item) => sum + item.soldQuantity, 0),
    })).sort((a, b) => b.totalSold - a.totalSold);

    // إحصائيات المركبات
    const vehicleStats = await prisma.vehicle.findMany({
      include: {
        sales: true,
        purchaseItems: true,
      },
    });

    const vehiclesWithActivity = vehicleStats.map(vehicle => ({
      ...vehicle,
      totalSales: vehicle.sales.length,
      totalPurchases: vehicle.purchaseItems.length,
    })).sort((a, b) => (b.totalSales + b.totalPurchases) - (a.totalSales + a.totalPurchases));

    return {
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
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return {
      basic: {
        totalProducts: 0,
        totalVehicles: 0,
        totalPurchaseInvoices: 0,
        totalSalesInvoices: 0,
      },
      financial: {
        monthlySales: 0,
        monthlyPurchases: 0,
        netProfit: 0,
      },
      alerts: {
        lowStockProducts: 0,
        outOfStockProducts: 0,
        pendingApprovals: 0,
        pendingDisbursements: 0,
      },
      topProducts: [],
      topVehicles: [],
      lowStockDetails: [],
      outOfStockDetails: [],
    };
  }
}

export default async function DashboardPage() {
  const dashboardData = await getDashboardData();
  
  return <DashboardClient data={dashboardData} />;
}
