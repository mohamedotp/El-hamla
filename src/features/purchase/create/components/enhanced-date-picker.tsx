"use client";

import * as React from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function DatePicker({
  value,
  onChange,
}: {
  value?: Date;
  onChange?: (date: Date) => void;
}) {
  const [date, setDate] = React.useState<Date | undefined>(value);

  React.useEffect(() => {
    if (value && (!date || value.getTime() !== date.getTime())) {
      setDate(value);
    }
  }, [value, date]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-right font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="ml-2 h-4 w-4" />
          {date ? format(date, "PPP", { locale: ar }) : <span>اختر تاريخ</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(newDate) => {
            setDate(newDate);
            if (onChange && newDate) {
              onChange(newDate);
            }
          }}
          initialFocus
          locale={ar}
        />
      </PopoverContent>
    </Popover>
  );
}