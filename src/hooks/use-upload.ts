// hooks/useImageUpload.ts
import { useState } from "react";
import { toast } from "sonner";
import { api } from "~/trpc/react";

interface UseImageUploadReturn {
    uploading: boolean;
    previewUrl: string | null;
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<string | null>;
    setPreviewUrl: (url: string | null) => void;
}

export function useImageUpload(folder = "products"): UseImageUploadReturn {
    const getPresignedUrl = api.s3.getUploadPresignedUrl.useMutation();
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleFileUpload = async (
        e: React.ChangeEvent<HTMLInputElement>
    ): Promise<string | null> => {
        const file = e.target.files?.[0];
        if (!file) return null;

        const localUrl = URL.createObjectURL(file);
        setPreviewUrl(localUrl);
        setUploading(true);

        try {
            const key = `${folder}/${Date.now()}-${file.name}`;
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

            const publicUrl = `https://pub-3098f58e584244c8bf48888938b34bae.r2.dev/${key}`;
            setPreviewUrl(publicUrl);
            toast.success("Gambar berhasil diunggah");
            return publicUrl; // ← dikembalikan, bukan setValue langsung
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