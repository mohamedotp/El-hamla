"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Props {
  id: string;
}

export default function MovementClient({ id }: Props) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductMovement = async () => {
      try {
        const res = await fetch(`/api/products/${id}/movement`);
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        console.error("فشل في جلب حركة الصنف", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProductMovement();
  }, [id]);

  if (loading) return <div>...جاري التحميل</div>;
  if (!product) return <div>لم يتم العثور على بيانات المنتج.</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">حركة الصنف: {product.name}</h2>
      <Card>
        <CardContent className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم الدفعة</TableHead>
                <TableHead>الكمية الأصلية</TableHead>
                <TableHead>المباع</TableHead>
                <TableHead>المتبقي</TableHead>
                <TableHead>تاريخ الشراء</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {product.batches.map((batch: any) => (
                <TableRow key={batch.id}>
                  <TableCell>{batch.batchNumber || "—"}</TableCell>
                  <TableCell>{batch.quantity}</TableCell>
                  <TableCell>{batch.soldQuantity}</TableCell>
                  <TableCell>{batch.quantity - batch.soldQuantity}</TableCell>
                  <TableCell>
                    {batch?.purchaseItem?.purchaseInvoice?.date
                      ? new Date(batch.purchaseItem.purchaseInvoice.date).toLocaleDateString()
                      : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
