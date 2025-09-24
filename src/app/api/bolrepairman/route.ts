// app/api/repair-men/route.ts
import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";

export async function GET() {
  const bolRepairMan = await prisma.bolRepairMan.findMany();
  return NextResponse.json(bolRepairMan);
}
