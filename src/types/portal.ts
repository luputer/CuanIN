import { type ProductType } from "../../prisma/generated/prisma";

export type TabType = "ALL" | "DIGITAL_PRODUCT" | "WEBINAR" | "KELAS_ONLINE";

export interface PortalPurchaseType {
  id: string;
  createdAt: Date | string;
  amount: number | string | { toNumber: () => number };
  status: string;
  buyerEmail: string;
  buyerName: string;
  buyerPhone: string;
  paidAt: Date | string | null;
  paymentMethod: string | null;
  paymentDetails: any;
  voucher?: {
    id: string;
    code: string;
    discount: number | string | { toNumber: () => number };
    type: string;
  } | null;
  product: {
    id: string;
    name: string;
    image: string | null;
    type: ProductType;
    slug: string | null;
    link: string | null;
    links: any;
    notes: string | null;
    price: number | string | { toNumber: () => number };
    discountPrice?: number | string | { toNumber: () => number } | null;
    contentType: string | null;
    startDate: Date | null;
    endDate: Date | null;
    duration: string | null;
    user: {
      name: string | null;
      catalog: {
        slug: string;
      } | null;
    };
  };
}
