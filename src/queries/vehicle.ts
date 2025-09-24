import { prisma } from "@/lib/prisma";

export async function searchVehicles(searchTerm: string) {
  if (!searchTerm || searchTerm.length < 2) {
    return [];
  }

  const vehicles = await prisma.vehicle.findMany({
    where: {
      OR: [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { Government_number: { contains: searchTerm, mode: "insensitive" } },
        { royal_number: { contains: searchTerm, mode: "insensitive" } },
      ],
    },
    take: 10,
  });

  return vehicles;
}

export async function getVehicleById(id: string) {
  if (!id) {
    return null;
  }

  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
  });

  return vehicle;
}