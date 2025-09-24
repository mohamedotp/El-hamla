import { InferType, object, string } from "yup";

const loginSchema = object({
  username: string().required().label("إسم المستخدم"),
  password: string().required().label("كلمة المرور"),
});

export type LoginSchema = InferType<typeof loginSchema>;

export default loginSchema;
