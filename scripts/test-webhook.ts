import { db } from "../src/server/db";

async function testWithdrawalWebhook() {
  const withdrawal = await db.withdrawal.findFirst({
    orderBy: { createdAt: "desc" },
  });

  if (!withdrawal) {
    console.log("No withdrawal found");
    process.exit(1);
  }

  const webhookPayload = {
    event: "payout.succeeded",
    data: {
      id: withdrawal.xenditPayoutId || "mock_id",
      reference_id: withdrawal.id,
      status: "SUCCEEDED",
      failure_code: null,
    },
  };

  const webhookUrl = "https://cuanin-dev.vercel.app/api/webhooks/xendit";
  const token = process.env.XENDIT_WEBHOOK_TOKEN;

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-callback-token": token || "",
    },
    body: JSON.stringify(webhookPayload),
  });

  const result = await response.json();
  console.log("Status:", response.status);
  console.log("Result:", result);
  process.exit(0);
}

testWithdrawalWebhook();
