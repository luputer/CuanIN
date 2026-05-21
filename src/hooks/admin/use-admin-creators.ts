"use client";

import { useState, useEffect, useMemo } from "react";
import { api } from "~/trpc/react";
import { toast } from "sonner";

export function useAdminCreators() {
    const utils = api.useUtils();
    
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [sortBy, setSortBy] = useState<"name" | "email" | "createdAt">("createdAt");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const { data: creators, isLoading } = api.creators.getAll.useQuery();

    const deleteCreator = api.creators.delete.useMutation({
        onSuccess: () => {
            void utils.creators.getAll.invalidate();
            toast.success("Kreator berhasil dihapus");
            setDeleteId(null);
        },
        onError: (error) => {
            toast.error(`Gagal menghapus kreator: ${error.message}`);
            setDeleteId(null);
        },
    });

    const filteredCreators = useMemo(() => {
        if (!creators) return [];
        return creators.filter((c) =>
            (c.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            c.email?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            c.phoneNumber?.includes(debouncedSearch))
        );
    }, [creators, debouncedSearch]);

    const total = filteredCreators.length;
    const totalPages = Math.ceil(total / limit);
    
    const paginatedCreators = useMemo(() => {
        return filteredCreators.slice((page - 1) * limit, page * limit);
    }, [filteredCreators, page, limit]);

    const creatorToDelete = creators?.find((c) => c.id === deleteId);

    const handleSort = (field: "name" | "email") => {
        if (sortBy === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(field);
            setSortOrder("asc");
        }
    };

    return {
        // State
        search,
        page,
        limit,
        sortBy,
        sortOrder,
        deleteId,
        
        // Setters
        setSearch,
        setPage,
        setLimit,
        setDeleteId,
        handleSort,
        
        // Data
        creators: paginatedCreators,
        total,
        totalPages,
        isLoading: isLoading && !creators,
        creatorToDelete,
        
        // Mutations
        deleteCreator,
        debouncedSearch
    };
}
