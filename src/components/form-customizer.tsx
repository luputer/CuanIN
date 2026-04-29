"use client";

import { DotsSixVerticalIcon, CircleNotchIcon, PlusIcon, TrashIcon, XIcon, CheckCircleIcon, CaretDownIcon } from "@phosphor-icons/react";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import ButtonSave from "~/components/ui/button-save";
import { Skeleton } from "~/components/ui/skeleton";
import { useDebounce } from "~/hooks/use-debounce";
import { SectionHeader } from "~/components/ui/form-layout";

// --- IMPORT DND KIT ---
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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

// --- KOMPONEN BARIS FIELD (SORTABLE) ---
function SortableFieldItem({
    field,
    updateField,
    removeField,
    handleTypeChange,
    updateOption,
    removeOption,
    addOption
}: {
    field: FormField,
    updateField: (id: string, updates: Partial<FormField>) => void,
    removeField: (id: string) => void,
    handleTypeChange: (id: string, type: FieldType) => void,
    updateOption: (id: string, i: number, v: string) => void,
    removeOption: (id: string, i: number) => void,
    addOption: (id: string) => void
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 0,
        position: 'relative' as const,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`bg-white border border-slate-800 rounded-lg py-5 pl-3 sm:pl-4 pr-4 sm:pr-5 flex items-center gap-3 sm:gap-4 ${isDragging ? "shadow-lg ring-2 ring-cyan-500 z-50" : ""}`}
        >
            {/* HANDLE DRAG (Pindahkan listeners ke sini) */}
            <div {...attributes} {...listeners} className="text-blue-300 cursor-grab active:cursor-grabbing p-1 hover:bg-slate-100 rounded">
                <DotsSixVerticalIcon className="w-[24px] h-[24px] text-slate-400" />
            </div>

            <div className="flex-1 space-y-4">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div className="flex-1 w-full md:max-w-[60%] border-b border-slate-300">
                        <input
                            type="text"
                            placeholder="Masukkan Pertanyaan"
                            value={field.label}
                            onChange={(e) => updateField(field.id, { label: e.target.value })}
                            className="w-full py-2 focus:outline-none bg-transparent font-medium text-slate-700 text-[15px]"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <select
                                value={field.type}
                                onChange={(e) => handleTypeChange(field.id, e.target.value as FieldType)}
                                className="border border-slate-300 rounded-md pl-3 pr-9 py-1.5 text-[15px] font-medium text-slate-600 focus:outline-none bg-white appearance-none cursor-pointer hover:border-slate-400 transition-colors"
                            >
                                {Object.entries(FIELD_TYPE_LABELS).map(([value, label]) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-slate-600 transition-colors">
                                <CaretDownIcon className="w-4 h-4" weight="bold" />
                            </div>
                        </div>
                        <button onClick={() => removeField(field.id)} className="text-red-500 hover:text-red-700 p-1 cursor-pointer">
                            <TrashIcon className="w-[20px] h-[20px]" />
                        </button>
                    </div>
                </div>
                <div className="pt-2">
                    <h4 className="text-[15px] font-medium text-slate-700 mb-2">Jawaban</h4>
                    {field.type === "SHORT" ? (
                        <div className="border-b border-slate-300 pb-2 text-slate-400 text-[15px]">Teks jawaban singkat</div>
                    ) : field.type === "LONG" ? (
                        <div className="border-b border-slate-300 pb-2 text-slate-400 text-[15px]">Teks jawaban panjang</div>
                    ) : (
                        <div className="space-y-3">
                            {field.options?.map((option, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <input
                                        type="text"
                                        value={option}
                                        onChange={(e) => updateOption(field.id, index, e.target.value)}
                                        className="flex-1 py-1 border-b border-slate-300 focus:border-[#00B4D8] focus:outline-none text-[15px]"
                                        placeholder={`Opsi ${index + 1}`}
                                    />
                                    {field.options!.length > 1 && (
                                        <button onClick={() => removeOption(field.id, index)} className="text-slate-400 hover:text-red-500 cursor-pointer p-1">
                                            <XIcon className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button onClick={() => addOption(field.id)} className="text-cyan-600 text-[15px] font-medium hover:text-cyan-700 transition-colors cursor-pointer">+ Tambah Opsi</button>
                        </div>
                    )}
                </div>

                <div className="flex justify-end mt-6 items-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={field.required}
                            onChange={(e) => updateField(field.id, { required: e.target.checked })}
                        />
                        <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-[#00B4D8] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                        <span className="ml-2 text-[15px] font-medium text-slate-600">Wajib diisi</span>
                    </label>
                </div>
            </div>
        </div>
    );
}

// --- KOMPONEN UTAMA ---
export function FormCustomizer({ productId }: { productId: string }) {
    const [fields, setFields] = useState<FormField[]>([]);
    const [hasLoaded, setHasLoaded] = useState(false);
    const lastSavedRef = useRef<string>("");
    const isSavingRef = useRef(false); // ← tambah ini di atas, sejajar lastSavedRef

    // Setup Sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const { data: savedFields, isLoading } = api.formFields.getByProductId.useQuery(
        { productId }, { enabled: !!productId }
    );


    const utils = api.useUtils();


    // Save mutation
    const saveMutation = api.formFields.save.useMutation({
        onSuccess: () => {
            void utils.formFields.getByProductId.invalidate();
        },
        onError: (error) => {
            toast.error(`Gagal menyimpan otomatis: ${error.message}`);
        },
    });

    useEffect(() => {
        if (savedFields && !hasLoaded) {
            const mappedFields = savedFields.map((f) => ({
                id: f.id,
                label: f.label,
                type: f.type as FieldType,
                required: f.required,
                options: Array.isArray(f.options) ? (f.options as string[]) : undefined,
            }));

            setFields(mappedFields);

            // Inisialisasi ref dengan data awal
            lastSavedRef.current = JSON.stringify({
                productId,
                fields: mappedFields.map((f, index) => ({
                    label: f.label,
                    type: f.type,
                    required: f.required,
                    options: f.options,
                    order: index,
                })),
            });

            setHasLoaded(true);
        }
    }, [savedFields, hasLoaded, productId]);

    const debouncedFields = useDebounce(fields, 1000);


    useEffect(() => {
        if (!hasLoaded) return;
        if (debouncedFields.length === 0 && fields.length > 0) return;
        if (isSavingRef.current) return; // ← skip kalau masih ada request berjalan

        const fieldsPayload = debouncedFields.map((f, index) => ({
            id: f.id,
            label: f.label.trim() || "Pertanyaan Tanpa Judul",
            type: f.type,
            required: f.required,
            options: f.options,
            order: index,
        }));

        const payload = { productId, fields: fieldsPayload };
        const payloadString = JSON.stringify(payload);

        if (payloadString === lastSavedRef.current) return; // ← skip kalau data sama

        isSavingRef.current = true;

        saveMutation.mutate(payload, {
            onSuccess: () => {
                lastSavedRef.current = payloadString;
                // ← TIDAK invalidate, state lokal sudah benar
            },
            onSettled: () => {
                isSavingRef.current = false; // ← reset setelah selesai (sukses/error)
            },
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedFields, productId, hasLoaded]);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setFields((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    // Fungsi-fungsi pembantu dengan functional updates
    const addField = () => {
        const newField: FormField = {
            id: crypto.randomUUID(),
            label: "Pertanyaan Tanpa Judul",
            type: "SHORT",
            required: false
        };
        setFields(prev => [...prev, newField]);
    };

    const updateField = (id: string, updates: Partial<FormField>) => {
        setFields(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
    };

    const removeField = (id: string) => {
        setFields(prev => prev.filter(f => f.id !== id));
    };

    const addOption = (fId: string) => {
        setFields(prev => prev.map(f => f.id === fId ? {
            ...f,
            options: [...(f.options ?? ["Opsi 1"]), `Opsi ${(f.options?.length ?? 0) + 1}`]
        } : f));
    };

    const updateOption = (fId: string, idx: number, val: string) => {
        setFields(prev => prev.map(f => f.id === fId && f.options ? {
            ...f,
            options: f.options.map((o, i) => i === idx ? val : o)
        } : f));
    };

    const removeOption = (fId: string, idx: number) => {
        setFields(prev => prev.map(f => f.id === fId && f.options ? {
            ...f,
            options: f.options.filter((_, i) => i !== idx)
        } : f));
    };

    const handleTypeChange = (id: string, type: FieldType) => {
        setFields(prev => prev.map(f => f.id === id ? {
            ...f,
            type,
            options: ["MULTIPLE_CHOICE", "CHECKBOX", "DROPDOWN"].includes(type)
                ? (f.options?.length ? f.options : ["Opsi 1"])
                : undefined
        } : f));
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
        <div className="bg-white px-4 sm:px-8 py-6 sm:py-8">
            <SectionHeader title="Kustomisasi Isian Form">
                <div className="text-xs font-medium">
                    {saveMutation.isPending ? (
                        <span className="flex items-center gap-1.5 text-slate-400">
                            <CircleNotchIcon className="animate-spin w-4 h-4" />
                            Menyimpan...
                        </span>
                    ) : saveMutation.isSuccess ? (
                        <span className="flex items-center gap-1.5 text-emerald-500">
                            <CheckCircleIcon className="w-4 h-4" weight="fill" />
                            Tersimpan
                        </span>
                    ) : null}
                </div>
            </SectionHeader>

            <div className="pb-8 py-4">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-4">
                            {fields.map((field) => (
                                <SortableFieldItem
                                    key={field.id}
                                    field={field}
                                    updateField={updateField}
                                    removeField={removeField}
                                    handleTypeChange={handleTypeChange}
                                    updateOption={updateOption}
                                    removeOption={removeOption}
                                    addOption={addOption}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            </div>


            <div className="flex flex-col gap-3">
                <ButtonSave label="Tambah Field" icon={PlusIcon} weight="bold" onClick={addField} className="w-full justify-center" />
            </div>
        </div>
    );
}
