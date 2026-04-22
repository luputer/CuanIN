"use client";

import { GripVertical, Loader2, Plus, Save, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { Skeleton } from "~/components/ui/skeleton";

export type FieldType = "SHORT" | "LONG" | "MULTIPLE_CHOICE" | "CHECKBOX" | "DROPDOWN";

export interface FormField {
    id: string;
    label: string;
    type: FieldType;
    required: boolean;
    options?: string[];
}

const FIELD_TYPE_LABELS: Record<FieldType, string> = {
    SHORT: "Jawaban Singkat",
    LONG: "Paragraf",
    MULTIPLE_CHOICE: "Pilihan Ganda",
    CHECKBOX: "Kotak Centang",
    DROPDOWN: "Drop-down",
};

export function FormCustomizer({ productId }: { productId: string }) {
    const [fields, setFields] = useState<FormField[]>([]);
    const [hasLoaded, setHasLoaded] = useState(false);

    // Load existing form fields from DB
    const { data: savedFields, isLoading } = api.formFields.getByProductId.useQuery(
        { productId },
        { enabled: !!productId }
    );

    const utils = api.useUtils();

    // Save mutation
    const saveMutation = api.formFields.save.useMutation({
        onSuccess: () => {
            void utils.formFields.getByProductId.invalidate();
            toast.success("Form berhasil disimpan!");
        },
        onError: (error) => {
            toast.error(`Gagal menyimpan: ${error.message}`);
        },
    });

    // Populate fields from DB when data arrives
    useEffect(() => {
        if (savedFields && !hasLoaded) {
            setFields(
                savedFields.map((f) => ({
                    id: f.id,
                    label: f.label,
                    type: f.type as FieldType,
                    required: f.required,
                    options: Array.isArray(f.options) ? (f.options as string[]) : undefined,
                }))
            );
            setHasLoaded(true);
        }
    }, [savedFields, hasLoaded]);

    const addField = () => {
        setFields([
            ...fields,
            { id: Date.now().toString(), label: "", type: "SHORT", required: false },
        ]);
    };

    const updateField = (id: string, updates: Partial<FormField>) => {
        setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
    };

    const removeField = (id: string) => {
        setFields(fields.filter(f => f.id !== id));
    };

    const addOption = (fieldId: string) => {
        setFields(fields.map(f => {
            if (f.id === fieldId) {
                const currentOptions = f.options ?? ["Opsi 1"];
                return { ...f, options: [...currentOptions, `Opsi ${currentOptions.length + 1}`] };
            }
            return f;
        }));
    };

    const updateOption = (fieldId: string, index: number, value: string) => {
        setFields(fields.map(f => {
            if (f.id === fieldId && f.options) {
                const newOptions = [...f.options];
                newOptions[index] = value;
                return { ...f, options: newOptions };
            }
            return f;
        }));
    };

    const removeOption = (fieldId: string, index: number) => {
        setFields(fields.map(f => {
            if (f.id === fieldId && f.options) {
                const newOptions = f.options.filter((_, i) => i !== index);
                return { ...f, options: newOptions };
            }
            return f;
        }));
    };

    const handleTypeChange = (id: string, newType: FieldType) => {
        setFields(fields.map(f => {
            if (f.id === id) {
                if (["MULTIPLE_CHOICE", "CHECKBOX", "DROPDOWN"].includes(newType)) {
                    return { ...f, type: newType, options: f.options?.length ? f.options : ["Opsi 1"] };
                } else {
                    return { ...f, type: newType };
                }
            }
            return f;
        }));
    };

    const handleSave = () => {
        // Validate all fields have labels
        const hasEmptyLabels = fields.some(f => !f.label.trim());
        if (hasEmptyLabels) {
            toast.error("Semua field harus memiliki label");
            return;
        }

        saveMutation.mutate({
            productId,
            fields: fields.map((f, index) => ({
                label: f.label,
                type: f.type,
                options: f.options,
                required: f.required,
                order: index,
            })),
        });
    };

    if (isLoading) {
        return (
            <div className="bg-[#f0f9fa] p-4 md:p-6 rounded-b-xl border border-slate-200 animate-pulse">
                <Skeleton className="h-6 w-48 mb-2" />
                <div className="h-[2px] bg-[#00B4D8] opacity-20 w-full mb-6"></div>

                <div className="space-y-4 mb-6">
                    {[1, 2].map((i) => (
                        <div key={i} className="bg-white border border-slate-200 rounded-lg p-5 flex gap-4">
                            <Skeleton className="w-[18px] h-[18px] mt-6" />
                            <div className="flex-1 space-y-4">
                                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-slate-100 pb-4">
                                    <Skeleton className="h-10 flex-1 md:max-w-[60%]" />
                                    <div className="flex items-center gap-4">
                                        <Skeleton className="h-10 w-32 rounded-md" />
                                        <Skeleton className="w-6 h-6 rounded-md" />
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <Skeleton className="h-4 w-24 mb-4" />
                                    <Skeleton className="h-6 w-48 border-b border-slate-100 pb-2" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#f0f9fa] p-4 md:p-6 rounded-b-xl border border-slate-200">
            <h2 className="text-[17px] font-bold text-slate-700 mb-6">
                Kustomisasi Isian Form
                <div className="h-[2px] bg-[#00B4D8] w-full mt-2"></div>
            </h2>

            <div className="space-y-4 mb-6">
                {fields.map((field) => (
                    <div key={field.id} className="bg-white border border-slate-300 rounded-lg p-5 flex gap-4">
                        <div className="mt-6 text-blue-300">
                            <GripVertical className="w-[18px] h-[18px] cursor-grab opacity-50" />
                        </div>
                        <div className="flex-1 space-y-4">
                            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                                <div className="flex-1 w-full md:max-w-[60%] border-b border-slate-300">
                                    <input
                                        type="text"
                                        placeholder="Pilihan"
                                        value={field.label}
                                        onChange={(e) => updateField(field.id, { label: e.target.value })}
                                        className="w-full py-2 focus:outline-none bg-transparent font-medium text-slate-700 text-[15px]"
                                    />
                                </div>
                                <div className="flex items-center gap-4">
                                    <select
                                        value={field.type}
                                        onChange={(e) => handleTypeChange(field.id, e.target.value as FieldType)}
                                        className="border border-slate-300 rounded-md px-3 py-1.5 text-[15px] font-medium text-slate-600 focus:outline-none appearance-none bg-white pr-8 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px_10px] bg-no-repeat bg-[position:right_10px_center]"
                                    >
                                        {Object.entries(FIELD_TYPE_LABELS).map(([value, label]) => (
                                            <option key={value} value={value}>{label}</option>
                                        ))}
                                    </select>
                                    <button onClick={() => removeField(field.id)} className="text-red-500 hover:text-red-700 transition-colors">
                                        <Trash2 className="w-[20px] h-[20px]" />
                                    </button>
                                </div>
                            </div>

                            <div className="pt-2">
                                <h4 className="text-[15px] font-medium text-slate-700 mb-2">Jawaban</h4>
                                {field.type === "SHORT" ? (
                                    <div className="border-b border-slate-300 pb-2 text-slate-400 text-[15px]">Teks jawaban singkat</div>
                                ) : field.type === "LONG" ? (
                                    <>
                                        <div className="border-b border-slate-300 pb-2 text-slate-400 text-[15px]">Teks jawaban panjang</div>
                                        <div className="border-b border-slate-300 mt-6"></div>
                                    </>
                                ) : (
                                    <div className="space-y-3">
                                        {field.options?.map((option, index) => (
                                            <div key={index} className="flex items-center gap-3">
                                                {field.type === "MULTIPLE_CHOICE" && (
                                                    <div className="w-[18px] h-[18px] rounded-full border border-slate-300 flex-shrink-0"></div>
                                                )}
                                                {field.type === "CHECKBOX" && (
                                                    <div className="w-[18px] h-[18px] rounded border border-slate-300 flex-shrink-0"></div>
                                                )}
                                                {field.type === "DROPDOWN" && (
                                                    <div className="text-slate-400 text-[15px] w-5 flex-shrink-0">{index + 1}.</div>
                                                )}
                                                <input
                                                    type="text"
                                                    value={option}
                                                    onChange={(e) => updateOption(field.id, index, e.target.value)}
                                                    className="flex-1 py-1 border-b border-slate-300 hover:border-slate-400 focus:border-[#00B4D8] focus:outline-none bg-transparent text-[15px] text-slate-600 transition-colors"
                                                    placeholder={`Opsi ${index + 1}`}
                                                />
                                                {(field.options?.length ?? 0) > 1 && (
                                                    <button onClick={() => removeOption(field.id, index)} className="text-slate-400 hover:text-slate-600 flex-shrink-0">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        <div className="flex items-center gap-3 mt-2">
                                            {field.type === "MULTIPLE_CHOICE" && (
                                                <div className="w-[18px] h-[18px] rounded-full border border-slate-300 flex-shrink-0"></div>
                                            )}
                                            {field.type === "CHECKBOX" && (
                                                <div className="w-[18px] h-[18px] rounded border border-slate-300 flex-shrink-0"></div>
                                            )}
                                            {field.type === "DROPDOWN" && (
                                                <div className="text-slate-400 text-[15px] w-5 flex-shrink-0">{field.options ? field.options.length + 1 : 1}.</div>
                                            )}
                                            <button
                                                onClick={() => addOption(field.id)}
                                                className="text-[#00B4D8] hover:text-[#009bc2] font-medium text-[15px] py-1 transition-colors"
                                            >
                                                Tambah Opsi
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-end mt-6 items-center border-t border-slate-100 pt-4">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={field.required}
                                            onChange={(e) => updateField(field.id, { required: e.target.checked })}
                                        />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00B4D8]"></div>
                                        <span className="ml-2 text-[15px] font-medium text-slate-600">Wajib diisi</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex flex-col gap-3">
                <button
                    onClick={addField}
                    className="w-full bg-[#00B4D8] hover:bg-[#009bc2] text-white py-3.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors text-[15px]"
                >
                    Tambah Field <Plus className="w-[18px] h-[18px]" strokeWidth={3} />
                </button>

                {fields.length > 0 && (
                    <button
                        onClick={handleSave}
                        disabled={saveMutation.isPending}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-3.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors text-[15px]"
                    >
                        {saveMutation.isPending ? (
                            <><Loader2 className="w-[18px] h-[18px] animate-spin" /> Menyimpan...</>
                        ) : (
                            <><Save className="w-[18px] h-[18px]" /> Simpan Form</>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}
