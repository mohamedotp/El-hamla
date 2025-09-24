"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft, MagnifyingGlass } from "@phosphor-icons/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import axios from "axios";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { UserRole } from "@/queries/login";

export default function VehicleDetailsPage() {
  const params = useParams();
  const vehicleId = params.id;

  const [vehicle, setVehicle] = useState<any>(null);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loadingPurchases, setLoadingPurchases] = useState(true);
  const [searchTermPurchases, setSearchTermPurchases] = useState("");

  const [sales, setSales] = useState<any[]>([]);
  const [loadingSales, setLoadingSales] = useState(true);
  const [searchProductName, setSearchProductName] = useState("");
  const [selectedInvoiceNumber, setSelectedInvoiceNumber] = useState("");
  const [invoiceNumbers, setInvoiceNumbers] = useState<string[]>([]);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [salesPercentage, setSalesPercentage] = useState(0);

  useEffect(() => {
    // استرجاع معلومات المستخدم من التخزين المحلي
    const userInfoStr = localStorage.getItem('userInfo');
    if (userInfoStr) {
      try {
        const userInfo = JSON.parse(userInfoStr);
        setUserRole(userInfo.role as UserRole);
      } catch (error) {
        console.error('خطأ في تحليل معلومات المستخدم:', error);
      }
    }

    axios.get<any>(`/api/vehicles/${vehicleId}`).then((res) => setVehicle(res.data));

    setLoadingPurchases(true);
    axios.get<any[]>(`/api/vehicles/${vehicleId}/purchases`).then((res) => {
      setPurchases(res.data);
      setLoadingPurchases(false);
    });
  }, [vehicleId]);

  useEffect(() => {
    // جلب فواتير المبيعات فقط إذا كان المستخدم ليس من الصيانة
    if (userRole !== "maintenance") {
      setLoadingSales(true);
      axios
        .get<any[]>(`/api/vehicles/${vehicleId}/sales?search=${selectedInvoiceNumber}`)
        .then((res) => {
          setSales(res.data);
          setLoadingSales(false);
          const uniqueNumbers = Array.from(new Set(res.data.map((s) => s.number)));
          setInvoiceNumbers(uniqueNumbers);
        });
    }
  }, [vehicleId, selectedInvoiceNumber, userRole]);

  const filteredPurchases = purchases.filter((p) =>
    p.productName?.toLowerCase().includes(searchTermPurchases.toLowerCase())
  );

  const filteredSales = sales.filter((s) =>
    s.productName?.toLowerCase().includes(searchProductName.toLowerCase())
  );

  const totalPurchasesSum = filteredPurchases.reduce(
    (sum, p) => sum + p.purchasePrice,
    0
  );

  const percentageMultiplier = 1 + (Number(salesPercentage) || 0) / 100;
  const totalSalesSum = filteredSales.reduce(
    (sum, s) => sum + s.unitPrice * s.quantity * percentageMultiplier,
    0
  );

  const uniqueInvoiceNumbers = Array.from(new Set(sales.map((sale) => sale.number)));

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">تفاصيل السيارة</h2>
        <Link href="/vehicles" className="p-2 rounded hover:bg-gray-100 transition">
          <ArrowLeft className="w-6 h-6" />
        </Link>
      </div>

      {vehicle && (
        <div className="bg-white shadow p-4 rounded-xl space-y-2 text-md">
          <p>اسم السيارة: {vehicle.name}</p>
          <p>رقم السيارة: {vehicle.Government_number}</p>
          <p>الجهة : {vehicle.address}</p>
          <p>الموديل: {vehicle.model}</p>
          <p>عدد أوامر الشغل: {vehicle.workOrders?.length || 0}</p>
          {userRole !== "maintenance" && (
            <>
              <p>عدد فواتير المبيعات: {uniqueInvoiceNumbers.length || 0}</p>
              <p>فواتير المبيعات : {uniqueInvoiceNumbers.join(", ")}</p>
            </>
          )}
        </div>
      )}

      <Tabs defaultValue="purchases" className="mt-4" dir="rtl">
        <TabsList className="bg-gray-100 rounded-md">
          <TabsTrigger value="purchases">فواتير المشتريات</TabsTrigger>
          {userRole !== "maintenance" && (
            <TabsTrigger value="sales">فواتير المبيعات</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="purchases" className="mt-4">
          <Input
            type="search"
            placeholder="بحث عن منتج..."
            value={searchTermPurchases}
            onChange={(e) => setSearchTermPurchases(e.target.value)}
            spellCheck={false}
            className="mb-2"
          />

          {loadingPurchases ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-gray-500" size={24} />
            </div>
          ) : filteredPurchases.length === 0 ? (
            <p className="text-center py-10 text-gray-500">لا توجد نتائج.</p>
          ) : (
            <>
              <Table dir="rtl">
                <TableHeader>
                  <TableRow>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>المنتج</TableHead>
                    <TableHead>الكمية</TableHead>
                    <TableHead>السعر</TableHead>
                    <TableHead>المورد</TableHead>
                    <TableHead>المشترى</TableHead>
                    <TableHead>تم التسليم؟</TableHead>
                    <TableHead>تاريخ التسليم</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPurchases.map((purchase) => (
                    <TableRow key={purchase.id} className="hover:bg-gray-50">
                      <TableCell>{new Date(purchase.date).toLocaleDateString("ar-EG")}</TableCell>
                      <TableCell>{purchase.productName}</TableCell>
                      <TableCell>{purchase.quantity}</TableCell>
                      <TableCell>{purchase.purchasePrice.toLocaleString()} جنيه</TableCell>
                      <TableCell>{purchase.supplierName}</TableCell>
                      <TableCell>{purchase.BuyerName}</TableCell>
                      <TableCell>{purchase.isDelivered ? "نعم" : "لا"}</TableCell>
                      <TableCell>
                        {purchase.deliveryDate ? new Date(purchase.deliveryDate).toLocaleDateString("ar-EG") : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4 text-sm font-semibold text-right">
                الإجمالي الكلي: {totalPurchasesSum.toLocaleString()} جنيه
              </div>
            </>
          )}
        </TabsContent>

        {userRole !== "maintenance" && (
          <TabsContent value="sales" className="mt-4">
            <Input
              placeholder="بحث عن منتج..."
              value={searchProductName}
              onChange={(e) => setSearchProductName(e.target.value)}
              className="mb-2"
              type="search"
              spellCheck={false}
            />
            <div className="flex gap-2 mb-4">
              <Input
                type="number"
                min="0"
                max="100"
                value={salesPercentage}
                onChange={e => setSalesPercentage(Number(e.target.value))}
                className="w-32"
                placeholder="نسبة %"
              />
              <span className="self-center text-sm text-gray-600">نسبة زيادة على السعر (%)</span>
            </div>
            <select
              value={selectedInvoiceNumber}
              onChange={(e) => setSelectedInvoiceNumber(e.target.value)}
              className="w-full border p-2 rounded-md mb-4"
            >
              <option value="">كل الفواتير</option>
              {invoiceNumbers.map((number) => (
                <option key={number} value={number}>
                  فاتورة رقم {number}
                </option>
              ))}
            </select>
            {loadingSales ? (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin text-gray-500" size={24} />
              </div>
            ) : filteredSales.length === 0 ? (
              <p className="text-center py-10 text-gray-500">لا توجد نتائج.</p>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>التاريخ</TableHead>
                      <TableHead>اسم العميل</TableHead>
                      <TableHead>المنتج</TableHead>
                      <TableHead>الكمية</TableHead>
                      <TableHead>السعر بعد النسبة</TableHead>
                      <TableHead>الإجمالي بعد النسبة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSales.map((sale) => {
                      const newUnitPrice = sale.unitPrice * percentageMultiplier;
                      const newTotal = newUnitPrice * sale.quantity;
                      return (
                        <TableRow key={sale.id} className="hover:bg-gray-50">
                          <TableCell>{sale.date ? new Date(sale.date).toLocaleDateString("ar-EG") : "—"}</TableCell>
                          <TableCell>{sale.customerName}</TableCell>
                          <TableCell>{sale.productName}</TableCell>
                          <TableCell>{sale.quantity}</TableCell>
                          <TableCell>{newUnitPrice.toLocaleString()} جنيه</TableCell>
                          <TableCell>{newTotal.toLocaleString()} جنيه</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                <div className="mt-4 text-sm font-semibold text-right">
                  الإجمالي الكلي بعد النسبة: {totalSalesSum.toLocaleString()} جنيه
                </div>
              </>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
