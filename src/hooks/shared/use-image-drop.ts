"use client";

import { useState, useCallback, type DragEvent } from "react";

/**
 * Hook that adds drag-and-drop image support to any upload area.
 *
 * Returns:
 * - `isDragging` – whether a file is being dragged over the drop zone
 * - `dragHandlers` – spread these onto the drop-zone container div
 * - `handleDrop` will call `onFile(file)` with the first valid image file.
 */
export function useImageDrop(onFile: (file: File) => void | Promise<void>) {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragEnter = useCallback((e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragOver = useCallback((e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // Only set to false when leaving the drop zone itself (not children)
        const relatedTarget = e.relatedTarget as Node | null;
        if (!e.currentTarget.contains(relatedTarget)) {
            setIsDragging(false);
        }
    }, []);

    const handleDrop = useCallback(
        (e: DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);

            const files = e.dataTransfer?.files;
            if (!files || files.length === 0) return;

            const file = files[0];
            if (!file || !file.type.startsWith("image/")) return;

            onFile(file);
        },
        [onFile]
    );

    const dragHandlers = {
        onDragEnter: handleDragEnter,
        onDragOver: handleDragOver,
        onDragLeave: handleDragLeave,
        onDrop: handleDrop,
    };

    return { isDragging, dragHandlers };
}
