"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  PieChart, 
  Truck, 
  ShoppingCart, 
  ClipboardList, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign,
  Package,
  Clock,
  CheckCircle
} from "lucide-react";

interface DashboardData {
  basic: {
    totalProducts: number;
    totalVehicles: number;
    totalPurchaseInvoices: number;
    totalSalesInvoices: number;
  };
  financial: {
    monthlySales: number;
    monthlyPurchases: number;
    netProfit: number;
  };
  alerts: {
    lowStockProducts: number;
    outOfStockProducts: number;
    pendingApprovals: number;
    pendingDisbursements: number;
  };
  topProducts: any[];
  topVehicles: any[];
  lowStockDetails: any[];
  outOfStockDetails: any[];
}

export default function DashboardClient({ data }: { data: DashboardData }) {
  const basicCards = [
    {
      title: "إجمالي المنتجات",
      value: data.basic.totalProducts,
      icon: <PieChart className="h-6 w-6 text-primary" />,
      color: "text-primary",
    },
    {
      title: "عدد المركبات",
      value: data.basic.totalVehicles,
      icon: <Truck className="h-6 w-6 text-green-600" />,
      color: "text-green-600",
    },
    {
      title: "فواتير الشراء",
      value: data.basic.totalPurchaseInvoices,
      icon: <ShoppingCart className="h-6 w-6 text-blue-600" />,
      color: "text-blue-600",
    },
    {
      title: "فواتير البيع",
      value: data.basic.totalSalesInvoices,
      icon: <ClipboardList className="h-6 w-6 text-red-600" />,
      color: "text-red-600",
    },
  ];

  const financialCards = [
    {
      title: "المبيعات الشهرية",
      value: `${data.financial.monthlySales.toLocaleString()} ج.م`,
      icon: <TrendingUp className="h-6 w-6 text-green-600" />,
      color: "text-green-600",
    },
    {
      title: "المشتريات الشهرية",
      value: `${data.financial.monthlyPurchases.toLocaleString()} ج.م`,
      icon: <ShoppingCart className="h-6 w-6 text-blue-600" />,
      color: "text-blue-600",
    },
    {
      title: "صافي الربح",
      value: `${data.financial.netProfit.toLocaleString()} ج.م`,
      icon: <DollarSign className="h-6 w-6 text-purple-600" />,
      color: data.financial.netProfit >= 0 ? "text-green-600" : "text-red-600",
    },
  ];

  const alertCards = [
    {
      title: "منتجات منخفضة المخزون",
      value: data.alerts.lowStockProducts,
      icon: <AlertTriangle className="h-6 w-6 text-yellow-600" />,
      color: "text-yellow-600",
      badge: data.alerts.lowStockProducts > 0 ? "تحتاج انتباه" : "ممتاز",
      badgeColor: data.alerts.lowStockProducts > 0 ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800",
    },
    {
      title: "منتجات نفدت",
      value: data.alerts.outOfStockProducts,
      icon: <Package className="h-6 w-6 text-red-600" />,
      color: "text-red-600",
      badge: data.alerts.outOfStockProducts > 0 ? "تحتاج إعادة طلب" : "ممتاز",
      badgeColor: data.alerts.outOfStockProducts > 0 ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800",
    },
    {
      title: "فواتير تنتظر الموافقة",
      value: data.alerts.pendingApprovals,
      icon: <Clock className="h-6 w-6 text-orange-600" />,
      color: "text-orange-600",
      badge: data.alerts.pendingApprovals > 0 ? "تحتاج مراجعة" : "ممتاز",
      badgeColor: data.alerts.pendingApprovals > 0 ? "bg-orange-100 text-orange-800" : "bg-green-100 text-green-800",
    },
    {
      title: "فواتير تنتظر الصرف",
      value: data.alerts.pendingDisbursements,
      icon: <CheckCircle className="h-6 w-6 text-blue-600" />,
      color: "text-blue-600",
      badge: data.alerts.pendingDisbursements > 0 ? "تحتاج صرف" : "ممتاز",
      badgeColor: data.alerts.pendingDisbursements > 0 ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800",
    },
  ];

  return (
    <div className="space-y-6 p-4">
      {/* الإحصائيات الأساسية */}
      <div>
        <h2 className="text-xl font-bold mb-4">الإحصائيات الأساسية</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {basicCards.map((card, index) => (
            <Card key={index} className="rounded-2xl shadow-sm transition hover:scale-[1.01]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                {card.icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* الإحصائيات المالية */}
      <div>
        <h2 className="text-xl font-bold mb-4">الإحصائيات المالية</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {financialCards.map((card, index) => (
            <Card key={index} className="rounded-2xl shadow-sm transition hover:scale-[1.01]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                {card.icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* التنبيهات والإشعارات */}
      <div>
        <h2 className="text-xl font-bold mb-4">التنبيهات والإشعارات</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {alertCards.map((card, index) => (
            <Card key={index} className="rounded-2xl shadow-sm transition hover:scale-[1.01]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                {card.icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <Badge className={`mt-2 ${card.badgeColor}`}>
                  {card.badge}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* أكثر المنتجات مبيعاً */}
      {data.topProducts.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">أكثر المنتجات مبيعاً</h2>
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-6">
              <div className="space-y-3">
                {data.topProducts.map((product, index) => (
                  <div key={product.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <span className="text-lg font-bold text-gray-500">#{index + 1}</span>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-600">{product.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">{product.totalSold} وحدة</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* أكثر المركبات نشاطاً */}
      {data.topVehicles.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">أكثر المركبات نشاطاً</h2>
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-6">
              <div className="space-y-3">
                {data.topVehicles.map((vehicle, index) => (
                  <div key={vehicle.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <span className="text-lg font-bold text-gray-500">#{index + 1}</span>
                      <div>
                        <p className="font-medium">{vehicle.name}</p>
                        <p className="text-sm text-gray-600">{vehicle.Government_number}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">
                        {vehicle.totalSales + vehicle.totalPurchases} عملية
                      </p>
                      <p className="text-xs text-gray-600">
                        {vehicle.totalSales} مبيعات • {vehicle.totalPurchases} مشتريات
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* تفاصيل المنتجات منخفضة المخزون */}
      {data.lowStockDetails.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">المنتجات منخفضة المخزون</h2>
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-6">
              <div className="space-y-3">
                {data.lowStockDetails.map((product) => (
                  <div key={product.id} className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div>
                      <p className="font-medium text-yellow-800">{product.name}</p>
                      <p className="text-sm text-yellow-600">{product.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">
                        {product.batches.reduce((sum: number, batch: any) => sum + batch.quantity, 0)} وحدة متبقية
                      </p>
                      <Badge className="bg-yellow-100 text-yellow-800 mt-1">
                        منخفض المخزون
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* تفاصيل المنتجات التي نفدت */}
      {data.outOfStockDetails.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">المنتجات التي نفدت</h2>
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-6">
              <div className="space-y-3">
                {data.outOfStockDetails.map((product) => (
                  <div key={product.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                    <div>
                      <p className="font-medium text-red-800">{product.name}</p>
                      <p className="text-sm text-red-600">{product.category}</p>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-red-100 text-red-800">
                        نفد من المخزون
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
