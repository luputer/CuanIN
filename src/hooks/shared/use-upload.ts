// hooks/useImageUpload.ts
import { useState } from "react";
import { toast } from "sonner";
import { api } from "~/trpc/react";

interface UseImageUploadReturn {
    uploading: boolean;
    previewUrl: string | null;
    handleFileUpload: (fileOrEvent: File | React.ChangeEvent<HTMLInputElement>, originalFile?: File) => Promise<string | null>;
    setPreviewUrl: (url: string | null) => void;
}

export function useImageUpload(folder = "products"): UseImageUploadReturn {
    const getPresignedUrl = api.s3.getUploadPresignedUrl.useMutation();
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleFileUpload = async (
        fileOrEvent: File | React.ChangeEvent<HTMLInputElement>,
        originalFile?: File
    ): Promise<string | null> => {
        const file = fileOrEvent instanceof File ? fileOrEvent : fileOrEvent.target.files?.[0];
        if (!file) return null;

        const localUrl = URL.createObjectURL(file);
        setPreviewUrl(localUrl);
        setUploading(true);

        try {
            const timestamp = Date.now();
            const filenameSanitized = file.name.replace(/\s+/g, "_");

            // If originalFile is provided, upload it first with the same timestamp & original- prefix
            if (originalFile) {
                const originalSanitized = originalFile.name.replace(/\s+/g, "_");
                const originalKey = `${folder}/original-${timestamp}-${originalSanitized}`;
                try {
                    const originalPresignedUrl = await getPresignedUrl.mutateAsync({
                        key: originalKey,
                        fileType: originalFile.type,
                    });
                    await fetch(originalPresignedUrl, {
                        method: "PUT",
                        body: originalFile,
                        headers: { "Content-Type": originalFile.type },
                    });
                } catch (err) {
                    console.error("Failed to upload original image to S3:", err);
                }
            }

            const key = `${folder}/${timestamp}-${filenameSanitized}`;
            const url = await getPresignedUrl.mutateAsync({
                key,
                fileType: file.type,
            });

            const res = await fetch(url, {
                method: "PUT",
                body: file,
                headers: { "Content-Type": file.type },
            });

            if (!res.ok) throw new Error("Gagal upload ke storage");

            // Menggunakan variabel env dinamis, dengan fallback ke subdomain baru kamu
            const baseUrl = process.env.NEXT_PUBLIC_BUCKET_PUBLIC_URL ?? "https://storage.cuanin.my.id";
            const publicUrl = `${baseUrl}/${key}`;

            setPreviewUrl(publicUrl);
            toast.success("Gambar berhasil diunggah");
            return publicUrl;
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Terjadi kesalahan";
            toast.error(`Gagal unggah gambar: ${errorMessage}`);
            setPreviewUrl(null);
            return null;
        } finally {
            setUploading(false);
        }
    };

    return { uploading, previewUrl, handleFileUpload, setPreviewUrl };
}