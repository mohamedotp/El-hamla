export default function NotFound() {
  return (
    <div className="flex flex-col gap-2 h-[100svh] items-center justify-center w-full relative">
      <p className="text-[150px] opacity-5 font-black absolute top-1/2 left-1/2 -translate-1/2">
        404
      </p>
      <p className="text-4xl font-bold">غير موجود</p>
      <p className="text-muted-foreground">لا يوجد صفحة كهذه</p>
    </div>
  );
}
