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

export type FormFieldData = {
  id: string;
  label: string;
  type: string;
  options: unknown;
  required: boolean;
  order: number;
};

export type CheckoutFormValues = {
  name: string;
  email: string;
  phone: string;
  promo?: string;
  custom?: Record<string, string>;
};

export type AppliedVoucher = {
  id: string;
  code: string;
  name: string;
  type: "PERSEN" | "NOMINAL";
  discount: number;
};
