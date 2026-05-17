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
import { useEffect, useState, useRef, type CSSProperties } from "react";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import ButtonSave from "~/components/ui/button-save";
import { Skeleton } from "~/components/ui/skeleton";
import { useDebounce } from "~/hooks/use-debounce";
import { SectionHeader } from "~/components/ui/form-layout";

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
      {/* HANDLE DRAG (Pindahkan listeners ke sini) */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab rounded p-1 text-blue-300 hover:bg-slate-100 active:cursor-grabbing"
      >
        <DotsSixVerticalIcon className="h-6 w-6 text-slate-400" />
      </div>

      <div className="flex-1 space-y-3 sm:space-y-4">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center md:gap-4">
          <div className="w-full flex-1 border-b border-slate-300 md:max-w-[60%]">
            <input
              type="text"
              placeholder="Masukkan Pertanyaan"
              value={field.label}
              onChange={(e) => updateField(field.id, { label: e.target.value })}
              className="w-full bg-transparent py-1.5 text-[15px] font-medium text-slate-700 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="group relative flex-1 md:flex-initial">
              <select
                value={field.type}
                onChange={(e) => {
                  const value = e.target.value;
                  handleTypeChange(field.id, value as FieldType);
                }}
                className="w-full cursor-pointer appearance-none rounded-md border border-slate-300 bg-white py-1.5 pr-9 pl-3 text-[14px] sm:text-[15px] font-medium text-slate-600 transition-colors hover:border-slate-400 focus:outline-none"
              >
                {Object.entries(FIELD_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 transition-colors group-hover:text-slate-600">
                <CaretDownIcon className="h-4 w-4" weight="bold" />
              </div>
            </div>
            <button
              onClick={() => removeField(field.id)}
              className="cursor-pointer p-2 rounded-md hover:bg-red-50 text-red-500 hover:text-red-700 transition-colors shrink-0"
            >
              <TrashIcon className="h-5 w-5" />
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
                <div key={index} className="flex items-center gap-3">
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
                      onClick={() => removeOption(field.id, index)}
                      className="cursor-pointer p-1.5 text-slate-400 hover:bg-slate-100 hover:text-red-500 rounded-md transition-colors shrink-0"
                    >
                      <XIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
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
            <div className="peer h-6 w-11 rounded-full bg-slate-200 peer-checked:bg-[#00B4D8] after:absolute after:top-0.5 after:left-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full"></div>
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

  const [fields, setFields] = useState<FormField[]>(value ?? []);
  const [hasLoaded, setHasLoaded] = useState(isControlled);
  const lastSavedRef = useRef<string>("");
  const isSavingRef = useRef(false); // ← tambah ini di atas, sejajar lastSavedRef

  // Sync controlled value if provided
  useEffect(() => {
    if (isControlled && value) {
      setFields(value);
    }
  }, [value, isControlled]);

  // Setup Sensors
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
  }, [savedFields, hasLoaded, productId, isControlled]);

  const debouncedFields = useDebounce(fields, 1000);

  useEffect(() => {
    if (isControlled || !hasLoaded) return;
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

    const payload = { productId: productId ?? "", fields: fieldsPayload };
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
  }, [debouncedFields, productId, hasLoaded, isControlled]);

  const handleFieldsChange = (updater: FormField[] | ((prev: FormField[]) => FormField[])) => {
    let nextFields: FormField[];
    if (typeof updater === "function") {
      nextFields = updater(fields);
    } else {
      nextFields = updater;
    }

    if (isControlled) {
      onChange(nextFields);
    } else {
      setFields(nextFields);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      handleFieldsChange((items) => {
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
      required: false,
    };
    handleFieldsChange((prev) => [...prev, newField]);
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    handleFieldsChange((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    );
  };

  const removeField = (id: string) => {
    handleFieldsChange((prev) => prev.filter((f) => f.id !== id));
  };

  const addOption = (fId: string) => {
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
  };

  const updateOption = (fId: string, idx: number, val: string) => {
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
  };

  const removeOption = (fId: string, idx: number) => {
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
  };

  const handleTypeChange = (id: string, type: FieldType) => {
    handleFieldsChange((prev) =>
      prev.map((f) =>
        f.id === id
          ? {
            ...f,
            type,
            options: ["MULTIPLE_CHOICE", "CHECKBOX", "DROPDOWN"].includes(
              type,
            )
              ? f.options?.length
                ? f.options
                : ["Opsi 1"]
              : undefined,
          }
          : f,
      ),
    );
  };

  if (!isControlled && isLoading) {
    return (
      <div className="animate-pulse rounded-b-xl border border-slate-200 bg-[#f0f9fa] p-4 md:p-6">
        <div className="max-w-3xl w-full flex justify-center items-center">
          <Skeleton className="mb-2 h-6 w-48" />
          <div className="mb-6 h-0.5 w-full bg-[#00B4D8] opacity-20"></div>

          <div className="mb-6 space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="flex gap-4 rounded-lg border border-slate-200 bg-white p-5"
              >
                <Skeleton className="mt-6 h-4.5 w-4.5" />

                <div className="flex-1 space-y-4">
                  <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-4 md:flex-row md:items-center">
                    <Skeleton className="h-10 flex-1 md:max-w-[60%]" />
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-10 w-32 rounded-md" />
                      <Skeleton className="h-6 w-6 rounded-md" />
                    </div>
                  </div>

                  <div className="pt-2">
                    <Skeleton className="mb-4 h-4 w-24" />
                    <Skeleton className="h-6 w-48 border-b border-slate-100 pb-2" />
                  </div>
                </div>
              </div>
            ))}
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
              <CircleNotchIcon className="h-4 w-4 animate-spin" />
              Menyimpan...
            </span>
          ) : saveMutation.isSuccess ? (
            <span className="flex items-center gap-1.5 text-emerald-500">
              <CheckCircleIcon className="h-4 w-4" weight="fill" />
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
