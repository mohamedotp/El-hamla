// app/api/repair-men/route.ts
import { NextResponse } from "next/server";
import { routeHandlerWrapper } from "@/lib/route-handler-wrapper";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const repairManSchema = z.object({
  name: z.string().min(1, "الاسم مطلوب"),
  nationalId: z.string().optional(),
  workshopName: z.string().optional(),
});

// GET all repairmen with pagination
export const GET = routeHandlerWrapper(async (req) => {
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "10");
  const skip = (page - 1) * limit;

  const [repairmen, total] = await Promise.all([
    prisma.repairMan.findMany({
      skip,
      take: limit,
      orderBy: { name: "asc" },
    }),
    prisma.repairMan.count(),
  ]);

  const totalPages = Math.ceil(total / limit);

  return NextResponse.json({
    repairmen,
    pagination: {
      total,
      page,
      limit,
      totalPages,
    },
  });
});

// POST a new repairman
export const POST = routeHandlerWrapper(async (req) => {
  const body = await req.json();
  const validation = repairManSchema.safeParse(body);

  if (!validation.success) {
    return new Response(JSON.stringify({ error: validation.error.format() }), { status: 400 });
  }

  const newRepairMan = await prisma.repairMan.create({
    data: validation.data,
  });

  return NextResponse.json(newRepairMan);
});