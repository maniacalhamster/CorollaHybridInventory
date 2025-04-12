import { cn } from '@/lib/utils';
import { Column, Table } from '@tanstack/react-table';
import * as React from 'react';
import MultiSelectDropdown from './multi-select';
import { OptionDataType } from '@/utils/fetchData';

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
  }, [debounce, onChange, value])

  return (
    <input
      className={cn("px-1", className)}
      {...props}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}

export default function ColumnFilter<T, V>({ column, table }: {
  column: Column<T, V>;
  table: Table<T>
}) {
  const columnFilterValue = column.getFilterValue()
  const { filterVariant } = column.columnDef.meta ?? {}

  const facetedUniqueValuesMap = column.getFacetedUniqueValues();
  const [facetedMinValue, facetedMaxValue] = column.getFacetedMinMaxValues()??[];


  const getUniqueValues = column.columnDef.getUniqueValues
  const getFilteredRowModel = table.getFilteredRowModel;
  const facetedUniqueValues = React.useMemo(() => {
    if (filterVariant !== 'multi-select' || !column.id.includes('option')) return Array.from(facetedUniqueValuesMap.entries())

    const newFacetedUniqueValuesMap = new Map<unknown, number>()
    getFilteredRowModel().rows.forEach(({original, index}) => {
      const uniqueValues = getUniqueValues?.(original, index)
      uniqueValues?.forEach(value => {
        newFacetedUniqueValuesMap.set(
          value,
          (newFacetedUniqueValuesMap.get(value) || 0) + 1
        )
      })
    })

    return Array.from(newFacetedUniqueValuesMap.entries())
  }, [filterVariant, column.id, facetedUniqueValuesMap, getFilteredRowModel, getUniqueValues])

  const rangeMinCallback = React.useCallback((value: string | number) => column.setFilterValue((old: [number, number]) => [value, old?.[1]]), [column])
  const rangeMaxCallback = React.useCallback((value: string | number) => column.setFilterValue((old: [number, number]) => [old?.[0], value]), [column])
  const searchCallback = React.useCallback((value: string | number) => column.setFilterValue(value), [column])

  return filterVariant === 'range' ? (
    <div>
      <div className="flex space-x-2">
        <DebouncedInput
          type="number"
          value={(columnFilterValue as [number, number])?.[0] ?? ''}
          onChange={rangeMinCallback}
          placeholder={`${facetedMinValue}`}
          className="w-12 border shadow rounded"
        />
        <DebouncedInput
          type="number"
          value={(columnFilterValue as [number, number])?.[1] ?? ''}
          onChange={rangeMaxCallback}
          placeholder={`${facetedMaxValue}`}
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
      {facetedUniqueValues.map(([value, count]) => (
        <option className='' value={value} key={value}>
          {value} ({count})
        </option>
      ))}
    </select>
  ) : filterVariant === 'multi-select' ? (
    <MultiSelectDropdown<V>
      options={
        facetedUniqueValues.map(([value, count]) => {
          if (typeof value === 'string') return {
            label: `(${value})`,
            count,
            value
          }

          const {optionCd, marketingName } = value as OptionDataType

          return {
            label: `${optionCd} - ${marketingName}`,
            count,
            value,
        } })
      }
      selectedValues={(columnFilterValue as V[])??[]}
      onChange={column.setFilterValue}
      renderValue={(value) => {
        if (typeof value === 'string') return `(${value})`;

        const {optionCd} = value as OptionDataType
        return `(${optionCd})`
      }}
    />
  ) : (
    <>
    <datalist id={`${column.id}-list`}>
      {facetedUniqueValues.map(([value, ]) => (
        <option value={value} key={value}></option>
      ))}
    </datalist>
    <DebouncedInput
      type="text"
      value={(columnFilterValue ?? '') as string}
      onChange={searchCallback}
      placeholder={`Search...`}
      className="w-full border shadow rounded"
      list={`${column.id}-list`}
    />
    </>
  )
}