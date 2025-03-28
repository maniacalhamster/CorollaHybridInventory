import { cn } from "@/lib/utils";
import { InventoryItem, OptionDataType } from "@/utils/transformData";
import { CellContext, Column, ColumnDef, Row, RowData, Table } from "@tanstack/react-table";
import { ArrowUpNarrowWideIcon, ArrowDownWideNarrowIcon, MenuIcon } from "lucide-react"
import ColumnFilter from "@/components/ui/columnFilter"
import { JSX } from "react";
import { Button } from "@/components/ui/button";

// https://tanstack.com/table/v8/docs/api/core/column-def#meta
declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    filterVariant: "range" | "select" | "search" | "multi-select" | ""
    unsortable?: boolean
  }
}

const renderSortIndicator = (column: Column<InventoryItem>) => {
  const sortIndex = column.getSortIndex()
  const sortDirection = column.getIsSorted()

  const Icon = {
      asc: ArrowUpNarrowWideIcon,
      desc: ArrowDownWideNarrowIcon,
      false: MenuIcon, // Default icon when unsorted
  }[sortDirection as "asc" | "desc" | "false"];

  return (
    <Button className={sortDirection ? "text-accent-foreground bg-accent": ""} size="icon" variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc", true)} onContextMenu={(e) => {e.preventDefault(); column.clearSorting()}} >
      <span className="inline-flex items-center justify-center rounded-md text-xs font-semibold text-gray-800">
        {sortDirection !== false && sortIndex + 1}
        <Icon className="w-3 h-3 ml-1" />
      </span>
    </Button>
  )
}

export const defaultColumnGenerator: (table: Table<InventoryItem>) => Partial<ColumnDef<InventoryItem>> = (table) => ({
  header: ({ column }) => (
    <div className="flex flex-col">
      <div
        className={cn(
          "w-full inline-flex items-center justify-between gap-5 pl-2",
          (column.getIsSorted() || column.getIsFiltered()) ? "text-accent-foreground" : "",
          ["msrp", "tsrp"].includes(column.id) ? "uppercase" : "capitalize"
        )}
      >
        <span>{column.id.replace(/([a-z])([A-Z)])/g, '$1 $2')}</span>
        {column.columnDef.meta?.unsortable ?? renderSortIndicator(column)}
      </div>
      <div className={cn("w-full", column.getIsFiltered() ? "text-black" : "")}>
        {
          column.columnDef.meta?.filterVariant
          ? <ColumnFilter column={column} table={table}/>
          : <></>
        }
      </div>
    </div>
  ),
});

const moneyCell: ({ row, column }: CellContext<InventoryItem, unknown>) => JSX.Element = ({
  row,
  column: { id }
}) => {
  const value = row.getValue(id) as number;
  const formattedValue = new Intl.NumberFormat('en-US').format(Math.abs(value));

  return (
    <div className={cn("flex justify-between", value < 0 ? "text-red-500" : "")}>
      <span>$</span>
      <span>{(value < 0) ? `(${formattedValue})` : formattedValue}</span>
    </div>
  );
};


const optionCell: ({ row, column }: CellContext<InventoryItem, unknown>) => JSX.Element = ({
  row,
  column: {id}
}) => (
  <span className="flex gap-2">
    {(row.getValue(id) as OptionDataType[]).map(({optionCd, marketingName}) => (
      <span title={marketingName} key={optionCd}>
        ({optionCd})
      </span>
    ))}
  </span>
)

const optionFilterFn: (row: Row<InventoryItem>, columnId: string, filterValue: OptionDataType[]) => boolean = (
  row,
  columnId,
  filterValue: OptionDataType[]
) => {
  const currOptionCds = (row.getValue(columnId) as OptionDataType[]).map(({ optionCd }) => optionCd)
  return filterValue.every(({optionCd: filterCd}) => currOptionCds.includes(filterCd));
}


export const columns: ColumnDef<InventoryItem>[] = [
  {
    accessorKey: "vin",
    cell: ({ row }) => (
      <a
        href={row.original.link}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline"
      >
        <div className="font-medium">{row.getValue("vin")}</div>
      </a>
    ),
    meta: {
      filterVariant: 'search',
      unsortable: true
    }
  },
  {
    accessorKey: "distance",
    cell: ({ row }) => <div>{row.getValue("distance")} mi</div>,
    meta: {
      filterVariant: 'range',
    }
  },
  {
    accessorKey: "dealer",
    meta: {
      filterVariant: 'select',
    }
  },
  {
    accessorKey: "model",
    filterFn: 'equals',
    meta: {
      filterVariant: 'select',
    }
  },
  {
    accessorKey: "color",
    meta: {
      filterVariant: 'select',
    }
  },
  {
    accessorKey: "seating",
    meta: {
      filterVariant: 'select',
    }
  },
  {
    accessorKey: "msrp",
    cell: moneyCell,
    meta: {
      filterVariant: 'range',
    }
  },
  {
    accessorKey: "tsrp",
    cell: moneyCell,
    meta: {
      filterVariant: 'range',
    }
  },
  {
    accessorKey: "markup",
    cell: moneyCell,
    meta: {
      filterVariant: 'range',
    }
  },
  {
    accessorKey: "price",
    cell: moneyCell,
    meta: {
      filterVariant: 'range',
    }
  },
  {
    accessorKey: "status",
    meta: {
      filterVariant: 'select',
    }
  },
  {
    accessorKey: "estDate",
  },
  {
    accessorKey: "presold",
    accessorFn: (row) => row.presold ? "Yes" : "No",
    meta: {
      filterVariant: 'select',
    }
  },
  {
    accessorKey: "portOptions",
    cell: optionCell,
    filterFn: optionFilterFn,
    meta: {
      filterVariant: 'multi-select'
    },
    getUniqueValues: (row) => row.portOptions.map((option) => option),
  },
  {
    accessorKey: "factoryOptions",
    cell: optionCell,
    filterFn: optionFilterFn,
    meta: {
      filterVariant: 'multi-select'
    },
    getUniqueValues: (row) => row.factoryOptions.map((option) => option),
  },
  {
    accessorKey: "dealerOptions",
    cell: optionCell,
    filterFn: optionFilterFn,
    meta: {
      filterVariant: 'multi-select'
    },
    getUniqueValues: (row) => row.dealerOptions.map((option) => option),
  },
]
