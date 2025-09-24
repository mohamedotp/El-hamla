import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check } from "@phosphor-icons/react/dist/ssr";
import { ChevronsUpDown } from "lucide-react";
import { useState } from "react";

export default function SearchSelect({
  placeholder,
  data,
  value,
  onValueChange,
}: {
  placeholder: string;
  data: { label: string; value: string }[];
  value?: string;
  onValueChange?: (value: string) => void;
}) {
  const [open, setOpen] = useState<boolean>(false);
  const [selectedValue, setSelectedValue] = useState<string>(value || "");

  const handleSelect = (currentValue: string, itemValue: string) => {
    const newValue = currentValue === selectedValue ? "" : currentValue;
    setSelectedValue(newValue);
    if (onValueChange) {
      onValueChange(itemValue);
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          {selectedValue ? (
            data.find((item) => item.value === value)?.label || value || selectedValue
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]">
        <Command>
          <CommandInput placeholder="بحث" />
          <CommandList>
            <CommandEmpty>لا يوجد نتيجة.</CommandEmpty>
            <CommandGroup>
              {data.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.label}
                  onSelect={(currentValue) => handleSelect(currentValue, item.value)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === item.value ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}