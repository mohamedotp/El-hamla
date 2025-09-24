import { NextResponse } from "next/server";
import { routeHandlerWrapper } from "@/lib/route-handler-wrapper";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const repairManSchema = z.object({
  name: z.string().min(1, "الاسم مطلوب"),
  nationalId: z.string().optional(),
  workshopName: z.string().optional(),
});

// PUT (update) a repairman
export const PUT = routeHandlerWrapper(async (req, { params }) => {
  const body = await req.json();
  const validation = repairManSchema.safeParse(body);

  if (!validation.success) {
    return new Response(JSON.stringify({ error: validation.error.format() }), { status: 400 });
  }

  const updatedRepairMan = await prisma.repairMan.update({
    where: { id: params.id },
    data: validation.data,
  });

  return NextResponse.json(updatedRepairMan);
});

// DELETE a repairman
export const DELETE = routeHandlerWrapper(async (req, { params }) => {
  await prisma.repairMan.delete({
    where: { id: params.id },
  });

  return new Response(null, { status: 204 });
}); 