import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vehicleId = params.id;

    // جلب حجوزات قطع الغيار المرتبطة بالسيارة
    // نفترض وجود جدول reservations في قاعدة البيانات
    // إذا لم يكن موجوداً، يمكن إنشاؤه أو استخدام جدول آخر
    
    // للآن سنرجع بيانات تجريبية حتى يتم إنشاء الجدول المناسب
    const mockReservations = [
      {
        id: '1',
        date: new Date().toISOString(),
        productName: 'فلتر زيت',
        quantity: 2,
        status: 'pending',
        notes: 'مطلوب بشكل عاجل'
      },
      {
        id: '2',
        date: new Date(Date.now() - 86400000).toISOString(), // أمس
        productName: 'إطار احتياطي',
        quantity: 1,
        status: 'approved',
        notes: 'تم الموافقة من المدير'
      }
    ];

    // في المستقبل، يمكن استبدال هذا بالكود التالي عند إنشاء جدول الحجوزات:
    /*
    const reservations = await prisma.reservation.findMany({
      where: {
        vehicleId: vehicleId
      },
      include: {
        product: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    const formattedReservations = reservations.map(reservation => ({
      id: reservation.id,
      date: reservation.date,
      productName: reservation.product?.name || 'غير محدد',
      quantity: reservation.quantity,
      status: reservation.status,
      notes: reservation.notes
    }));
    */

    return NextResponse.json(mockReservations);
  } catch (error) {
    console.error("Error fetching vehicle reservations:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب بيانات الحجوزات" },
      { status: 500 }
    );
  }
}