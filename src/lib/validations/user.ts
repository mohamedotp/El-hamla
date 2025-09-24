// lib/validations/user.ts
import { object, string, InferType } from "yup";

export const createUserSchema = object({
  username: string().required("اسم المستخدم مطلوب"),
  password: string().required("كلمة المرور مطلوبة"),
  role: string()
    .oneOf(["admin", "warehouse", "maintenance"], "الدور غير صالح")
    .required("الدور مطلوب"),
});

export type CreateUserSchema = InferType<typeof createUserSchema>;
