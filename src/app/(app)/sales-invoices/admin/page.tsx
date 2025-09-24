// app/sales-invoices/page.tsx
import { Metadata } from "next";
import SalesInvoicesClient from "./-components/SalesInvoicesClient";

export const metadata: Metadata = {
  title: "إدارة فواتير المبيعات",
};

export default function SalesInvoicesPage() {
  return <SalesInvoicesClient />;
}
