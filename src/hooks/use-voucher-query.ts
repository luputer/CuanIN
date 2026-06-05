"use client";

import { useState, useEffect } from "react";

export type VoucherQueryState = {
    page: number;
    limit: number;
    search: string;
    debouncedSearch: string;
    sortBy: "code" | "createdAt" | "startDate";
    sortOrder: "asc" | "desc";
    typeFilter: "ALL" | "PERSEN" | "NOMINAL";
    statusFilter: string;
};

export function useVoucherQuery() {
    const [query, setQuery] = useState<VoucherQueryState>({
        page: 1,
        limit: 10,
        search: "",
        debouncedSearch: "",
        sortBy: "createdAt",
        sortOrder: "desc",
        typeFilter: "ALL",
        statusFilter: "ALL",
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            setQuery(prev => ({ ...prev, debouncedSearch: query.search, page: 1 }));
        }, 500);
        return () => clearTimeout(timer);
    }, [query.search]);

    const setPage = (page: number) => setQuery(prev => ({ ...prev, page }));
    const setLimit = (limit: number) => setQuery(prev => ({ ...prev, limit }));
    const setSearch = (search: string) => setQuery(prev => ({ ...prev, search }));
    const setSort = (sortBy: VoucherQueryState["sortBy"]) => {
        setQuery(prev => ({
            ...prev,
            sortBy,
            sortOrder: prev.sortBy === sortBy ? (prev.sortOrder === "asc" ? "desc" : "asc") : "asc"
        }));
    };
    const setTypeFilter = (typeFilter: VoucherQueryState["typeFilter"]) => setQuery(prev => ({ ...prev, typeFilter, page: 1 }));
    const setStatusFilter = (statusFilter: string) => setQuery(prev => ({ ...prev, statusFilter, page: 1 }));

    return {
        query,
        setPage,
        setLimit,
        setSearch,
        setSort,
        setTypeFilter,
        setStatusFilter,
    };
}
