"use client";

import { useState, useEffect } from "react";

export interface UseDataTableReturn<TSortKey extends string> {
    // Pagination
    page: number;
    setPage: (page: number) => void;
    limit: number;
    setLimit: (limit: number) => void;

    // Search
    search: string;
    setSearch: (search: string) => void;
    debouncedSearch: string;

    // Sort
    sortBy: TSortKey;
    sortOrder: "asc" | "desc";
    handleSort: (key: TSortKey) => void;
}

/**
 * A reusable hook that centralises common data-table state:
 * pagination, debounced search, and sortable column toggling.
 *
 * @param defaultSortBy  - Initial column to sort by
 * @param defaultOrder   - Initial sort direction (default: "desc")
 * @param debounceMs     - Debounce delay for search in ms (default: 500)
 */
export function useDataTable<TSortKey extends string>(
    defaultSortBy: TSortKey,
    defaultOrder: "asc" | "desc" = "desc",
    debounceMs = 500,
): UseDataTableReturn<TSortKey> {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const [sortBy, setSortBy] = useState<TSortKey>(defaultSortBy);
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">(defaultOrder);

    // Debounce search & reset to page 1 on new query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, debounceMs);
        return () => clearTimeout(timer);
    }, [search, debounceMs]);

    // Toggle sort: same key → flip direction; new key → asc
    const handleSort = (key: TSortKey) => {
        if (sortBy === key) {
            setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortBy(key);
            setSortOrder("asc");
        }
    };

    return {
        page,
        setPage,
        limit,
        setLimit,
        search,
        setSearch,
        debouncedSearch,
        sortBy,
        sortOrder,
        handleSort,
    };
}
