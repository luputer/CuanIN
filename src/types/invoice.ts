export type PaymentDetails = {
  paymentType?: string;
  bank?: string;
  vaNumber?: string;
} | null;

export type InvoiceData = {
  id: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  amount: number | string | { toNumber: () => number };
  paidAt: Date | string | null;
  createdAt: Date | string;
  paymentMethod: string | null;
  paymentDetails: unknown;
  voucher?: {
    id: string;
    code: string;
    discount: number | string | { toNumber: () => number };
    type: string;
  } | null;
  product: {
    name: string;
    type: string;
    price: number | string | { toNumber: () => number };
    discountPrice?: number | string | { toNumber: () => number } | null;
    user: {
      name: string | null;
      catalog: { slug: string } | null;
    };
  };
};
