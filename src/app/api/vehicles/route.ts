import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { StatusCodes } from "http-status-codes";

// دالة آمنة لمعالجة بيانات WorkOrder
const processWorkOrderData = (order: any) => {
  const data: any = {};
  if (order.File_number) data.File_number = order.File_number;
  if (order.Type_of_repair) data.Type_of_repair = order.Type_of_repair;
  if (order.number_work) data.number_work = order.number_work;
  if (order.date_number_work) data.date_number_work = new Date(order.date_number_work);
  if (order.examination_status) data.examination_status = order.examination_status;
  if (order.examination_date) data.examination_date = new Date(order.examination_date);
  if (order.price_work) data.price_work = parseFloat(order.price_work);
  if (order.Checkstatus) data.Checkstatus = order.Checkstatus;
  if (order.Check_number) data.Check_number = order.Check_number;
  if (order.Check_date) data.Check_date = new Date(order.Check_date);
  if (order.Electronic_invoice_status) data.Electronic_invoice_status = order.Electronic_invoice_status;
  if (order.Electronic_invoice_date) data.Electronic_invoice_date = new Date(order.Electronic_invoice_date);
  if (order.Electronic_invoice_number) data.Electronic_invoice_number = order.Electronic_invoice_number;

  // إزالة أي قيمة غير صالحة
  for (const key in data) {
    if (data[key] === null || data[key] === undefined || data[key] === '' || (typeof data[key] === 'number' && isNaN(data[key])) || (data[key] instanceof Date && isNaN(data[key].getTime()))) {
      delete data[key];
    }
  }
  return data;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { workOrders, ...vehicleData } = body;

    // بناء كائن بيانات السيارة بشكل انتقائي
    const vehiclePayload: any = {
      name: vehicleData.name,
      Government_number: vehicleData.Government_number,
      receivingParty: vehicleData.receivingParty,
      work_kind: vehicleData.work_kind,
    };

    if (vehicleData.royal_number) vehiclePayload.royal_number = vehicleData.royal_number;
    if (vehicleData.shape) vehiclePayload.shape = vehicleData.shape;
    if (vehicleData.model) vehiclePayload.model = vehicleData.model;
    if (vehicleData.address) vehiclePayload.address = vehicleData.address;
    if (vehicleData.date) vehiclePayload.date = new Date(vehicleData.date);
    // تجاهل الحقول غير الموجودة في السكيما مثل work_kind_date

    const newVehicle = await prisma.vehicle.create({
      data: {
        ...vehiclePayload,
        workOrders: {
          create: workOrders?.map((order: any) => processWorkOrderData(order)) ?? [],
        },
      },
      include: {
        workOrders: true,
      },
    });

    return NextResponse.json(
      { message: "تمت الإضافة بنجاح", vehicle: newVehicle },
      { status: StatusCodes.CREATED }
    );
  } catch (error: any) {
    console.error("Error creating vehicle:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { message: "رقم السيارة أو الرقم الملكي مستخدم من قبل" },
        { status: StatusCodes.CONFLICT }
      );
    }
    return NextResponse.json(
      { message: "فشل في إنشاء السيارة", error: error.message },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}
