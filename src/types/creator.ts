export type CreatorIncomeTransaction = {
  type: "INCOME";
  id: string;
  amount: number;
  buyerName: string;
  createdAt: Date;
  status: string;
  product: { name: string };
  paymentMethod?: string | null;
  paymentDetails?: {
    paymentType?: string;
    bank?: string;
    vaNumber?: string;
  } | null;
};

export type CreatorWithdrawalTransaction = {
  type: "WITHDRAWAL";
  id: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountHolderName?: string | null;
  createdAt: Date;
  status: string;
  feeAmount?: number | null;
};

export type CreatorTransactionType = CreatorIncomeTransaction | CreatorWithdrawalTransaction;
