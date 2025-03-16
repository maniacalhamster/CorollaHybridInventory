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
  options: { label: string; count: number, value: T, details?: string }[];
  selectedValues: T[];
  onChange: (values: T[]) => void;
}

const MultiSelectDropdown = <T,>({
  options,
  selectedValues,
  onChange,
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
      <DropdownMenuTrigger asChild className="w-full py-0 h-min">
        <Button variant="outline">
          {selectedValues.length > 0
            ? selectedValues.map((value) => `(${value})`).join(" ")
            : "All"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="dropdown-content-width-full">
        {options.map(({ label, count, value, details }) => (
          <DropdownMenuCheckboxItem
            title={details}
              key={label}
            checked={selectedValues.includes(value)}
            onCheckedChange={() => handleSelection(value)}
            onSelect={(e) => e.preventDefault()}
            className="flex justify-between"
          >
            <span>{label}</span>
            <span>({count})</span>
          </DropdownMenuCheckboxItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={selectedValues.length === options.length}
          onCheckedChange={() => onChange([]) }
        >
          Clear Filters
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MultiSelectDropdown;
