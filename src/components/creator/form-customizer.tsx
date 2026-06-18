"use client";

import {
  DotsSixVerticalIcon,
  CircleNotchIcon,
  PlusIcon,
  TrashIcon,
  XIcon,
  CheckCircleIcon,
  CaretDownIcon,
} from "@phosphor-icons/react";
import { useEffect, useState, useRef, useCallback, type CSSProperties } from "react";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import ButtonSave from "~/components/shared/button-save";
import { Skeleton } from "~/components/ui/skeleton";
import { useDebounce } from "~/hooks/shared/use-debounce";
import { SectionHeader } from "~/components/shared/form-layout";

// --- IMPORT DND KIT ---
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export type FieldType =
  | "SHORT"
  | "LONG"
  | "MULTIPLE_CHOICE"
  | "CHECKBOX"
  | "DROPDOWN";

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
  addOption,
}: {
  field: FormField;
  updateField: (id: string, updates: Partial<FormField>) => void;
  removeField: (id: string) => void;
  handleTypeChange: (id: string, type: FieldType) => void;
  updateOption: (id: string, i: number, v: string) => void;
  removeOption: (id: string, i: number) => void;
  addOption: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 0,
    position: "relative",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 rounded-lg border border-slate-800 bg-white p-3.5 sm:gap-4 sm:p-5 ${isDragging ? "z-50 shadow-lg ring-2 ring-cyan-500" : ""}`}
    >
      {/* HANDLE DRAG */}
      <div
        {...attributes}
        {...listeners}
        aria-label="Geser untuk mengatur ulang urutan"
        className="cursor-grab rounded p-1 text-blue-300 hover:bg-slate-100 active:cursor-grabbing"
      >
        <DotsSixVerticalIcon className="size-6 text-slate-400" />
      </div>

      <div className="flex-1 space-y-3 sm:space-y-4">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center md:gap-4">
          <div className="w-full flex-1 border-b border-slate-300 md:max-w-[60%]">
            <input
              type="text"
              placeholder="Masukkan Pertanyaan"
              aria-label="Pertanyaan"
              value={field.label}
              onChange={(e) => updateField(field.id, { label: e.target.value })}
              className="w-full bg-transparent py-1.5 text-[15px] font-medium text-slate-700 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="group relative flex-1 md:flex-initial">
              <select
                value={field.type}
                onChange={(e) =>
                  handleTypeChange(field.id, e.target.value as FieldType)
                }
                className="w-full cursor-pointer appearance-none rounded-md border border-slate-300 bg-white py-1.5 pr-9 pl-3 text-[14px] sm:text-[15px] font-medium text-slate-600 transition-colors hover:border-slate-400 focus:outline-none"
              >
                {Object.entries(FIELD_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 transition-colors group-hover:text-slate-600">
                <CaretDownIcon className="size-4" weight="bold" />
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeField(field.id)}
              aria-label="Hapus Pertanyaan"
              className="cursor-pointer p-2 rounded-md hover:bg-red-50 text-red-500 hover:text-red-700 transition-colors shrink-0"
            >
              <TrashIcon className="size-5" />
            </button>
          </div>
        </div>
        <div className="pt-1">
          <h4 className="mb-1.5 text-[14px] sm:text-[15px] font-medium text-slate-700">
            Jawaban
          </h4>
          {field.type === "SHORT" ? (
            <div className="border-b border-slate-300 pb-1.5 text-[14px] sm:text-[15px] text-slate-400 max-w-xs sm:max-w-md">
              Teks jawaban singkat
            </div>
          ) : field.type === "LONG" ? (
            <div className="border-b border-slate-300 pb-1.5 text-[14px] sm:text-[15px] text-slate-400">
              Teks jawaban panjang
            </div>
          ) : (
            <div className="space-y-2.5 sm:space-y-3">
              {field.options?.map((option, index) => (
                // FIX 1: Pakai index sebagai key karena teks opsi bisa duplikat
                <div key={`${field.id}-option-${index}`} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) =>
                      updateOption(field.id, index, e.target.value)
                    }
                    className="flex-1 border-b border-slate-300 py-1 text-[14px] sm:text-[15px] focus:border-[#00B4D8] focus:outline-none"
                    placeholder={`Opsi ${index + 1}`}
                  />
                  {field.options!.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeOption(field.id, index)}
                      aria-label="Hapus Opsi"
                      className="cursor-pointer p-1.5 text-slate-400 hover:bg-slate-100 hover:text-red-500 rounded-md transition-colors shrink-0"
                    >
                      <XIcon className="size-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addOption(field.id)}
                className="cursor-pointer text-[14px] sm:text-[15px] font-medium text-cyan-600 transition-colors hover:text-cyan-700"
              >
                + Tambah Opsi
              </button>
            </div>
          )}
        </div>

        <div className="mt-4 sm:mt-5 flex items-center justify-end">
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={field.required}
              onChange={(e) =>
                updateField(field.id, { required: e.target.checked })
              }
            />
            <div className="peer h-6 w-11 rounded-full bg-slate-200 peer-checked:bg-[#00B4D8] after:absolute after:top-0.5 after:left-0.5 after:size-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full"></div>
            <span className="ml-2 text-[14px] sm:text-[15px] font-medium text-slate-600">
              Wajib diisi
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}

// --- KOMPONEN UTAMA ---
export interface FormCustomizerProps {
  productId?: string;
  value?: FormField[];
  onChange?: (fields: FormField[]) => void;
}

export function FormCustomizer({ productId, value, onChange }: FormCustomizerProps) {
  const isControlled = value !== undefined && onChange !== undefined;

  // FIX 2: Selalu maintain internal fields state agar drag/mutasi lokal tetap konsisten.
  // Di controlled mode, fields di-sync dari `value` prop via useEffect.
  const [fields, setFields] = useState<FormField[]>(value ?? []);
  const [hasLoaded, setHasLoaded] = useState(isControlled);
  const lastSavedRef = useRef<string>("");
  const isSavingRef = useRef(false);
  const pendingOnChangeRef = useRef(false);

  // Sync dari controlled value ke internal state.
  // Reset pendingOnChangeRef agar effect propagation tidak terpicu balik ke parent.
  useEffect(() => {
    if (isControlled) {
      pendingOnChangeRef.current = false;
      setFields(value);
    }
  }, [value]);
  // isControlled tidak perlu di deps karena nilainya tidak berubah selama lifecycle

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const { data: savedFields, isLoading } =
    api.formFields.getByProductId.useQuery(
      { productId: productId ?? "" },
      { enabled: !isControlled && !!productId },
    );

  const utils = api.useUtils();

  const saveMutation = api.formFields.save.useMutation({
    onSuccess: () => {
      void utils.formFields.getByProductId.invalidate();
    },
    onError: (error) => {
      toast.error(`Gagal menyimpan otomatis: ${error.message}`);
    },
  });

  useEffect(() => {
    if (isControlled) return;
    if (savedFields && !hasLoaded) {
      const mappedFields = savedFields.map((f) => ({
        id: f.id,
        label: f.label,
        type: f.type,
        required: f.required,
        options: Array.isArray(f.options) ? (f.options as string[]) : undefined,
      }));

      setFields(mappedFields);
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
  }, [savedFields, hasLoaded, productId, isControlled]);

  const debouncedFields = useDebounce(fields, 1000);

  // FIX 4: Gunakan useCallback-wrapped mutate agar ref selalu fresh, dan
  // tambahkan saveMutation.mutate ke deps dengan useCallback pattern
  useEffect(() => {
    if (isControlled || !hasLoaded) return;
    if (debouncedFields.length === 0 && fields.length > 0) return;
    if (isSavingRef.current) return;

    const fieldsPayload = debouncedFields.map((f, index) => ({
      id: f.id,
      label: f.label.trim() || "Pertanyaan Tanpa Judul",
      type: f.type,
      required: f.required,
      options: f.options,
      order: index,
    }));

    const payload = { productId: productId ?? "", fields: fieldsPayload };
    const payloadString = JSON.stringify(payload);

    if (payloadString === lastSavedRef.current) return;

    isSavingRef.current = true;

    saveMutation.mutate(payload, {
      onSuccess: () => {
        lastSavedRef.current = payloadString;
      },
      onSettled: () => {
        isSavingRef.current = false;
      },
    });
  }, [debouncedFields, productId, hasLoaded, isControlled]);

  // FIX 5: handleFieldsChange sekarang selalu update internal state (fields),
  // DAN memanggil onChange di controlled mode. Dua-duanya jalan.
  const handleFieldsChange = useCallback(
    (updater: FormField[] | ((prev: FormField[]) => FormField[])) => {
      if (isControlled) {
        pendingOnChangeRef.current = true;
      }
      setFields((prev) =>
        typeof updater === "function" ? updater(prev) : updater,
      );
    },
    [isControlled],
  );

  // FIX: Propagate ke parent SETELAH state update selesai, bukan saat render
  useEffect(() => {
    if (isControlled && pendingOnChangeRef.current) {
      pendingOnChangeRef.current = false;
      onChange(fields);
    }
  }, [fields, isControlled, onChange]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        handleFieldsChange((items) => {
          const oldIndex = items.findIndex((i) => i.id === active.id);
          const newIndex = items.findIndex((i) => i.id === over.id);
          return arrayMove(items, oldIndex, newIndex);
        });
      }
    },
    [handleFieldsChange],
  );

  const addField = useCallback(() => {
    const newField: FormField = {
      id: crypto.randomUUID(),
      label: "Pertanyaan Tanpa Judul",
      type: "SHORT",
      required: false,
    };
    handleFieldsChange((prev) => [...prev, newField]);
  }, [handleFieldsChange]);

  const updateField = useCallback(
    (id: string, updates: Partial<FormField>) => {
      handleFieldsChange((prev) =>
        prev.map((f) => (f.id === id ? { ...f, ...updates } : f)),
      );
    },
    [handleFieldsChange],
  );

  const removeField = useCallback(
    (id: string) => {
      handleFieldsChange((prev) => prev.filter((f) => f.id !== id));
    },
    [handleFieldsChange],
  );

  const addOption = useCallback(
    (fId: string) => {
      handleFieldsChange((prev) =>
        prev.map((f) =>
          f.id === fId
            ? {
              ...f,
              options: [
                ...(f.options ?? ["Opsi 1"]),
                `Opsi ${(f.options?.length ?? 0) + 1}`,
              ],
            }
            : f,
        ),
      );
    },
    [handleFieldsChange],
  );

  const updateOption = useCallback(
    (fId: string, idx: number, val: string) => {
      handleFieldsChange((prev) =>
        prev.map((f) =>
          f.id === fId && f.options
            ? {
              ...f,
              options: f.options.map((o, i) => (i === idx ? val : o)),
            }
            : f,
        ),
      );
    },
    [handleFieldsChange],
  );

  const removeOption = useCallback(
    (fId: string, idx: number) => {
      handleFieldsChange((prev) =>
        prev.map((f) =>
          f.id === fId && f.options
            ? {
              ...f,
              options: f.options.filter((_, i) => i !== idx),
            }
            : f,
        ),
      );
    },
    [handleFieldsChange],
  );

  const handleTypeChange = useCallback(
    (id: string, type: FieldType) => {
      handleFieldsChange((prev) =>
        prev.map((f) =>
          f.id === id
            ? {
              ...f,
              type,
              options: ["MULTIPLE_CHOICE", "CHECKBOX", "DROPDOWN"].includes(type)
                ? f.options?.length
                  ? f.options
                  : ["Opsi 1"]
                : undefined,
            }
            : f,
        ),
      );
    },
    [handleFieldsChange],
  );

  if (!isControlled && isLoading) {
    return (
      <div className="bg-white px-4 py-6 sm:px-8 sm:py-8 animate-pulse">
        <div className="flex justify-between items-center mb-3">
          <Skeleton className="h-6 w-56" />
        </div>
        <div className="max-w-4xl w-full items-center mx-auto">
          <div className="py-4 pb-8">
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-lg border border-slate-800 bg-white p-3.5 sm:gap-4 sm:p-5"
                >
                  <Skeleton className="size-6 rounded" />
                  <div className="flex-1 space-y-3 sm:space-y-4">
                    <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center md:gap-4">
                      <div className="w-full flex-1 md:max-w-[60%] pb-1.5">
                        <Skeleton className="h-8 w-full rounded" />
                      </div>
                      <div className="flex items-center gap-3 w-full md:w-auto">
                        <Skeleton className="h-8 w-36 rounded" />
                        <Skeleton className="size-8 rounded" />
                      </div>
                    </div>
                    <div className="pt-1">
                      <Skeleton className="mb-2 h-4 w-24" />
                      <Skeleton className="h-6 w-48 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Skeleton className="h-[46px] w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white px-4 py-6 sm:px-8 sm:py-8">
      <SectionHeader title="Kustomisasi Isian Form">
        <div className="text-xs font-medium">
          {saveMutation.isPending ? (
            <span className="flex items-center gap-1.5 text-slate-400">
              <CircleNotchIcon className="size-4 animate-spin" />
              Menyimpan...
            </span>
          ) : saveMutation.isSuccess ? (
            <span className="flex items-center gap-1.5 text-emerald-500">
              <CheckCircleIcon className="size-4" weight="fill" />
              Tersimpan
            </span>
          ) : null}
        </div>
      </SectionHeader>

      <div className="max-w-4xl w-full items-center mx-auto">
        <div className="py-4 pb-8">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={fields.map((f) => f.id)}
              strategy={verticalListSortingStrategy}
            >
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
          <ButtonSave
            label="Tambah Field"
            icon={PlusIcon}
            weight="bold"
            onClick={addField}
            className="w-full justify-center"
          />
        </div>
      </div>
    </div>
  );
}
