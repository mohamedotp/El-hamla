// app/vehicles/page.tsx
import { Separator } from "@/components/ui/separator";
import CreateVehicles from "@/features/vehicles/create/create-vehicles";
import ListVehicles from "@/features/vehicles/create/list-vehicles";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Prisma } from "@prisma/client";
import VehiclesSearchBarClient from "./-components/VehiclesSearchBarClient";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Home({ searchParams: searchParamsProps }: Props) {
  const searchParams = await searchParamsProps;

  const search =
    typeof searchParams.search === "string" ? searchParams.search : "";
  const page = parseInt(
    typeof searchParams.page === "string" ? searchParams.page : "1",
  );
  const pageSize = 10;

  const whereConditions: Prisma.VehicleWhereInput = {};

  if (search) {
    whereConditions.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { Government_number: { contains: search, mode: "insensitive" } },
      { royal_number: { contains: search, mode: "insensitive" } },
      { address: { contains: search, mode: "insensitive" } },
    ];
  }

  const totalVehicles = await prisma.vehicle.count({
    where: whereConditions,
  });

  const totalPages = Math.max(Math.ceil(totalVehicles / pageSize), 1);

  const vehicles = await prisma.vehicle.findMany({
    where: whereConditions,
    orderBy: { date: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  const createPageLink = (pageNum: number) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    params.set("page", pageNum.toString());
    return `/vehicles?${params.toString()}`;
  };

  return (
    <div className="flex justify-center min-h-[82vh]">
      <section className="w-full px-2 max-w-[2000px]">
        <div className="flex justify-between">
          <h3 className="text-2xl font-semibold">قائمة السيارات </h3>
          <CreateVehicles />
        </div>
        <Separator className="my-2 border-b-[2px] border-color-light-blue" />

        <VehiclesSearchBarClient search={search} />

        <ListVehicles vehicles={vehicles} />

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4 items-center">
            {page > 1 && (
              <Link href={createPageLink(page - 1)}>
                <Button variant="outline" size="sm">
                  السابق
                </Button>
              </Link>
            )}

            <span className="mx-2">
              الصفحة {page} من {totalPages}
            </span>

            {page < totalPages && (
              <Link href={createPageLink(page + 1)}>
                <Button variant="outline" size="sm">
                  التالي
                </Button>
              </Link>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
