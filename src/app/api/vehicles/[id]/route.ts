import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { StatusCodes } from "http-status-codes";

// دالة آمنة لمعالجة بيانات السيارة
const processVehicleData = (data: any) => {
  const processedData: any = {};
  if (data.name) processedData.name = data.name;
  if (data.Government_number) processedData.Government_number = data.Government_number;
  if (data.royal_number) processedData.royal_number = data.royal_number;
  if (data.model) processedData.model = data.model;
  if (data.shape) processedData.shape = data.shape;
  if (data.address) processedData.address = data.address;
  if (data.chassis_number) processedData.chassis_number = data.chassis_number;
  if (data.engine_number) processedData.engine_number = data.engine_number;
  if (data.date) {
    const date = new Date(data.date);
    if (!isNaN(date.getTime())) {
      processedData.date = date;
    }
  }
  return processedData;
};

// دالة آمنة لمعالجة بيانات WorkOrder
const processWorkOrderData = (order: any) => {
  const data: any = {};
  if (order.File_number) data.File_number = order.File_number;
  if (order.Type_of_repair) data.Type_of_repair = order.Type_of_repair;
  if (order.number_work) data.number_work = order.number_work;
  if (order.date_number_work) {
      const date = new Date(order.date_number_work);
      if (!isNaN(date.getTime())) data.date_number_work = date;
  }
  if (order.examination_status) data.examination_status = order.examination_status;
  if (order.examination_date) {
      const date = new Date(order.examination_date);
      if (!isNaN(date.getTime())) data.examination_date = date;
  }
  if (order.price_work) {
      const price = parseFloat(order.price_work);
      if (!isNaN(price)) data.price_work = price;
  }
  if (order.Checkstatus) data.Checkstatus = order.Checkstatus;
  if (order.Check_number) data.Check_number = order.Check_number;
  if (order.Check_date) {
      const date = new Date(order.Check_date);
      if (!isNaN(date.getTime())) data.Check_date = date;
  }
  if (order.Electronic_invoice_status) data.Electronic_invoice_status = order.Electronic_invoice_status;
  if (order.Electronic_invoice_date) {
      const date = new Date(order.Electronic_invoice_date);
      if (!isNaN(date.getTime())) data.Electronic_invoice_date = date;
  }
  if (order.Electronic_invoice_number) data.Electronic_invoice_number = order.Electronic_invoice_number;

  return data;
};

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vehicleId = params.id;
    if (vehicleId) {
      const vehicle = await prisma.vehicle.findUnique({
        where: { id: vehicleId },
        include: { workOrders: true },
      });

      if (!vehicle) {
        return NextResponse.json(
          { message: "السيارة غير موجودة" },
          { status: StatusCodes.NOT_FOUND }
        );
      }
      return NextResponse.json(vehicle, { status: StatusCodes.OK });
    }
    return NextResponse.json(
      { message: "معرف السيارة مطلوب" },
      { status: StatusCodes.BAD_REQUEST }
    );
  } catch (err) {
    console.error("Error fetching vehicle:", err);
    return NextResponse.json(
      { message: "حدث خطأ أثناء تحميل بيانات السيارة" },
      { status: StatusCodes.INTERNAL_SERVER_ERROR },
    );
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const vehicleId = params.id;
    const body = await req.json();
    const { workOrders, ...vehicleData } = body;

    const processedVehicleData = processVehicleData(vehicleData);

    await prisma.$transaction(async (tx) => {
      // 1. تحديث بيانات السيارة
      await tx.vehicle.update({
        where: { id: vehicleId },
        data: processedVehicleData,
      });

      if (workOrders && Array.isArray(workOrders)) {
        const workOrderIds = workOrders.map(w => w.id).filter(Boolean);

        // 2. حذف أوامر الشغل التي لم تعد موجودة
        await tx.workOrder.deleteMany({
          where: {
            vehicleId: vehicleId,
            id: { notIn: workOrderIds },
          },
        });

        // 3. تحديث أو إضافة أوامر الشغل
        for (const order of workOrders) {
          const processedData = processWorkOrderData(order);
          if (order.id) {
            await tx.workOrder.update({
              where: { id: order.id },
              data: processedData,
            });
          } else {
            await tx.workOrder.create({
              data: {
                ...processedData,
                vehicleId: vehicleId,
              },
            });
          }
        }
      }
    });

    const vehicleWithOrders = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: { workOrders: true },
    });

    return NextResponse.json({ message: "تم التحديث بنجاح", vehicle: vehicleWithOrders }, { status: StatusCodes.OK });
  } catch (error: any) {
    console.error("Error updating vehicle:", error);
    return NextResponse.json(
      { message: "فشل في التحديث", error: error.message },
      { status: StatusCodes.INTERNAL_SERVER_ERROR },
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const vehicleId = params.id;
    await prisma.$transaction(async (tx) => {
      await tx.workOrder.deleteMany({
        where: { vehicleId: vehicleId },
      });
      await tx.vehicle.delete({
        where: { id: vehicleId },
      });
    });

    return NextResponse.json(
      { message: "تم حذف السيارة بنجاح" },
      { status: StatusCodes.OK }
    );
  } catch (error: any) {
    console.error("خطأ أثناء الحذف:", error);
    return NextResponse.json(
      { message: "فشل في حذف السيارة", error: error.message },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}
