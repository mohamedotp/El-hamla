"use client";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { useEffect } from "react";

export default function ProductEditClientPage({ product }: { product: any }) {
  const [form, setForm] = useState({
    name: product.name || "",
    barcode: product.barcode || "",
    category: product.category || "",
    unit: product.unit || "",
    receivingParty: product.receivingParty || "",
  });
  const [batches, setBatches] = useState(product.batches || []);
  const [salesItems, setSalesItems] = useState(product.salesItems || []);
  const [purchaseItems, setPurchaseItems] = useState(product.purchaseItems || []);
  const [editBatch, setEditBatch] = useState<any>(null);
  const [editSale, setEditSale] = useState<any>(null);
  const [editPurchase, setEditPurchase] = useState<any>(null);
  const [addBatchOpen, setAddBatchOpen] = useState(false);
  const [addSaleOpen, setAddSaleOpen] = useState(false);
  const [addPurchaseOpen, setAddPurchaseOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // تحديث البيانات بعد أي عملية (يمكنك ربطها بـ API حقيقي)
  const refreshData = async () => {
    // TODO: fetch updated product data from API
    toast.info("تم تحديث البيانات (تجريبي)");
  };

  const fetchProduct = async () => {
    const res = await fetch(`/api/products/${product.id}?id=${product.id}`);
    if (res.ok) {
      const data = await res.json();
      setBatches(data.batches || []);
      setSalesItems(data.salesItems || []);
      setPurchaseItems(data.purchaseItems || []);
    }
  };

  // --- الدُفعات ---
  const handleBatchSave = async (batch: any) => {
    setLoading(true);
    try {
      const res = await fetch("/api/products/batch", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(batch),
      });
      if (!res.ok) throw new Error((await res.json()).error || "فشل التعديل");
      toast.success("تم حفظ الدفعة بنجاح");
      setEditBatch(null);
      await fetchProduct();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };
  const handleBatchDelete = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/products/batch", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "فشل الحذف");
      toast.success("تم حذف الدفعة بنجاح");
      setEditBatch(null);
      await fetchProduct();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };
  const handleBatchAdd = async (batch: any) => {
    setLoading(true);
    try {
      const res = await fetch("/api/products/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...batch, productId: product.id }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "فشل الإضافة");
      toast.success("تمت إضافة الدفعة بنجاح");
      setAddBatchOpen(false);
      await fetchProduct();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  // --- المبيعات ---
  const handleSaleSave = async (item: any) => {
    setLoading(true);
    try {
      const res = await fetch("/api/products/sales-item", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      if (!res.ok) throw new Error((await res.json()).error || "فشل التعديل");
      toast.success("تم حفظ عنصر المبيعات بنجاح");
      setEditSale(null);
      await fetchProduct();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };
  const handleSaleDelete = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/products/sales-item", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "فشل الحذف");
      toast.success("تم حذف عنصر المبيعات بنجاح");
      setEditSale(null);
      await fetchProduct();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };
  const handleSaleAdd = async (item: any) => {
    setLoading(true);
    try {
      const res = await fetch("/api/products/sales-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...item, productId: product.id }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "فشل الإضافة");
      toast.success("تمت إضافة عنصر مبيعات بنجاح");
      setAddSaleOpen(false);
      await fetchProduct();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  // --- المشتريات ---
  const handlePurchaseSave = async (item: any) => {
    setLoading(true);
    try {
      const res = await fetch("/api/products/purchase-item", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      if (!res.ok) throw new Error((await res.json()).error || "فشل التعديل");
      toast.success("تم حفظ عنصر المشتريات بنجاح");
      setEditPurchase(null);
      await fetchProduct();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };
  const handlePurchaseDelete = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/products/purchase-item", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "فشل الحذف");
      toast.success("تم حذف عنصر المشتريات بنجاح");
      setEditPurchase(null);
      await fetchProduct();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };
  const handlePurchaseAdd = async (item: any) => {
    setLoading(true);
    try {
      const res = await fetch("/api/products/purchase-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...item, productId: product.id }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "فشل الإضافة");
      toast.success("تمت إضافة عنصر مشتريات بنجاح");
      setAddPurchaseOpen(false);
      await fetchProduct();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBasicSave = async () => {
    // TODO: Call API to update product basic info
    toast.success("تم حفظ بيانات المنتج الأساسية بنجاح");
  };

  return (
    <div className="p-6 max-w-screen-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">تعديل المنتج: {product.name}</h1>
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="basic">البيانات الأساسية</TabsTrigger>
          <TabsTrigger value="batches">الدفعات</TabsTrigger>
          <TabsTrigger value="sales">المبيعات</TabsTrigger>
          <TabsTrigger value="purchases">المشتريات</TabsTrigger>
        </TabsList>
        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>البيانات الأساسية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>اسم المنتج</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="اسم المنتج" />
              </div>
              <div>
                <Label>الباركود</Label>
                <Input value={form.barcode} onChange={e => setForm(f => ({ ...f, barcode: e.target.value }))} placeholder="الباركود" />
              </div>
              <div>
                <Label>التصنيف</Label>
                <Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="التصنيف" />
              </div>
              <div>
                <Label>الوحدة</Label>
                <Input value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} placeholder="الوحدة" />
              </div>
              <div>
                <Label>جهة الاستلام</Label>
                <Input value={form.receivingParty} onChange={e => setForm(f => ({ ...f, receivingParty: e.target.value }))} placeholder="جهة الاستلام" />
              </div>
              <Button onClick={handleBasicSave}>حفظ البيانات الأساسية</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="batches">
          {/* TODO: جدول الدُفعات مع إمكانيات التعديل */}
          <Card>
            <CardHeader><CardTitle>الدفعات</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم الدفعة</TableHead>
                    <TableHead>الكمية</TableHead>
                    <TableHead>الكمية المباعة</TableHead>
                    <TableHead>السعر</TableHead>
                    <TableHead>إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batches.map((batch: any) => (
                    <TableRow key={batch.id}>
                      <TableCell>{batch.batchNumber}</TableCell>
                      <TableCell>{batch.quantity}</TableCell>
                      <TableCell>{batch.soldQuantity}</TableCell>
                      <TableCell>{batch.price}</TableCell>
                      <TableCell>
                        {/* TODO: أزرار تعديل/حذف */}
                        <Button size="sm" variant="outline" onClick={() => setEditBatch(batch)}>تعديل</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Button onClick={() => setAddBatchOpen(true)}>إضافة دفعة جديدة</Button>
            </CardContent>
          </Card>
          <Dialog open={!!editBatch} onOpenChange={v => !v && setEditBatch(null)}>
            <DialogContent>
              <DialogHeader><DialogTitle>تعديل الدفعة</DialogTitle></DialogHeader>
              {editBatch && (
                <form onSubmit={e => { e.preventDefault(); handleBatchSave(editBatch); }} className="space-y-4">
                  <div>
                    <Label>رقم الدفعة</Label>
                    <Input value={editBatch.batchNumber || ""} onChange={e => setEditBatch((b: any) => ({ ...b, batchNumber: e.target.value }))} />
                  </div>
                  <div>
                    <Label>الكمية</Label>
                    <Input type="number" value={editBatch.quantity || ""} onChange={e => setEditBatch((b: any) => ({ ...b, quantity: +e.target.value }))} />
                  </div>
                  <div>
                    <Label>السعر</Label>
                    <Input type="number" value={editBatch.price || ""} onChange={e => setEditBatch((b: any) => ({ ...b, price: +e.target.value }))} />
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={loading}>حفظ</Button>
                    <Button type="button" variant="destructive" onClick={() => handleBatchDelete(editBatch.id)} disabled={loading}>حذف</Button>
                    <DialogClose asChild><Button type="button" variant="outline">إلغاء</Button></DialogClose>
                  </DialogFooter>
                </form>
              )}
            </DialogContent>
          </Dialog>
          <Dialog open={addBatchOpen} onOpenChange={setAddBatchOpen}>
            <DialogContent>
              <DialogHeader><DialogTitle>إضافة دفعة جديدة</DialogTitle></DialogHeader>
              <form onSubmit={e => {
                e.preventDefault();
                const form = e.target as any;
                handleBatchAdd({
                  batchNumber: form.batchNumber.value,
                  quantity: +form.quantity.value,
                  price: +form.price.value,
                });
              }} className="space-y-4">
                <div>
                  <Label>رقم الدفعة</Label>
                  <Input name="batchNumber" />
                </div>
                <div>
                  <Label>الكمية</Label>
                  <Input name="quantity" type="number" />
                </div>
                <div>
                  <Label>السعر</Label>
                  <Input name="price" type="number" />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={loading}>إضافة</Button>
                  <DialogClose asChild><Button type="button" variant="outline">إلغاء</Button></DialogClose>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </TabsContent>
        <TabsContent value="sales">
          {/* TODO: جدول المبيعات مع إمكانيات التعديل */}
          <Card>
            <CardHeader><CardTitle>المبيعات</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم الفاتورة</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>الكمية</TableHead>
                    <TableHead>سعر الوحدة</TableHead>
                    <TableHead>إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesItems.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.salesInvoice?.number || item.salesInvoice?.id}</TableCell>
                      <TableCell>{item.salesInvoice?.date?.slice(0, 10)}</TableCell>
                      <TableCell>{item.soldQuantity}</TableCell>
                      <TableCell>{item.unitPrice}</TableCell>
                      <TableCell>
                        {/* TODO: أزرار تعديل/حذف */}
                        <Button size="sm" variant="outline" onClick={() => setEditSale(item)}>تعديل</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Button onClick={() => setAddSaleOpen(true)}>إضافة عنصر مبيعات جديد</Button>
            </CardContent>
          </Card>
          <Dialog open={!!editSale} onOpenChange={v => !v && setEditSale(null)}>
            <DialogContent>
              <DialogHeader><DialogTitle>تعديل عنصر مبيعات</DialogTitle></DialogHeader>
              {editSale && (
                <form onSubmit={e => { e.preventDefault(); handleSaleSave(editSale); }} className="space-y-4">
                  <div>
                    <Label>الكمية</Label>
                    <Input type="number" value={editSale.soldQuantity || ""} onChange={e => setEditSale((b: any) => ({ ...b, soldQuantity: +e.target.value }))} />
                  </div>
                  <div>
                    <Label>سعر الوحدة</Label>
                    <Input type="number" value={editSale.unitPrice || ""} onChange={e => setEditSale((b: any) => ({ ...b, unitPrice: +e.target.value }))} />
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={loading}>حفظ</Button>
                    <Button type="button" variant="destructive" onClick={() => handleSaleDelete(editSale.id)} disabled={loading}>حذف</Button>
                    <DialogClose asChild><Button type="button" variant="outline">إلغاء</Button></DialogClose>
                  </DialogFooter>
                </form>
              )}
            </DialogContent>
          </Dialog>
          <Dialog open={addSaleOpen} onOpenChange={setAddSaleOpen}>
            <DialogContent>
              <DialogHeader><DialogTitle>إضافة عنصر مبيعات جديد</DialogTitle></DialogHeader>
              <form onSubmit={e => {
                e.preventDefault();
                const form = e.target as any;
                handleSaleAdd({
                  batchId: form.batchId.value,
                  salesInvoiceId: form.salesInvoiceId.value,
                  soldQuantity: +form.soldQuantity.value,
                  unitPrice: +form.unitPrice.value,
                });
              }} className="space-y-4">
                <div>
                  <Label>الدفعة</Label>
                  <Input name="batchId" />
                </div>
                <div>
                  <Label>رقم الفاتورة</Label>
                  <Input name="salesInvoiceId" />
                </div>
                <div>
                  <Label>الكمية</Label>
                  <Input name="soldQuantity" type="number" />
                </div>
                <div>
                  <Label>سعر الوحدة</Label>
                  <Input name="unitPrice" type="number" />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={loading}>إضافة</Button>
                  <DialogClose asChild><Button type="button" variant="outline">إلغاء</Button></DialogClose>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </TabsContent>
        <TabsContent value="purchases">
          {/* TODO: جدول المشتريات مع إمكانيات التعديل */}
          <Card>
            <CardHeader><CardTitle>المشتريات</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم الفاتورة</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>الكمية</TableHead>
                    <TableHead>سعر الشراء</TableHead>
                    <TableHead>المورد</TableHead>
                    <TableHead>إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchaseItems.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.purchaseInvoice?.id}</TableCell>
                      <TableCell>{item.purchaseInvoice?.date?.slice(0, 10)}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.purchasePrice}</TableCell>
                      <TableCell>{item.purchaseInvoice?.supplier?.name}</TableCell>
                      <TableCell>
                        {/* TODO: أزرار تعديل/حذف */}
                        <Button size="sm" variant="outline" onClick={() => setEditPurchase(item)}>تعديل</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Button onClick={() => setAddPurchaseOpen(true)}>إضافة عنصر مشتريات جديد</Button>
            </CardContent>
          </Card>
          <Dialog open={!!editPurchase} onOpenChange={v => !v && setEditPurchase(null)}>
            <DialogContent>
              <DialogHeader><DialogTitle>تعديل عنصر مشتريات</DialogTitle></DialogHeader>
              {editPurchase && (
                <form onSubmit={e => { e.preventDefault(); handlePurchaseSave(editPurchase); }} className="space-y-4">
                  <div>
                    <Label>الكمية</Label>
                    <Input type="number" value={editPurchase.quantity || ""} onChange={e => setEditPurchase((b: any) => ({ ...b, quantity: +e.target.value }))} />
                  </div>
                  <div>
                    <Label>سعر الشراء</Label>
                    <Input type="number" value={editPurchase.purchasePrice || ""} onChange={e => setEditPurchase((b: any) => ({ ...b, purchasePrice: +e.target.value }))} />
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={loading}>حفظ</Button>
                    <Button type="button" variant="destructive" onClick={() => handlePurchaseDelete(editPurchase.id)} disabled={loading}>حذف</Button>
                    <DialogClose asChild><Button type="button" variant="outline">إلغاء</Button></DialogClose>
                  </DialogFooter>
                </form>
              )}
            </DialogContent>
          </Dialog>
          <Dialog open={addPurchaseOpen} onOpenChange={setAddPurchaseOpen}>
            <DialogContent>
              <DialogHeader><DialogTitle>إضافة عنصر مشتريات جديد</DialogTitle></DialogHeader>
              <form onSubmit={e => {
                e.preventDefault();
                const form = e.target as any;
                handlePurchaseAdd({
                  purchaseInvoiceId: form.purchaseInvoiceId.value,
                  quantity: +form.quantity.value,
                  purchasePrice: +form.purchasePrice.value,
                });
              }} className="space-y-4">
                <div>
                  <Label>رقم الفاتورة</Label>
                  <Input name="purchaseInvoiceId" />
                </div>
                <div>
                  <Label>الكمية</Label>
                  <Input name="quantity" type="number" />
                </div>
                <div>
                  <Label>سعر الشراء</Label>
                  <Input name="purchasePrice" type="number" />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={loading}>إضافة</Button>
                  <DialogClose asChild><Button type="button" variant="outline">إلغاء</Button></DialogClose>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
} 