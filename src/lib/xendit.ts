import { env } from "~/env";

const XENDIT_BASE_URL = "https://api.xendit.co";

const headers = {
  "Content-Type": "application/json",
  Authorization: `Basic ${Buffer.from(env.XENDIT_SECRET_KEY + ":").toString("base64")}`,
};

type CreateInvoiceParams = {
  externalId: string;
  amount: number;
  payerEmail: string;
  description: string;
  paymentMethods?: string[];
  successRedirectUrl?: string;
  failureRedirectUrl?: string;
};

type XenditInvoice = {
  id: string;
  invoice_url: string;
  status: string;
  external_id: string;
  amount: number;
};

type CreatePayoutParams = {
  referenceId: string;
  amount: number;
  channelCode: string;
  accountNumber: string;
  accountHolderName: string;
  description: string;
};

type XenditPayout = {
  id: string;
  amount: number;
  channel_code: string;
  currency: string;
  description: string;
  reference_id: string;
  status: string;
  failure_code?: string;
};

export async function createInvoice(
  params: CreateInvoiceParams,
): Promise<XenditInvoice> {
  const res = await fetch(`${XENDIT_BASE_URL}/v2/invoices`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      external_id: params.externalId,
      amount: params.amount,
      payer_email: params.payerEmail,
      description: params.description,
      payment_methods: params.paymentMethods,
      success_redirect_url: params.successRedirectUrl,
      failure_redirect_url: params.failureRedirectUrl,
      currency: "IDR",
    }),
  });

  if (!res.ok) {
    const err = (await res.json()) as { message?: string };
    throw new Error(err.message ?? "Gagal membuat invoice Xendit");
  }

  return res.json() as Promise<XenditInvoice>;
}

export async function createPayout(
  params: CreatePayoutParams,
): Promise<XenditPayout> {
  const res = await fetch(`${XENDIT_BASE_URL}/v2/payouts`, {
    method: "POST",
    headers: {
      ...headers,
      "Idempotency-key": params.referenceId,
    },
    body: JSON.stringify({
      reference_id: params.referenceId,
      channel_code: params.channelCode,
      channel_properties: {
        account_number: params.accountNumber,
        account_holder_name: params.accountHolderName,
      },
      amount: params.amount,
      description: params.description,
      currency: "IDR",
    }),
  });

  if (!res.ok) {
    const err = (await res.json()) as { message?: string };
    throw new Error(err.message ?? "Gagal membuat payout Xendit");
  }

  return res.json() as Promise<XenditPayout>;
}
