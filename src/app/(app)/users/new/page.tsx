"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { createUserSchema, CreateUserSchema } from "@/lib/validations/user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function NewUserForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CreateUserSchema>({
    resolver: yupResolver(createUserSchema),
  });

  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: CreateUserSchema) => {
    setIsLoading(true);

    try {
      const res = await fetch("/api/users/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.message || "فشل في إنشاء المستخدم");
      } else {
        toast.success("تم إنشاء المستخدم بنجاح");
        reset();
      }
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error("حدث خطأ أثناء الاتصال بالسيرفر");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10">
      <Card className="rounded-2xl shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">إضافة مستخدم جديد</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">اسم المستخدم</Label>
              <Input
                id="username"
                {...register("username")}
                placeholder="أدخل اسم المستخدم"
              />
              {errors.username && (
                <p className="text-sm text-red-600">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                placeholder="أدخل كلمة المرور"
              />
              {errors.password && (
                <p className="text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label htmlFor="role">الدور</Label>
              <Select
                onValueChange={(value: "admin" | "warehouse" | "maintenance") =>
                  setValue("role", value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر الدور" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">مدير</SelectItem>
                  <SelectItem value="warehouse">مخزن</SelectItem>
                  <SelectItem value="maintenance">صيانة</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-sm text-red-600">{errors.role.message}</p>
              )}
            </div>

            {/* Submit */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "جارٍ الإضافة..." : "إضافة المستخدم"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
