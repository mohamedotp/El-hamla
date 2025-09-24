'use client';
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function ListVehicles({ vehicles }: { vehicles: any[] }) {
    const router = useRouter();
    const [message, setMessage] = useState<string | null>(null);
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const goToHome = () => {
      router.push('/vehicles'); 
    };
    const handleDelete = async (id: string) => {
      const confirmed = confirm("هل أنت متأكد من حذف السيارة؟");
      if (!confirmed) return;
      setLoadingId(id);
      setMessage(null);
      try {
        const res = await fetch(`/api/vehicles/${id}?id=${id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          setMessage("تم حذف السيارة بنجاح");
          setTimeout(() => window.location.reload(), 1000);
        } else {
          setMessage("فشل في الحذف");
        }
      } catch (error) {
        setMessage("حدث خطأ ما");
      } finally {
        setLoadingId(null);
      }
    };

    return (
      <div className="overflow-x-auto mt-4">
        {message && (
          <div className="mb-2 p-2 bg-yellow-100 text-yellow-800 rounded text-center animate-pulse">{message}</div>
        )}
        {vehicles.length === 0 ? (
          <div className="text-center text-gray-500 py-8">لا توجد سيارات لعرضها.</div>
        ) : (
          <table className="min-w-full border border-gray-300 rounded-lg">
            <thead className="bg-blue-100 text-right">
              <tr>
                <th className="p-2 border">م</th>
                <th className="p-2 border">الاسم</th>
                <th className="p-2 border">رقم الحكومة</th>
                <th className="p-2 border">الرقم الملكي</th>
                <th className="p-2 border">الموديل</th>
                <th className="p-2 border">الشكل</th>
                <th className="p-2 border"> الجهة</th>
                <th className="p-2 border">تفاصيل</th>
                <th className="p-2 border">تعديل</th>
                <th className="p-2 border">حذف</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle, index) => (
                <tr key={vehicle.id} className="hover:bg-blue-50 text-right">
                  <td className="p-2 border">{index + 1}</td>
                  <td className="p-2 border">{vehicle.name}</td>
                  <td className="p-2 border">{vehicle.Government_number}</td>
                  <td className="p-2 border">{vehicle.royal_number}</td>
                  <td className="p-2 border">{vehicle.model}</td>
                  <td className="p-2 border">{vehicle.shape}</td>
                  <td className="p-2 border">{vehicle.address}</td>
                  <td className="p-2 border">
                    <button
                      onClick={() => router.push(`/vehicles/${vehicle.id}/details`)}
                      className="text-green-600 hover:underline"
                    >
                      تفاصيل
                    </button>
                  </td>
                  <td className="p-2 border">
                    <button
                      onClick={() => router.push(`/vehicles/${vehicle.id}/edit`)}
                      className="text-blue-600 hover:underline"
                    >
                      تعديل
                    </button>
                  </td>
                  <td className="p-2 border">
                    <button
                      onClick={() => handleDelete(vehicle.id)}
                      className={`text-red-600 hover:underline ${loadingId === vehicle.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={loadingId === vehicle.id}
                    >
                      {loadingId === vehicle.id ? 'جاري الحذف...' : 'حذف'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
}
