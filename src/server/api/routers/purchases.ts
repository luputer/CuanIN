import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { sendProductEmail } from "../../../lib/nodemailer";
import { env } from "~/env";
import { createInvoice as createXenditInvoice } from "~/lib/xendit";
import { createSnapTransaction } from "~/lib/midtrans";
import { calculatePaymentFee } from "~/lib/utils";
import { Prisma, WithdrawalStatus } from "../../../../prisma/generated/prisma";
import { getCreatorBalance } from "~/lib/balance";

const XENDIT_PAYMENT_METHODS = {
  qris: "QRIS",
  shopeepay: "SHOPEEPAY",
  dana: "DANA",
  ovo: "OVO",
  bca: "BCA",
  bni: "BNI",
  bri: "BRI",
  mandiri: "MANDIRI",
  bsi: "BSI",
  permata: "PERMATA",
  alfamart: "ALFAMART",
  cc: "CREDIT_CARD",
} as const;

export const purchasesRouter = createTRPCRouter({
  // ─── CREATE PURCHASE ────────────────────────────────────────────────────────
  create: publicProcedure
    .input(
      z.object({
        productId: z.string(),
        buyerName: z.string().min(1, "Nama wajib diisi"),
        buyerEmail: z.string().email("Email tidak valid"),
        buyerPhone: z.string().min(1, "Nomor telepon wajib diisi"),
        promoCode: z.string().optional(),
        answers: z
          .array(
            z.object({
              formFieldId: z.string(),
              answer: z.string(),
            }),
          )
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const product = await ctx.db.product.findUnique({
        where: { id: input.productId, status: "published" },
        select: {
          id: true,
          name: true,
          price: true,
          discountPrice: true,
          link: true,
          notes: true,
          userId: true,
          capacity: true,
          user: {
            select: { name: true },
          },
          _count: {
            select: {
              purchases: {
                where: { status: "completed" },
              },
            },
          },
        },
      });

      if (!product)
        throw new Error("Produk tidak ditemukan atau tidak tersedia");

      if (
        product.capacity &&
        product.capacity > 0 &&
        product._count.purchases >= product.capacity
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Maaf, kuota sudah penuh.",
        });
      }

      if (ctx.session?.user.id === product.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Kamu tidak bisa membeli produk milik sendiri.",
        });
      }

      const basePrice = Number(product.price);
      const discountPrice = product.discountPrice != null ? Number(product.discountPrice) : null;
      let finalPrice = discountPrice != null && discountPrice > 0 && discountPrice < basePrice ? discountPrice : basePrice;
      let voucherId: string | undefined = undefined;

      if (input.promoCode) {
        const now = new Date();
        const voucher = await ctx.db.voucher.findUnique({
          where: { code: input.promoCode },
          include: {
            products: {
              select: { id: true }
            }
          }
        });

        if (!voucher) {
          throw new Error("Kode voucher tidak valid atau tidak ditemukan");
        }

        if (voucher.status !== "aktif") {
          throw new Error("Voucher tidak aktif");
        }

        const adjustedStartDate = new Date(voucher.startDate);
        adjustedStartDate.setUTCHours(0, 0, 0, 0);

        const adjustedEndDate = new Date(voucher.endDate);
        adjustedEndDate.setUTCHours(23, 59, 59, 999);

        if (now < adjustedStartDate || now > adjustedEndDate) {
          throw new Error("Voucher sudah kedaluwarsa atau belum berlaku");
        }

        if (voucher.usageType === "SELECTED_PRODUCTS") {
          const isLinked = voucher.products.some(p => p.id === product.id);
          if (!isLinked) {
            throw new Error("Voucher tidak berlaku untuk produk ini");
          }
        }

        if (voucher.usageLimit !== null && voucher.usageLimit !== undefined) {
          const usageCount = await ctx.db.purchase.count({
            where: {
              voucherId: voucher.id,
              status: { in: ["completed", "pending"] },
            },
          });
          if (usageCount >= voucher.usageLimit) {
            throw new Error("Kuota penggunaan voucher ini sudah habis");
          }
        }

        if (voucher.isLimitPerUser) {
          if (!input.buyerEmail) {
            throw new Error("Silakan isi form Email terlebih dahulu untuk memvalidasi voucher ini");
          }

          const userUsageCount = await ctx.db.purchase.count({
            where: {
              voucherId: voucher.id,
              buyerEmail: {
                equals: input.buyerEmail,
                mode: "insensitive",
              },
              status: { in: ["completed", "pending"] },
            },
          });

          if (userUsageCount > 0) {
            throw new Error("Email ini sudah pernah menggunakan kode voucher ini");
          }
        }

        const discountVal = Number(voucher.discount);
        let discountAmount = 0;
        if (voucher.type === "PERSEN") {
          discountAmount = (finalPrice * discountVal) / 100;
        } else {
          discountAmount = discountVal;
        }

        finalPrice = Math.max(0, finalPrice - discountAmount);
        voucherId = voucher.id;
      }

      // Produk gratis (atau menjadi gratis setelah diskon) → langsung completed + kredit ledger creator
      if (finalPrice === 0) {
        const purchaseResult = await ctx.db.$transaction(async (tx) => {
          const newPurchase = await tx.purchase.create({
            data: {
              productId: input.productId,
              buyerName: input.buyerName,
              buyerEmail: input.buyerEmail,
              buyerPhone: input.buyerPhone,
              amount: 0,
              status: "completed",
              voucherId: voucherId,
            },
          });

          if (input.answers?.length) {
            await tx.formAnswer.createMany({
              data: input.answers.map((a) => ({
                purchaseId: newPurchase.id,
                formFieldId: a.formFieldId,
                answer: a.answer,
              })),
            });
          }

          if (ctx.session?.user.id) {
            await tx.user.update({
              where: { id: ctx.session.user.id },
              data: { phoneNumber: input.buyerPhone },
            });
          }

          // Produk gratis: kredit Rp 0 ke ledger (untuk audit trail tetap ada)
          await tx.balanceEntry.create({
            data: {
              userId: product.userId,
              amount: 0,
              type: "PURCHASE_COMPLETED",
              refId: newPurchase.id,
              note: `Produk gratis — ${input.buyerName}`,
            },
          });

          return newPurchase;
        });

        if (product.link) {
          void sendProductEmail({
            buyerEmail: input.buyerEmail,
            productName: product.name,
            productLink: product.link,
            creatorName: product.user?.name ?? "Tim CuanIN",
            notes: product.notes,
          });
        }

        return { status: "free", purchase: purchaseResult };
      }

      // Produk berbayar → buat purchase pending (kredit ledger di webhook)
      const purchaseResult = await ctx.db.$transaction(async (tx) => {
        const newPurchase = await tx.purchase.create({
          data: {
            productId: input.productId,
            buyerName: input.buyerName,
            buyerEmail: input.buyerEmail,
            buyerPhone: input.buyerPhone,
            amount: finalPrice,
            status: "pending",
            voucherId: voucherId,
          },
        });

        if (input.answers?.length) {
          await tx.formAnswer.createMany({
            data: input.answers.map((a) => ({
              purchaseId: newPurchase.id,
              formFieldId: a.formFieldId,
              answer: a.answer,
            })),
          });
        }

        if (ctx.session?.user.id) {
          await tx.user.update({
            where: { id: ctx.session.user.id },
            data: { phoneNumber: input.buyerPhone },
          });
        }

        return newPurchase;
      });

      return { status: "pending", purchase: purchaseResult };
    }),

  // ─── CREATE PAYMENT INVOICE ─────────────────────────────────────────────────
  createPaymentInvoice: publicProcedure
    .input(
      z.object({
        purchaseId: z.string(),
        paymentMethod: z.enum([
          "qris",
          "shopeepay",
          "dana",
          "ovo",
          "bca",
          "bni",
          "bri",
          "mandiri",
          "bsi",
          "permata",
          "alfamart",
          "cc",
        ]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const purchase = await ctx.db.purchase.findUnique({
        where: { id: input.purchaseId },
        include: {
          product: {
            select: { name: true },
          },
        },
      });

      if (!purchase) throw new Error("Transaksi tidak ditemukan");
      if (purchase.status === "completed")
        throw new Error("Transaksi sudah dibayar");
      if (Number(purchase.amount) <= 0)
        throw new Error("Transaksi gratis tidak membutuhkan pembayaran");

      // Return existing invoice jika metode sama
      if (
        purchase.xenditInvoiceUrl &&
        purchase.xenditPaymentMethod ===
        XENDIT_PAYMENT_METHODS[input.paymentMethod]
      ) {
        return {
          invoiceUrl: purchase.xenditInvoiceUrl,
          xenditInvoiceId: purchase.xenditInvoiceId,
        };
      }

      // Return existing invoice jika sudah ada (metode berbeda, tapi invoice sudah dibuat)
      if (purchase.xenditInvoiceUrl && purchase.xenditPaymentMethod) {
        return {
          invoiceUrl: purchase.xenditInvoiceUrl,
          xenditInvoiceId: purchase.xenditInvoiceId,
        };
      }

      const xenditPaymentMethod = XENDIT_PAYMENT_METHODS[input.paymentMethod];
      const baseAmount = Number(purchase.amount);
      const fee = calculatePaymentFee(input.paymentMethod, baseAmount);
      const totalAmount = baseAmount + fee;

      const invoice = await createXenditInvoice({
        externalId: `${purchase.id}__${input.paymentMethod}__${Date.now()}`,
        amount: totalAmount,
        payerEmail: purchase.buyerEmail,
        description: `Pembelian ${purchase.product.name}`,
        paymentMethods: [xenditPaymentMethod],
        successRedirectUrl: `${env.NEXT_PUBLIC_APP_URL}/payment/success?id=${purchase.id}`,
        failureRedirectUrl: `${env.NEXT_PUBLIC_APP_URL}/payment/failed?id=${purchase.id}`,
        fees: fee > 0 ? [{ type: "Biaya Layanan", value: fee }] : undefined,
      });

      await ctx.db.purchase.update({
        where: { id: purchase.id },
        data: {
          xenditInvoiceId: invoice.id,
          xenditInvoiceUrl: invoice.invoice_url,
          xenditPaymentMethod,
        },
      });

      return { invoiceUrl: invoice.invoice_url, xenditInvoiceId: invoice.id };
    }),

  // ─── CREATE MIDTRANS TRANSACTION ────────────────────────────────────────────
  createMidtransTransaction: publicProcedure
    .input(z.object({ purchaseId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const purchase = await ctx.db.purchase.findUnique({
        where: { id: input.purchaseId },
        include: {
          product: {
            select: { name: true },
          },
        },
      });

      if (!purchase) throw new Error("Transaksi tidak ditemukan");
      if (purchase.status === "completed")
        throw new Error("Transaksi sudah dibayar");
      if (Number(purchase.amount) <= 0)
        throw new Error("Transaksi gratis tidak membutuhkan pembayaran");

      const baseAmount = Number(purchase.amount);
      const fee = calculatePaymentFee("midtrans", baseAmount);
      const totalAmount = baseAmount + fee;

      // Midtrans order_id max length is 50 chars. purchase.id is 36 chars.
      const orderId = `${purchase.id}_${Date.now().toString(36)}`;

      const transaction = await createSnapTransaction({
        orderId,
        amount: totalAmount,
        itemDetails: [
          {
            id: purchase.productId,
            name: purchase.product.name.slice(0, 50),
            price: baseAmount,
            quantity: 1,
          },
          ...(fee > 0
            ? [
              {
                id: "fee",
                name: "Biaya Layanan",
                price: fee,
                quantity: 1,
              },
            ]
            : []),
        ],
        customerDetails: {
          firstName: purchase.buyerName,
          email: purchase.buyerEmail,
          phone: purchase.buyerPhone,
        },
      });

      return {
        token: transaction.token,
        redirectUrl: transaction.redirect_url,
      };
    }),

  // ─── GET BY PRODUCT ID ──────────────────────────────────────────────────────
  getByProductId: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(7),
        search: z.string().optional(),
        status: z.string().optional().default("ALL"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const product = await ctx.db.product.findUnique({
        where: { id: input.productId, userId: ctx.session.user.id },
        select: { id: true },
      });
      if (!product)
        throw new Error("Produk tidak ditemukan atau bukan milikmu");

      const page = input.page;
      const limit = input.limit;
      const skip = (page - 1) * limit;

      const where = {
        productId: input.productId,
        ...(input.search
          ? {
            buyerName: {
              contains: input.search,
              mode: "insensitive" as const,
            },
          }
          : {}),
        ...(input.status && input.status !== "ALL"
          ? { status: input.status }
          : {}),
      };

      const [items, total] = await Promise.all([
        ctx.db.purchase.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        ctx.db.purchase.count({ where }),
      ]);

      return {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }),

  // ─── GET BY ID ──────────────────────────────────────────────────────────────
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const purchase = await ctx.db.purchase.findUnique({
        where: { id: input.id },
        include: {
          product: {
            select: {
              name: true,
              image: true,
              type: true,
              price: true,
              slug: true,
              user: {
                select: {
                  name: true,
                  image: true,
                  catalog: {
                    select: { slug: true },
                  },
                },
              },
            },
          },
        },
      });

      if (!purchase) throw new Error("Transaksi tidak ditemukan");

      return purchase;
    }),

  // ─── GET DETAIL (creator dashboard) ────────────────────────────────────────
  getDetail: protectedProcedure
    .input(z.object({ purchaseId: z.string() }))
    .query(async ({ ctx, input }) => {
      const purchase = await ctx.db.purchase.findUnique({
        where: { id: input.purchaseId },
        include: {
          product: {
            select: { userId: true },
          },
          answers: {
            include: {
              formField: {
                select: { label: true, type: true },
              },
            },
          },
        },
      });

      if (!purchase) throw new Error("Data pembelian tidak ditemukan");
      if (purchase.product.userId !== ctx.session.user.id) {
        throw new Error("Kamu tidak memiliki akses ke data ini");
      }

      return purchase;
    }),

  // ─── COUNT BY PRODUCT ID ────────────────────────────────────────────────────
  countByProductId: protectedProcedure
    .input(z.object({ productId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.purchase.count({
        where: { productId: input.productId },
      });
    }),

  // ─── BATCH COUNT BY PRODUCT IDS ────────────────────────────────────────────
  countByProductIds: protectedProcedure
    .input(z.object({ productIds: z.array(z.string()) }))
    .query(async ({ ctx, input }) => {
      const counts = await ctx.db.purchase.groupBy({
        by: ["productId"],
        where: { productId: { in: input.productIds } },
        _count: { id: true },
      });

      const countMap: Record<string, number> = {};
      for (const c of counts) {
        countMap[c.productId] = c._count.id;
      }
      return countMap;
    }),

  // ─── GET ALL PARTICIPANTS ───────────────────────────────────────────────────
  getAllParticipants: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        search: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.limit;

      const products = await ctx.db.product.findMany({
        where: { userId: ctx.session.user.id },
        select: { id: true },
      });
      const productIds = products.map((p) => p.id);

      if (productIds.length === 0) {
        return {
          items: [],
          total: 0,
          page: input.page,
          limit: input.limit,
          totalPages: 0,
        };
      }

      const whereClause = {
        productId: { in: productIds },
        ...(input.search
          ? {
            OR: [
              {
                buyerName: {
                  contains: input.search,
                  mode: "insensitive" as const,
                },
              },
              {
                buyerEmail: {
                  contains: input.search,
                  mode: "insensitive" as const,
                },
              },
            ],
          }
          : {}),
      };

      // 1. Group by email untuk mendapatkan total transaksi dan jumlah produk
      const grouped = await ctx.db.purchase.groupBy({
        by: ["buyerEmail"],
        where: whereClause,
        _count: { id: true },
        _sum: { amount: true },
      });

      // 2. Ambil data transaksi terbaru dari tiap email untuk mendapatkan Nama & No HP terbaru
      const latestPurchases = await ctx.db.purchase.findMany({
        where: whereClause,
        distinct: ["buyerEmail"],
        orderBy: { createdAt: "desc" },
        select: {
          buyerEmail: true,
          buyerName: true,
          buyerPhone: true,
        },
      });

      // 3. Buat dictionary untuk mapping profil
      const profileMap = new Map<string, { name: string; phone: string | null }>();
      for (const p of latestPurchases) {
        profileMap.set(p.buyerEmail, { name: p.buyerName, phone: p.buyerPhone });
      }

      // 4. Gabungkan data
      const combined = grouped.map((g) => ({
        email: g.buyerEmail,
        name: profileMap.get(g.buyerEmail)?.name || "Unknown",
        phone: profileMap.get(g.buyerEmail)?.phone || null,
        productsBought: g._count.id,
        totalTransaction: Number(g._sum.amount ?? 0),
      }));

      // 5. Urutkan berdasarkan nama secara alfabetis
      combined.sort((a, b) => a.name.localeCompare(b.name));

      const total = combined.length;
      const paginatedItems = combined.slice(
        skip,
        skip + input.limit,
      );

      return {
        items: paginatedItems,
        total,
        page: input.page,
        limit: input.limit,
        totalPages: Math.ceil(total / input.limit),
      };
    }),

  // ─── GET ALL FOR CREATOR (dashboard utama) ─────────────────────────────────
  // Balance sekarang dari ledger via getCreatorBalance
  getAllForCreator: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(7),
        search: z.string().optional(),
        status: z.string().optional().default("ALL"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const page = input.page;
      const limit = input.limit;
      const skip = (page - 1) * limit;
      const userId = ctx.session.user.id;

      // 1. Ambil ID produk milik kreator
      const products = await ctx.db.product.findMany({
        where: { userId },
        select: { id: true },
      });
      const productIds = products.map((p) => p.id);

      // 2. Query Purchases
      const purchaseWhere = {
        productId: { in: productIds },
        ...(input.search
          ? {
            OR: [
              { buyerName: { contains: input.search, mode: "insensitive" as const } },
              { product: { name: { contains: input.search, mode: "insensitive" as const } } },
              { id: { contains: input.search, mode: "insensitive" as const } },
            ],
          }
          : {}),
        ...(input.status && input.status !== "ALL" ? { status: input.status } : {}),
      };

      // 3. Query Withdrawals
      const withdrawalWhere: Prisma.WithdrawalWhereInput = {
        userId,
        ...(input.search
          ? {
            OR: [
              { id: { contains: input.search, mode: "insensitive" as const } },
              { bankName: { contains: input.search, mode: "insensitive" as const } },
              { accountNumber: { contains: input.search, mode: "insensitive" as const } },
            ],
          }
          : {}),
      };

      if (input.status && input.status !== "ALL") {
        if (input.status === "completed") {
          withdrawalWhere.status = WithdrawalStatus.SUCCEEDED;
        } else if (input.status === "pending") {
          withdrawalWhere.status = { in: [WithdrawalStatus.PENDING, WithdrawalStatus.REQUESTED, WithdrawalStatus.ACCEPTED] };
        } else if (input.status === "failed") {
          withdrawalWhere.status = WithdrawalStatus.FAILED;
        } else if (input.status === "expired") {
          withdrawalWhere.status = WithdrawalStatus.CANCELLED;
        }
      }

      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

      const [
        purchases,
        withdrawals,
        purchaseCount,
        withdrawalCount,
        allTimePurchaseStats,
        currentPurchaseStats,
        previousPurchaseStats,
        { balance, totalIncome }
      ] = await Promise.all([
        ctx.db.purchase.findMany({
          where: purchaseWhere,
          include: { product: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
          take: skip + limit,
        }),
        ctx.db.withdrawal.findMany({
          where: withdrawalWhere,
          orderBy: { createdAt: "desc" },
          take: skip + limit,
        }),
        ctx.db.purchase.count({ where: purchaseWhere }),
        ctx.db.withdrawal.count({ where: withdrawalWhere }),
        ctx.db.purchase.aggregate({
          where: { productId: { in: productIds }, status: "completed" },
          _sum: { amount: true },
          _count: { id: true },
        }),
        ctx.db.purchase.aggregate({
          where: { productId: { in: productIds }, status: "completed", createdAt: { gte: thirtyDaysAgo } },
          _sum: { amount: true },
          _count: { id: true },
        }),
        ctx.db.purchase.aggregate({
          where: { productId: { in: productIds }, status: "completed", createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
          _sum: { amount: true },
          _count: { id: true },
        }),
        getCreatorBalance(ctx.db, userId),
      ]);

      // Gabungkan dan urutkan
      const unifiedItems = [
        ...purchases.map(p => ({ ...p, type: "INCOME" as const })),
        ...withdrawals.map(w => ({ ...w, type: "WITHDRAWAL" as const }))
      ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      const paginatedItems = unifiedItems.slice(skip, skip + limit);
      const total = purchaseCount + withdrawalCount;

      const calculateChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
      };

      return {
        items: paginatedItems,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        stats: {
          totalIncome,
          totalTransactions: allTimePurchaseStats._count.id,
          balance,
          incomeChange: calculateChange(
            Number(currentPurchaseStats._sum.amount ?? 0),
            Number(previousPurchaseStats._sum.amount ?? 0),
          ),
          transactionsChange: calculateChange(
            currentPurchaseStats._count.id,
            previousPurchaseStats._count.id,
          ),
        },
      };
    }),

  // ─── DELETE PURCHASE ────────────────────────────────────────────────────────
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const purchase = await ctx.db.purchase.findUnique({
        where: { id: input.id },
        include: { product: { select: { userId: true } } },
      });

      if (!purchase) throw new Error("Data pembeli tidak ditemukan");
      if (purchase.product.userId !== ctx.session.user.id) {
        throw new Error("Kamu tidak memiliki akses ke data ini");
      }

      await ctx.db.purchase.delete({ where: { id: input.id } });

      return { success: true };
    }),

  // ─── GET PARTICIPANT DETAIL ─────────────────────────────────────────────────
  getParticipantDetail: protectedProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ ctx, input }) => {
      const products = await ctx.db.product.findMany({
        where: { userId: ctx.session.user.id },
        select: { id: true },
      });
      const productIds = products.map((p) => p.id);

      if (productIds.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kamu belum memiliki produk",
        });
      }

      const purchases = await ctx.db.purchase.findMany({
        where: {
          buyerEmail: input.email,
          productId: { in: productIds },
        },
        include: {
          product: {
            select: { name: true, type: true, contentType: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      if (purchases.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Peserta tidak ditemukan",
        });
      }

      const latest = purchases[0]!;

      return {
        participant: {
          name: latest.buyerName,
          email: latest.buyerEmail,
          phone: latest.buyerPhone,
        },
        purchases,
      };
    }),
});
