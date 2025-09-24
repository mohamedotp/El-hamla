"use server";
import VehicleFormClient from "./-components/VehicleFormClient";
import ImportExcelTable from "./-components/ImportExcelTable";

export default async function AddVehiclePage() {
  return (
    <section className="w-full max-w-screen-2xl mx-auto px-4">
      <VehicleFormClient />
    </section>
  );
}
