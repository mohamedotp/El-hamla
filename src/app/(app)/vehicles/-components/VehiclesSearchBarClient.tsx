"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";

export default function VehiclesSearchBarClient({ search }: { search: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(search || "");

  useEffect(() => {
    setValue(search || "");
  }, [search]);

  useEffect(() => {
    const handler = setTimeout(() => {
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      if (value) {
        params.set("search", value);
        params.set("page", "1");
      } else {
        params.delete("search");
        params.set("page", "1");
      }
      router.replace(`/vehicles?${params.toString()}`);
    }, 500);
    return () => clearTimeout(handler);
  }, [value]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
      <div className="md:col-span-3">
        <Input
          name="search"
          placeholder="ابحث باسم السيارة أو الرقم أو الجهة"
          value={value}
          onChange={e => setValue(e.target.value)}
        />
      </div>
    </div>
  );
} 