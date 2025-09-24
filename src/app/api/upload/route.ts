import { writeFile, unlink } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const workOrderId = formData.get('workOrderId') as string;
    const fileType = formData.get('fileType') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'لم يتم تحديد ملف' },
        { status: 400 }
      );
    }

    // قراءة محتوى الملف
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // جلب رقم السيارة من قاعدة البيانات
    let governmentNumber = null;
    if (workOrderId && !workOrderId.startsWith('temp-')) {
      const workOrder = await prisma.workOrder.findUnique({
        where: { id: workOrderId },
        select: { vehicle: { select: { Government_number: true } } }
      });
      governmentNumber = workOrder?.vehicle?.Government_number;
    }

    // تحديد اسم المجلد الفرعي حسب نوع الملف
    const fileTypeFolders: Record<string, string> = {
      file_number_work: 'work_orders',
      file_examination: 'examinations',
      file_check: 'checks',
      file_electronic_invoice: 'invoices',
    };
    const subFolder = fileTypeFolders[fileType] || 'others';

    // إنشاء اسم فريد للملف
    const ext = path.extname(file.name);
    const baseName = `${fileType}-${Date.now()}`;
    const uniqueFilename = `${baseName}${ext}`;

    // بناء المسار المنظم
    let uploadDir: string = "";
    let publicPath: string = "";
    if (governmentNumber) {
      uploadDir = path.join(process.cwd(), 'public', 'uploads', governmentNumber, subFolder);
      publicPath = `/uploads/${governmentNumber}/${subFolder}/${uniqueFilename}`;
    } else {
      // في حالة عدم وجود رقم السيارة (مثلاً أثناء إضافة أمر شغل جديد لم يحفظ بعد)
      uploadDir = path.join(process.cwd(), 'public', 'uploads', 'temp', subFolder);
      publicPath = `/uploads/temp/${subFolder}/${uniqueFilename}`;
    }

    // تأكد من وجود المجلدات
    await import('fs/promises').then(fs => fs.mkdir(uploadDir, { recursive: true }));

    // تحديد المسار النهائي للملف
    const filePath = path.join(uploadDir, uniqueFilename);

    // حفظ الملف
    await writeFile(filePath, buffer);

    // تحديث قاعدة البيانات بمسار الملف
    if (workOrderId && !workOrderId.startsWith('temp-')) {
      const filePathField = `${fileType}_path`;
      await prisma.workOrder.update({
        where: { id: workOrderId },
        data: {
          [fileType]: ext.toLowerCase() === '.pdf' ? 'PDF' : 'IMAGE',
          [filePathField]: publicPath
        }
      });
    }

    // إرجاع مسار الملف النسبي
    return NextResponse.json({ 
      filePath: publicPath,
      fileType: ext.toLowerCase() === '.pdf' ? 'PDF' : 'IMAGE'
    });

  } catch (error) {
    console.error('خطأ في تحميل الملف:', error);
    return NextResponse.json(
      { error: 'فشل في تحميل الملف' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { filePath, workOrderId, fileType } = await request.json();
    
    console.log('بيانات الطلب المستلمة:', { filePath, workOrderId, fileType });
    
    if (!filePath) {
      console.log('خطأ: لم يتم تحديد مسار الملف');
      return NextResponse.json(
        { 
          error: 'لم يتم تحديد مسار الملف',
          details: { receivedPath: filePath }
        },
        { status: 400 }
      );
    }

    // حساب المسار الصحيح للملف داخل public/uploads
    const absolutePath = path.join(process.cwd(), 'public', filePath.startsWith('/uploads/') ? filePath.slice(1) : filePath);
    
    console.log('معلومات مسار الملف:', {
      originalPath: filePath,
      normalizedPath: filePath.startsWith('/uploads/') ? filePath.slice(1) : filePath,
      absolutePath,
      cwd: process.cwd(),
      exists: existsSync(absolutePath)
    });

    // التحقق من وجود الملف قبل محاولة حذفه
    if (!existsSync(absolutePath)) {
      console.log('خطأ: الملف غير موجود:', absolutePath);
      return NextResponse.json(
        { 
          error: 'الملف غير موجود',
          details: {
            originalPath: filePath,
            absolutePath,
            workOrderId,
            fileType,
            cwd: process.cwd()
          }
        },
        { status: 404 }
      );
    }

    try {
      // حذف الملف
      await unlink(absolutePath);
      console.log('تم حذف الملف بنجاح:', absolutePath);
    } catch (error) {
      console.error('خطأ في حذف الملف:', error);
      return NextResponse.json(
        { 
          error: 'فشل في حذف الملف من النظام',
          details: {
            message: error instanceof Error ? error.message : 'Unknown error',
            originalPath: filePath,
            absolutePath,
            workOrderId,
            fileType
          }
        },
        { status: 500 }
      );
    }

    // تحديث قاعدة البيانات
    if (workOrderId && fileType) {
      try {
        const filePathField = `${fileType}_path`;
        await prisma.workOrder.update({
          where: { id: workOrderId },
          data: {
            [fileType]: null,
            [filePathField]: null
          }
        });
      } catch (error) {
        console.error('خطأ في تحديث قاعدة البيانات:', error);
        return NextResponse.json(
          { error: 'تم حذف الملف ولكن فشل تحديث قاعدة البيانات' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('خطأ في حذف الملف:', error);
    return NextResponse.json(
      { error: 'حدث خطأ غير متوقع' },
      { status: 500 }
    );
  }
} 