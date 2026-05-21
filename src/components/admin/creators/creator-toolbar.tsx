"use client";

import React from "react";
import SearchInput from "~/components/ui/search";
import ActionButton from "~/components/ui/button-add";

type CreatorToolbarProps = {
    search: string;
    onSearchChange: (val: string) => void;
};

export const CreatorToolbar: React.FC<CreatorToolbarProps> = ({
    search,
    onSearchChange,
}) => {
    return (
        <div className="flex flex-col md:flex-row justify-between gap-4">
            <SearchInput
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Cari Nama, Email atau No. HP"
            />

            <div className="flex gap-3">
                <ActionButton
                    href="/admin/kreator/create"
                    label="Tambah Kreator"
                />
            </div>
        </div>
    );
};
