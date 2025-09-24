import { prisma } from "@/lib/prisma";
import { withValidation } from "@/lib/route-handler-wrapper";
import { NextResponse } from "next/server";
import { array, number, object, string } from "yup";
import { jwtVerify } from "jose";

// مخطط التحقق من صحة إنشاء فاتورة مبيعات بدون createdBy
const createSalesInvoiceSchema = object({
  number: string().required("رقم الفاتورة مطلوب"),
  date: string().required(),
  vehicleId: string().required(),
  workOrderId: string().nullable(),
  bolRepairManId: string().nullable(),
  items: array()
    .of(
      object({
        productId: string().required(),
        batchId: string().required(),
        soldQuantity: number().required().positive(),
        unitPrice: number().required().min(0),
        availableQuantity: number().required().min(0),
      })
    )
    .required()
    .min(1),
  totalAmount: number().required().min(0),
});


// تعديل الـ type ليطابق schema بدون createdBy
type CreateSalesInvoiceDTO = {
  number: string;
  date: string;
  vehicleId: string;
  workOrderId?: string | null;
  bolRepairManId?: string | null; 
  items: {
    productId: string;
    batchId: string;
    soldQuantity: number;
    unitPrice: number;
    availableQuantity: number;
  }[];
  totalAmount: number;
};
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;
    const search = searchParams.get("search") || "";
    const fromDate = searchParams.get("from");
    const toDate = searchParams.get("to");

    const where: any = {
      AND: [],
    };

    if (search) {
      where.AND.push({
        OR: [
          { vehicle: { name: { contains: search, mode: "insensitive" } } },
          {
            vehicle: {
              Government_number: { contains: search, mode: "insensitive" },
            },
          },
        ],
      });
    }

    if (fromDate) {
      where.AND.push({
        date: { gte: new Date(fromDate) },
      });
    }

    if (toDate) {
      where.AND.push({
        date: { lte: new Date(toDate) },
      });
    }

    const [invoices, total] = await Promise.all([
      prisma.salesInvoice.findMany({
        where,
        skip,
        take: limit,
        include: {
          vehicle: true,
          user: true,
          items: {
            include: {
              product: true,
              batch: true,
            },
          },
        },
        orderBy: {
          date: "desc",
        },
      }),
      prisma.salesInvoice.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    
    return NextResponse.json({
      invoices,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    console.error("فشل في جلب الفواتير:", error);
    return NextResponse.json(
      { message: "فشل في جلب الفواتير" },
      { status: 500 }
    );
  }
}

export const POST = withValidation(createSalesInvoiceSchema, async (req, body: CreateSalesInvoiceDTO) => {
  console.log("Received body:", body);

  try {
    const token = req.cookies.get("OutSiteJWT")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "غير مصرح لك بإجراء هذه العملية" },
        { status: 401 }
      );
    }

    // فك التوكن والتحقق من صحته
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET)
    );
    const existingInvoices = await prisma.salesInvoice.findMany({
      where: { number: body.number },
    });
    
    if (existingInvoices.length > 0) {
      console.log("⚠️ هذا الرقم مستخدم من قبل");
    }
    
    const userData = (payload as any).data;
    console.log("USER_DATA", userData.id);
    if (!userData || !userData.id) {
      return NextResponse.json(
        { message: "الرمز المميز لا يحتوي على بيانات المستخدم الصحيحة" },
        { status: 401 }
      );
    }

    // إنشاء الفاتورة بدون createdBy
    const salesInvoice = await prisma.salesInvoice.create({
      data: {
        number: body.number,
        date: new Date(body.date),
        vehicleId: body.vehicleId,
        workOrderId: body.workOrderId === "none" ? null : body.workOrderId,
        bolRepairManId: body.bolRepairManId ?? null, 
        totalAmount: body.totalAmount,
        disbursementStatus: "NotDisbursed",
        approvalStatus: "Notapproved",
        userId: String(userData.id),
        items: {
          create: body.items.map((item) => ({
            productId: item.productId,
            batchId: item.batchId,
            soldQuantity: item.soldQuantity,
            unitPrice: item.unitPrice,
            availableQuantity: item.availableQuantity,
          })),
        },
      },
      include: {
        vehicle: true,
        items: {
          include: {
            product: true,
            batch: true,
          },
        },
        bolRepairMan: true, 
      },
    });

    console.log(`تم إنشاء فاتورة المبيعات بنجاح بواسطة المستخدم: ${userData.id}`);

    return NextResponse.json(
      { message: "تم إنشاء فاتورة المبيعات بنجاح", salesInvoice },
      { status: 201 }
    );
  } catch (error) {
    console.error("خطأ في إنشاء فاتورة المبيعات:", error);
    return NextResponse.json(
      { message: "حدث خطأ أثناء إنشاء فاتورة المبيعات" },
      { status: 500 }
    );
  }
});
