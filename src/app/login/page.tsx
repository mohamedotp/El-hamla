import LoginForm from "@/features/auth/login-form";

export default function Home() {
  return (
    <div className="flex flex-col gap-2 h-[100svh] items-center justify-center">
      <LoginForm />
    </div>
  );
}
