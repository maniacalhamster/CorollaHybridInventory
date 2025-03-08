import { cn } from '@/lib/utils';
import { Column } from '@tanstack/react-table';
import * as React from 'react';

// A typical debounced input react component
export function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  className,
  ...props
}: {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
  const [value, setValue] = React.useState(initialValue)

  React.useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
  }, [value])

  return (
    <input
      className={cn("px-1", className)}
      {...props}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}

export default function ColumnFilter<T>({ column }: {column: Column<T, unknown>}) {
  const columnFilterValue = column.getFilterValue()
  const { filterVariant } = column.columnDef.meta ?? {}

  const sortedUniqueValues = React.useMemo(() => {
    if (filterVariant === 'range') return []
    const uniqueValuesWithCount = Array.from(column.getFacetedUniqueValues().entries())
    return uniqueValuesWithCount
  }, [column.getFacetedUniqueValues, filterVariant])

  return filterVariant === 'range' ? (
    <div>
      <div className="flex space-x-2">
        <DebouncedInput
          type="number"
          value={(columnFilterValue as [number, number])?.[0] ?? ''}
          onChange={value =>
            column.setFilterValue((old: [number, number]) => [value, old?.[1]])
          }
          placeholder={`Min`}
          className="w-12 border shadow rounded"
        />
        <DebouncedInput
          type="number"
          value={(columnFilterValue as [number, number])?.[1] ?? ''}
          onChange={value =>
            column.setFilterValue((old: [number, number]) => [old?.[0], value])
          }
          placeholder={`Max`}
          className="w-12 border shadow rounded"
        />
      </div>
      <div className="h-1" />
    </div>
  ) : filterVariant === 'select' ? (
    <select
      title={`${column.id}-filter`}
      onChange={e => column.setFilterValue(e.target.value)}
      value={columnFilterValue?.toString()}
    >
      <option value="">All</option>
      {sortedUniqueValues.map(([value, count]) => (
        <option className='' value={value} key={value}>
          {value} ({count})
        </option>
      ))}
    </select>
  ) : (
    <>
    <datalist id={`${column.id}-list`}>
      {sortedUniqueValues.map(([value, ]) => (
        <option value={value} key={value}></option>
      ))}
    </datalist>
    <DebouncedInput
      type="text"
      value={(columnFilterValue ?? '') as string}
      onChange={value => column.setFilterValue(value)}
      placeholder={`Search...`}
      className="w-full border shadow rounded"
      list={`${column.id}-list`}
    />
    </>
  )
}