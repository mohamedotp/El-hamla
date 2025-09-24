"use client";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import loginSchema, { LoginSchema } from "./login-validation";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/password-input";
import { Button } from "@/components/ui/button";
import { yupResolver } from "@hookform/resolvers/yup";
import { login, UserRole } from "@/queries/login";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// تحديد الصفحة الافتراضية لكل دور
const defaultRoutesByRole: Record<UserRole, string> = {
  admin: "/", // المسؤول يذهب إلى الصفحة الرئيسية
  warehouse: "/products", // المخزن يذهب إلى صفحة قطع الغيار
  maintenance: "/add-purchases" // الصيانة تذهب إلى صفحة إضافة المشتريات
};

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  const router = useRouter();

  async function onSubmit(data: LoginSchema) {
    try {
      const res = await login(data);
      console.log("✅ Logged in user:", res.data.user);


      toast.success(res.data.message);

      // حفظ معلومات المستخدم في التخزين المحلي للاستخدام في واجهة المستخدم
      if (res.data.user) {
        localStorage.setItem('userInfo', JSON.stringify({
          username: res.data.user.username,
          role: res.data.user.role,
          id: res.data.user.id
        }));
        
        // توجيه المستخدم إلى الصفحة المناسبة بناءً على دوره
        const redirectPath = defaultRoutesByRole[res.data.user.role] || "/";
        router.replace(redirectPath);
      } else {
        router.replace("/");
      }
    } catch (err) {
      toast.error("حدث خطأ!", {
        // eslint-disable-next-line
        description: (err as Record<string, any>)?.response?.data?.message,
      });
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="p-6 flex flex-col gap-2 rounded-md border max-w-[300px] w-full"
    >
      <h2 className="text-2xl font-bold mb-4">تسجيل الدخول</h2>
      <div className="flex flex-col gap-2">
        <Label htmlFor="username-input">إسم المستخدم</Label>
        <Input
          {...register("username")}
          placeholder="إسم المستخدم"
          id="username-input"
        />
        <p className="text-red-500 text-sm">{errors?.username?.message}</p>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="password-input">كلمة المرور</Label>
        <PasswordInput
          {...register("password")}
          placeholder="*****"
          id="password-input"
        />
        <p className="text-red-500 text-sm">{errors?.password?.message}</p>
      </div>
      <Button>تسجيل</Button>
    </form>
  );
}
