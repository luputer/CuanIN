import { type NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { sendProductEmail } from "~/lib/nodemailer";
import { env } from "~/env";

export async function POST(req: NextRequest) {
    // Verifikasi token dari Xendit
    const token = req.headers.get("x-callback-token");
    if (token !== env.XENDIT_WEBHOOK_TOKEN) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json() as {
        external_id: string;
        status: string;
        payment_method?: string;
        id: string;
    };

    if (body.status !== "PAID") {
        return NextResponse.json({ message: "Ignored" });
    }

    const purchase = await db.purchase.findUnique({
        where: { id: body.external_id },
        include: {
            product: { select: { name: true, link: true } },
        },
    });

    if (!purchase) {
        return NextResponse.json({ message: "Purchase not found" }, { status: 404 });
    }

    // Update status purchase
    await db.purchase.update({
        where: { id: purchase.id },
        data: {
            status: "completed",
            xenditPaymentMethod: body.payment_method,
            paidAt: new Date(),
        },
    });

    // Kirim email produk ke buyer
    if (purchase.product.link) {
        void sendProductEmail({
            buyerEmail: purchase.buyerEmail,
            productName: purchase.product.name,
            productLink: purchase.product.link,
        });
    }

    return NextResponse.json({ message: "OK" });
}