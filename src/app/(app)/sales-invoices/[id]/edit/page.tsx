import EditInvoiceClient from "./-components/EditInvoiceClient";

export default function EditInvoicePage({ params }: { params: { id: string } }) {
  return <EditInvoiceClient invoiceId={params.id} />;
}
