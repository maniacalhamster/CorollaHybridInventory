import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface MultiSelectDropdownProps<T> {
  options: { label: string; count: number, value: T, details?: string }[] | undefined;
  selectedValues: T[];
  onChange: (values: T[] | undefined) => void;
  renderValue?: (value: T) => string;
}

const MultiSelectDropdown = <T,>({
  options,
  selectedValues,
  onChange,
  renderValue,
}: MultiSelectDropdownProps<T>) => {
  const [open, setOpen] = useState(false);

  const handleSelection = (value: T) => {
    const newSelected = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value) // Remove if already selected
      : [...selectedValues, value]; // Add new selection

    onChange(newSelected);
  };

  return (
    <DropdownMenu onOpenChange={setOpen} open={open}>
      <DropdownMenuTrigger asChild className="w-full py-0 h-min min-w-64">
        <Button variant="outline">
          {selectedValues.length > 0
            ? selectedValues.map((value) => renderValue?.(value)).join(" ")
            : "All"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="dropdown-content-width-full">
        <div className="overflow-y-scroll pr-3  max-h-[calc(50vh)]">
          {options?.map(({ label, count, value, details }) => (
            <DropdownMenuCheckboxItem
              title={details}
              key={label}
              checked={selectedValues.includes(value)}
              onCheckedChange={() => handleSelection(value)}
              onSelect={(e) => e.preventDefault()}
              className="flex justify-between"
            >
              <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap pr-4">{label}</span>
              <span className="shrink-0">({count})</span>
            </DropdownMenuCheckboxItem>
          ))}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={selectedValues.length === options?.length}
          onCheckedChange={() => onChange(undefined) }
        >
          Clear Filters
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MultiSelectDropdown;
