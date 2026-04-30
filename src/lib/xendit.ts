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

export async function createInvoice(params: CreateInvoiceParams): Promise<XenditInvoice> {
    const res = await fetch(`${XENDIT_BASE_URL}/v2/invoices`, {
        method: "POST",
        headers,
        body: JSON.stringify({
            external_id: params.externalId,
            amount: params.amount,
            payer_email: params.payerEmail,
            description: params.description,
            success_redirect_url: params.successRedirectUrl,
            failure_redirect_url: params.failureRedirectUrl,
            currency: "IDR",
        }),
    });



    if (!res.ok) {
        const err = await res.json() as { message?: string };
        throw new Error(err.message ?? "Gagal membuat invoice Xendit");
    }

    return res.json() as Promise<XenditInvoice>;
}