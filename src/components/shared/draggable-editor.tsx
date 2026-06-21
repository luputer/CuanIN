"use client";

import React, { useRef, useState } from "react";
import dynamic from "next/dynamic";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

// Dynamic import — MDEditor tidak support SSR
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface DraggableEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    initialHeight?: number;
    minHeight?: number;
}

/**
 * MDEditor wrapper dengan fitur drag-to-resize tinggi editor.
 * Menggunakan custom drag handler di bawah editor.
 */
export const DraggableEditor = ({
    value,
    onChange,
    placeholder = "Masukkan deskripsi...",
    initialHeight = 150,
    minHeight = 150,
}: DraggableEditorProps) => {
    const [editorHeight, setEditorHeight] = useState(initialHeight);
    const isDragging = useRef(false);
    const startY = useRef(0);
    const startHeight = useRef(0);

    const handleMouseDown = (e: React.MouseEvent) => {
        isDragging.current = true;
        startY.current = e.clientY;
        startHeight.current = editorHeight;
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
        document.body.style.cursor = "row-resize";
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging.current) return;
        const delta = e.clientY - startY.current;
        const newHeight = Math.max(minHeight, startHeight.current + delta);
        setEditorHeight(newHeight);
    };

    const handleMouseUp = () => {
        isDragging.current = false;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.cursor = "default";
    };

    return (
        <div
            data-color-mode="light"
            className="relative border border-slate-400 rounded-lg overflow-hidden group"
        >
            <MDEditor
                textareaProps={{ placeholder }}
                value={value}
                onChange={(val) => onChange(val ?? "")}
                height={editorHeight}
                preview="live"
                visibleDragbar={false}
                style={{ border: "none", boxShadow: "none" }}
                previewOptions={{ remarkPlugins: [remarkGfm, remarkBreaks] }}
            />
            {/* Custom Drag Handler */}
            <div
                onMouseDown={handleMouseDown}
                className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-100 hover:bg-cuan-cyan/20 cursor-row-resize flex items-center justify-center transition-colors border-t border-slate-200"
            >
                <div className="w-12 h-1 bg-slate-300 rounded-full group-hover:bg-cuan-cyan/30" />
            </div>
        </div>
    );
};
