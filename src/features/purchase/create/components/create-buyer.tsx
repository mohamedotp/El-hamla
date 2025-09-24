import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { createBuyer } from "@/queries/buyer";
import { yupResolver } from "@hookform/resolvers/yup";
import { Plus } from "@phosphor-icons/react/dist/ssr";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { InferType, object, string } from "yup";

const schema = object({
  name: string().required().label("إسم المندوب"),
});

export default function CreateBuyer() {
  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const [pending, setPending] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);

  const router = useRouter();

  async function onSubmit(data: InferType<typeof schema>) {
    setPending(true);

    try {
      const res = await createBuyer(data);
      toast.success(res.data.message);
      reset();
      setOpen(false);
      router.refresh();
    } catch (err: unknown) {
      const error = err as { data: { message: string } };
      toast.error(error.data.message);
    }

    setPending(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon">
          <Plus />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
          <DialogTitle>إنشاء مندوب</DialogTitle>
          <Input placeholder="إسم المندوب..." {...register("name")} />
          <p className="text-xs text-destructive">{errors.name?.message}</p>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="animate-spin mr-2" />} إنشاء
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
