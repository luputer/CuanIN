import midtransClient from "midtrans-client";
import { env } from "~/env";

// Initialize Midtrans Snap client
export const snap = new midtransClient.Snap({
  isProduction: env.NODE_ENV === "production",
  serverKey: env.MIDTRANS_SERVER_KEY ?? "",
  clientKey: env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? "",
});

type CreateSnapTransactionParams = {
  orderId: string;
  amount: number;
  itemDetails: {
    id: string;
    price: number;
    quantity: number;
    name: string;
  }[];
  customerDetails: {
    firstName: string;
    email: string;
    phone: string;
  };
};

export async function createSnapTransaction(params: CreateSnapTransactionParams) {
  const parameter = {
    transaction_details: {
      order_id: params.orderId,
      gross_amount: params.amount,
    },
    item_details: params.itemDetails.map((item) => ({
      id: item.id,
      price: item.price,
      quantity: item.quantity,
      name: item.name,
    })),
    customer_details: {
      first_name: params.customerDetails.firstName,
      email: params.customerDetails.email,
      phone: params.customerDetails.phone,
    },
    usage_limit: 1, // Limit usage to 1 to prevent multiple payments for same snap token
  };

  try {
    const transaction = await snap.createTransaction(parameter);
    return {
      token: transaction.token,
      redirect_url: transaction.redirect_url,
    };
  } catch (error) {
    console.error("Midtrans Snap Error:", error);
    throw new Error("Gagal membuat transaksi Midtrans");
  }
}
