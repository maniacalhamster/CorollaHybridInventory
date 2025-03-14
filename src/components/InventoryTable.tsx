"use client"

import { useState, useEffect, useMemo, JSX } from "react"
import {
  CellContext,
  Column,
  type ColumnDef,
  type ColumnFiltersState,
  Row,
  RowData,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpNarrowWideIcon, ArrowDownWideNarrowIcon, MenuIcon } from "lucide-react"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

import { type InventoryItem, OptionDataType, fetchInventoryData, sortOptions } from "@/utils/fetchData"
import { cn } from "@/lib/utils"
import ColumnFilter from "./ui/columnFilter"

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

// https://tanstack.com/table/v8/docs/api/core/column-def#meta
declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    filterVariant: "range" | "select" | "search" | "multi-select" | ""
    unsortable?: boolean
  }
}

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

const optionFilterFn: (row: Row<InventoryItem>, columnId: string, filterValue: string[]) => boolean = (
  row,
  columnId,
  filterValue: string[]
) => {
  const currOptionCds = (row.getValue(columnId) as OptionDataType[]).map(({ optionCd }) => optionCd)
  return filterValue.every((filterCd) => currOptionCds.includes(filterCd));
}

const columns: ColumnDef<InventoryItem>[] = [
  {
    accessorKey: "vin",
    cell: ({ row }) => <div className="font-medium">{row.getValue("vin")}</div>,
    meta: {
      filterVariant: 'search',
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
    cell: ({ row }) => <div>${row.getValue("msrp")}</div>,
    meta: {
      filterVariant: 'range',
    }
  },
  {
    accessorKey: "tsrp",
    cell: ({ row }) => <div>${row.getValue("tsrp")}</div>,
    meta: {
      filterVariant: 'range',
    }
  },
  {
    accessorKey: "markup",
    cell: ({ row }) => <div>${row.getValue("markup")}</div>,
    meta: {
      filterVariant: 'range',
    }
  },
  {
    accessorKey: "price",
    cell: ({ row }) => <div>${row.getValue("price")}</div>,
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
    accessorKey: "link",
    cell: ({ row }) => (
      <a
        href={row.getValue("link")}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline"
      >
        View
      </a>
    ),
    meta: {
      filterVariant: "",
      unsortable: true
    }
  },
  {
    accessorKey: "portOptions",
    cell: optionCell,
    filterFn: optionFilterFn,
    meta: {
      filterVariant: 'multi-select'
    },
    getUniqueValues: (row) => row.portOptions.map(({ optionCd }) => optionCd),
  },
  {
    accessorKey: "factoryOptions",
    cell: optionCell,
    filterFn: optionFilterFn,
    meta: {
      filterVariant: 'multi-select'
    },
    getUniqueValues: (row) => row.factoryOptions.map(({ optionCd }) => optionCd),
  },
  {
    accessorKey: "dealerOptions",
    cell: optionCell,
    filterFn: optionFilterFn,
    meta: {
      filterVariant: 'multi-select'
    },
    getUniqueValues: (row) => row.dealerOptions.map(({ optionCd }) => optionCd),
  },
]

export function InventoryTable() {
  const [data, setData] = useState<InventoryItem[]>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    'msrp': false,
    'estDate': false,
    'presold': false,
  })
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })

  useEffect(() => {
    fetchInventoryData().then(setData)
  }, [])

  const defaultColumn: Partial<ColumnDef<InventoryItem>> = {
    header: ({ column }) => (
      <div className="flex flex-col">
        <div
          className={cn(
            "w-full inline-flex items-center justify-between gap-5 pl-2",
            column.getIsSorted() ? "text-accent-foreground" : "",
            ["msrp", "tsrp"].includes(column.id) ? "uppercase" : "capitalize"
          )}
        >
          <span>{column.id.replace(/([a-z])([A-Z)])/g, '$1 $2')}</span>
          {column.columnDef.meta?.unsortable ?? renderSortIndicator(column)}
        </div>
        <div className="w-full">
          {
            column.columnDef.meta?.filterVariant
            ? <ColumnFilter column={column} />
            : <></>
          }
        </div>
      </div>
    ),
  };


  const table = useReactTable({
    data,
    columns,
    defaultColumn,
    enableMultiSort: true,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      pagination,
    },
  })

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Toggle Column Visibility
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="dropdown-content-width-full">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className={cn("capitalize", column.getIsVisible() ? "" : "opacity-40")}
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    onSelect={(e) => e.preventDefault()}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table className="whitespace-nowrap">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow className="divide-x" key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow className="divide-x" key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell className="px-4" key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
          selected.
        </div>
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Popover>
            <PopoverTrigger asChild>
              <Input
                type="number"
                min={1}
                max={100}
                value={pagination.pageSize}
                onChange={(e) => {
                  const value = Number(e.target.value)
                  table.setPageSize(value > 0 ? value : 1)
                  table.setPageIndex(0)
                }}
                className="h-8 w-[70px]"
              />
            </PopoverTrigger>
            <PopoverContent className="w-[70px] p-0">
              <div className="flex flex-col">
                {[10, 20, 30, 40, 50].map((size) => (
                  <Button
                    key={size}
                    variant="ghost"
                    className="justify-start"
                    onClick={() => {
                      table.setPageSize(size)
                      table.setPageIndex(0)
                    }}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

