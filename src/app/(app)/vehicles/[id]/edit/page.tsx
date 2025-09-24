"use server";
import VehicleFormClient from "../../add-vehicles/-components/VehicleFormClient";
import { prisma } from "@/lib/prisma";

interface EditPageProps {
  params: { id: string };
}

export default async function EditVehiclePage({ params }: EditPageProps) {
  let initialVehicle = null;
  try {
    initialVehicle = await prisma.vehicle.findUnique({
      where: { id: params.id },
      include: {
        workOrders: true,
      },
    });
  } catch (error) {
    console.error("Failed to fetch vehicle:", error);
    // يمكنك هنا عرض صفحة خطأ أو رسالة للمستخدم
  }

  if (!initialVehicle) {
    return <div>لم يتم العثور على السيارة.</div>;
  }

  // Create a new object with dates formatted as strings for form display
  const vehicleForForm = {
    ...initialVehicle,
    date: initialVehicle.date ? new Date(initialVehicle.date).toISOString().split('T')[0] : null,
    workOrders: initialVehicle.workOrders.map(wo => ({
      ...wo,
      date_number_work: wo.date_number_work ? new Date(wo.date_number_work).toISOString().split('T')[0] : null,
      examination_date: wo.examination_date ? new Date(wo.examination_date).toISOString().split('T')[0] : null,
      Check_date: wo.Check_date ? new Date(wo.Check_date).toISOString().split('T')[0] : null,
      Electronic_invoice_date: wo.Electronic_invoice_date ? new Date(wo.Electronic_invoice_date).toISOString().split('T')[0] : null,
    })),
  };
  
  return (
    <section className="w-full max-w-screen-2xl mx-auto px-4">
      <VehicleFormClient initialVehicle={vehicleForForm as any} />
    </section>
  );
}
