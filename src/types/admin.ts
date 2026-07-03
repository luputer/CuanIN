export interface AdminCreatorType {
  id: string;
  name: string | null;
  email: string | null;
  phoneNumber: string | null;
  image: string | null;
  createdAt: Date | string;
  status: string;
  statusPayment: string;
  role: string;
  _count: {
    products: number;
  };
  catalog?: {
    slug: string;
  } | null;
}

export interface AdminProductType {
  id: string;
  slug: string | null;
  name: string;
  type: string;
  price: number | string | { toNumber: () => number };
  discountPrice: number | string | { toNumber: () => number } | null;
  status: string;
  userId: string;
  startDate: Date | string | null;
  endDate: Date | string | null;
  createdAt: Date | string;
  user?: {
    id?: string;
    name: string | null;
    image: string | null;
    email?: string | null;
    catalog?: {
      slug: string;
    } | null;
  } | null;
}

export interface AdminWithdrawalType {
  id: string;
  userId: string;
  amount: number | string | { toNumber: () => number };
  feeAmount: number | string | { toNumber: () => number } | null;
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  email: string;
  status: string;
  referenceId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  user?: {
    id: string;
    name: string | null;
    email: string | null;
    role?: string;
  } | null;
}
