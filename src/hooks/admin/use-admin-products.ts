"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";

export function useAdminProducts() {
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [sortBy, setSortBy] = useState<"name" | "createdAt">("createdAt");
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

	const [typeFilter, setTypeFilter] = useState<string>("ALL");
	const [statusFilter, setStatusFilter] = useState<string>("ALL");

	// Debounce search
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(search);
			setPage(1);
		}, 500);
		return () => clearTimeout(timer);
	}, [search]);

	const { data, isLoading } = api.products.adminGetAll.useQuery({
		page,
		limit,
		search: debouncedSearch || undefined,
		sortBy,
		sortOrder,
		type: typeFilter === "ALL" ? undefined : typeFilter as any,
		status: statusFilter,
	}, {
		placeholderData: (prev) => prev,
	});

	const products = data?.items;
	const total = data?.total ?? 0;
	const totalPages = data?.totalPages ?? 1;

	const handleSort = (field: "name" | "createdAt") => {
		if (sortBy === field) {
			setSortOrder(sortOrder === "asc" ? "desc" : "asc");
		} else {
			setSortBy(field);
			setSortOrder("asc");
		}
	};

	return {
		// State
		page,
		limit,
		search,
		sortBy,
		sortOrder,
		typeFilter,
		statusFilter,

		// Setters
		setPage,
		setLimit,
		setSearch,
		setTypeFilter,
		setStatusFilter,
		handleSort,

		// Data
		products,
		total,
		totalPages,
		isLoading,
	};
}
