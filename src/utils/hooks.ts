'use client';

import { ColumnFiltersState, OnChangeFn, SortingState } from "@tanstack/react-table";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const FILTER_KEY_PREFIX = 'filter_';
const SORTING_KEY = 'sort';
const SORTING_COL_DELIM = ';';
const SORTING_KEY_DELIM = '.';

function parseUrlFilters<T>(searchParams: URLSearchParams, filterParserResolverMap?: UrlParserResolverMap<T>): ColumnFiltersState {
    const filters: ColumnFiltersState = [];

    searchParams.forEach((value, key) => {
        if (key.startsWith(FILTER_KEY_PREFIX)) {
            const decodedValue = decodeURIComponent(value);
            const columnId = key.replace(FILTER_KEY_PREFIX, '');

            const { parser } = filterParserResolverMap?.[ columnId as keyof T]??{};
            const parsedValue = parser ? parser(decodedValue) : decodedValue;
            if (!parsedValue) return

            filters.push({
                id: columnId,
                value: parsedValue
            });
        }
    })

    return filters;
}

function setUrlFilters<T>(filters: ColumnFiltersState, filterParserResolverMap?: UrlParserResolverMap<T>) {
    const newUrlSearchParams = new URLSearchParams(window.location.search);

    filters.forEach(({id, value}) => {
        const { resolver } = filterParserResolverMap?.[ id as keyof T ]??{}
        const resolvedValue = resolver ? resolver(value as UrlValueType<T[keyof T]>) : value
        if (!resolvedValue) return;

        const encodedValue = encodeURIComponent(resolvedValue as string);
        const prefixedKey = `${FILTER_KEY_PREFIX}${id}`;

        newUrlSearchParams.set(prefixedKey, encodedValue);
    })

    window.history.pushState(null, '', `?${newUrlSearchParams.toString()}`);
}

function parseUrlSorting(searchParams: URLSearchParams): SortingState {
    const sortParam = searchParams.get(SORTING_KEY)
    if (!sortParam) return [];

    return sortParam.split(SORTING_COL_DELIM).map(col => {
        const [id, desc] = col.split(SORTING_KEY_DELIM);
        return { id, desc: desc === 'desc' };
    })
}

function setUrlSorting(sorting: SortingState) {
    const newUrlSearchParams = new URLSearchParams(window.location.search);

    if (sorting.length === 0) {
        newUrlSearchParams.delete(SORTING_KEY);
    } else {
        const sortParam = sorting.map(({id, desc}) => `${id}${SORTING_KEY_DELIM}${desc ? 'desc' : 'asc'}`).join(SORTING_COL_DELIM)
        newUrlSearchParams.set(SORTING_KEY, sortParam)
    }

    window.history.replaceState(null, '', `?${newUrlSearchParams.toString()}`)
}

type UrlValueType<T> =   T extends number ? (number | undefined)[] :
                            T extends string ? string[] : T;

export type UrlParserResolverMap<T> = Partial<{
    [K in keyof T]: {
        resolver: (value: UrlValueType<T[K]>) => string
        parser: (value: string) =>  UrlValueType<T[K]>
    }
}>

export function useUrlSorting(dataIsLoaded: boolean) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const searchParams = useSearchParams();

    useEffect(() => {
        if (!dataIsLoaded) return;

        const urlSorting = parseUrlSorting(searchParams);

        setSorting(urlSorting);
    }, [searchParams, dataIsLoaded])

    const handleSortingChange: OnChangeFn<SortingState> = (updater) => {
        if (typeof updater === 'function') {
            const newSorting = updater(sorting)
            setSorting(newSorting)
            setUrlSorting(newSorting);
        } else {
            setSorting(updater);
            setUrlSorting(updater);
        }
    }

    return [
        sorting,
        handleSortingChange
    ] as const;
}

export function useUrlFilters<T>(dataIsLoaded: boolean, filterParserResolverMap?: UrlParserResolverMap<T>) {
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const searchParams = useSearchParams();

    useEffect(() => {
        if (!dataIsLoaded) return;

        const filters = parseUrlFilters(searchParams, filterParserResolverMap);

        setColumnFilters(filters);
    }, [searchParams, filterParserResolverMap, dataIsLoaded]);

    const handleFilterChange: OnChangeFn<ColumnFiltersState> = (updater) => {
        if (typeof updater === 'function') {
            const newFilters = updater(columnFilters)
            setColumnFilters(newFilters)
            setUrlFilters<T>(newFilters, filterParserResolverMap);
        } else {
            setColumnFilters(updater);
            setUrlFilters<T>(updater, filterParserResolverMap);
        }
    }

    return [ 
        columnFilters,
        handleFilterChange
     ] as const;
}