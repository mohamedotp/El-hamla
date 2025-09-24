// "use client";
// import { prisma } from "@/lib/prisma";
// import { NextRequest, NextResponse } from "next/server";
// import { StatusCodes } from "http-status-codes";

// // Get Vehicle by ID
// export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
//   try {
//     const vehicle = await prisma.vehicle.findUnique({
//       where: { id: params.id },
//     });
//     console.log("aad");
//     if (!vehicle) {
//       return NextResponse.json({ message: "السيارة غير موجودة" }, { status: StatusCodes.NOT_FOUND });
//     }

//     return NextResponse.json(vehicle);
//   } catch (error) {
//     return NextResponse.json({ message: "فشل في جلب السيارة" }, { status: StatusCodes.INTERNAL_SERVER_ERROR });
//   }
// }

// // Update Vehicle by ID
// export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
//   try {
//     const data = await req.json();
//     await prisma.vehicle.update({
//       where: { id: params.id },
//       data,
//     });

//     return NextResponse.json({ message: "تم التحديث بنجاح" });
//   } catch (error) {
//     return NextResponse.json({ message: "فشل في التحديث" }, { status: StatusCodes.INTERNAL_SERVER_ERROR });
//   }
// }

// // Delete Vehicle by ID
// export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
//   try {
//     await prisma.vehicle.delete({
//       where: { id: params.id },
//     });

//     return NextResponse.json({ message: "تم حذف السيارة" });
//   } catch (error) {
//     return NextResponse.json({ message: "فشل في الحذف" }, { status: StatusCodes.INTERNAL_SERVER_ERROR });
//   }
// }
