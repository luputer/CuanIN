"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "~/lib/utils";

interface MarkdownPreviewProps {
    content: string;
    className?: string;
}

export default function MarkdownPreview({ content, className }: MarkdownPreviewProps) {
    return (
        <div className={cn("prose prose-sm prose-slate max-w-none text-slate-600 leading-relaxed [&_table]:mt-4 [&_table]:mb-4", className)}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
            </ReactMarkdown>
        </div>
    );
}
