import { NextRequest, NextResponse } from "next/server";
import { searchVehicles } from "@/queries/vehicle";
import { routeHandlerWrapper } from "@/lib/route-handler-wrapper";

export const GET = routeHandlerWrapper(async (req: NextRequest) => {
  const searchParams = req.nextUrl.searchParams;
  const query = searchParams.get("query") || "";

  const vehicles = await searchVehicles(query);

  return NextResponse.json(vehicles);
});