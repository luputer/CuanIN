import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { sendProductEmail, sendPortalLinkEmail, sendPurchaseHistoryOtpEmail } from "../../../lib/email";
import { nanoid } from "nanoid";
import { env } from "~/env";
import { createSnapTransaction } from "~/lib/midtrans";
import { calculatePaymentFee } from "~/lib/utils";
import { Prisma, WithdrawalStatus } from "../../../../prisma/generated/prisma";
import { getCreatorBalance } from "~/lib/balance";
import { createNotification } from "~/lib/notification";
import { generateHistoryToken, verifyHistoryToken } from "~/lib/purchase-history-token";
import crypto from "crypto";
import { phoneSchema } from "~/lib/validation";
import {
  assertOtpOwnership,
  assertResendCooldown,
  clearOtpOwnership,
  setOtpOwnership,
  incrementResendCount,
} from "~/server/lib/otp-session";

export const purchasesRouter = createTRPCRouter({
  // ─── GET BY ID (public) ──────────────────────────────────────────────────────
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const purchase = await ctx.db.purchase.findUnique({
        where: { id: input.id },
        include: {
          product: {
            select: {
              userId: true,
              name: true,
              image: true,
              type: true,
              price: true,
              discountPrice: true,
              slug: true,
              contentType: true,
              startDate: true,
              endDate: true,
              duration: true,
              links: true,
              notes: true,
              portalEnabled: true,
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
          voucher: {
            select: { id: true, code: true, discount: true, type: true },
          },
        },
      });

      if (!purchase) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Transaksi tidak ditemukan",
        });
      }

      // Jika ada session, cek otorisasi tambahan
      if (ctx.session?.user) {
        // const isAdmin = ctx.session.user.role === "ADMIN";
        // const isOwner = purchase.product.userId === ctx.session.user.id;
        // const isBuyer = ctx.session.user.email === purchase.buyerEmail;

        // Otorisasi hanya berlaku jika user login tapi bukan pembeli/pemilik/admin
        // Namun untuk halaman pembayaran, pembeli anonim pun harus bisa lihat.
        // Jadi kita biarkan saja return purchase jika ditemukan.
      }

      return purchase;
    }),

  // ─── CREATE PURCHASE ────────────────────────────────────────────────────────
  create: publicProcedure
    .input(
      z.object({
        productId: z.string(),
        buyerName: z.string().min(1, "Nama wajib diisi"),
        buyerEmail: z.string().email("Email tidak valid"),
        buyerPhone: phoneSchema,
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
          links: true,
          notes: true,
          portalEnabled: true,
          userId: true,
          capacity: true,
          user: {
            select: {
              name: true,
              email: true,
              catalog: {
                select: { slug: true },
              },
            },
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

      if (
        (ctx.session?.user && ctx.session.user.id === product.userId) ||
        (input.buyerEmail && product.user?.email && input.buyerEmail.toLowerCase().trim() === product.user.email.toLowerCase().trim())
      ) {
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
        if (!input.buyerEmail) {
          throw new Error("Silakan isi Email terlebih dahulu untuk menggunakan voucher");
        }

        const voucher = await ctx.db.voucher.findFirst({
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

        if (!voucher.startDate || !voucher.endDate) {
          throw new Error("Tanggal voucher tidak valid");
        }

        // Bandingkan timestamp secara langsung
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const voucherStart = new Date(voucher.startDate);
        voucherStart.setHours(0, 0, 0, 0);

        const voucherEnd = new Date(voucher.endDate);
        voucherEnd.setHours(23, 59, 59, 999);

        if (now < voucherStart || now > voucherEnd) {
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
        let portalUrl: string | null = null;

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

          const buyerEmailLower = input.buyerEmail.toLowerCase();
          const existingUser = await tx.user.findUnique({
            where: { email: buyerEmailLower },
            select: { id: true, role: true },
          });

          if (existingUser) {
            await tx.user.update({
              where: { id: existingUser.id },
              data: {
                name: input.buyerName,
                phoneNumber: input.buyerPhone,
              },
            });
          } else {
            await tx.user.create({
              data: {
                email: buyerEmailLower,
                name: input.buyerName,
                phoneNumber: input.buyerPhone,
                role: "USER",
              },
            });
          }

          await tx.balanceEntry.create({
            data: {
              userId: product.userId,
              amount: 0,
              type: "PURCHASE_COMPLETED",
              refId: newPurchase.id,
              note: `Produk gratis — ${input.buyerName}`,
            },
          });

          // Point to new unified portal login page
          if (product.portalEnabled) {
            const portalToken = nanoid(16);
            const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
            await tx.portalAccess.upsert({
              where: {
                buyerEmail_creatorId: {
                  buyerEmail: input.buyerEmail,
                  creatorId: product.userId,
                },
              },
              update: { token: portalToken, expiresAt },
              create: {
                token: portalToken,
                buyerEmail: input.buyerEmail,
                creatorId: product.userId,
                expiresAt,
              },
            });
            portalUrl = `${env.NEXT_PUBLIC_APP_URL}/portal/login?token=${portalToken}`;
          }

          // Kirim notifikasi ke creator
          await createNotification(tx, {
            userId: product.userId,
            type: "PURCHASE",
            title: "Pembayaran Baru Diterima",
            message: `Ada pembelian produk gratis "${product.name}" oleh ${input.buyerName}.`,
            refId: newPurchase.id,
          });

          return newPurchase;
        });

        const productLinks = Array.isArray(product.links) ? (product.links as string[]) : [];
        const primaryLink = productLinks[0];
        if (primaryLink) {
          void sendProductEmail({
            buyerEmail: input.buyerEmail,
            productName: product.name,
            productLink: primaryLink,
            links: productLinks,
            creatorName: product.user?.name ?? "Tim CuanIN",
            notes: product.notes,
            portalUrl,
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

        const buyerEmailLower = input.buyerEmail.toLowerCase();
        const existingUser = await tx.user.findUnique({
          where: { email: buyerEmailLower },
          select: { id: true, role: true },
        });

        if (existingUser) {
          await tx.user.update({
            where: { id: existingUser.id },
            data: {
              name: input.buyerName,
              phoneNumber: input.buyerPhone,
            },
          });
        } else {
          await tx.user.create({
            data: {
              email: buyerEmailLower,
              name: input.buyerName,
              phoneNumber: input.buyerPhone,
              role: "USER",
            },
          });
        }

        return newPurchase;
      });

      return { status: "pending", purchase: purchaseResult };
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
        callbacks: {
          finish: `${env.NEXT_PUBLIC_APP_URL}/payment/success?id=${purchase.id}`,
          error: `${env.NEXT_PUBLIC_APP_URL}/payment/failed?id=${purchase.id}`,
          pending: `${env.NEXT_PUBLIC_APP_URL}/payment/pending?id=${purchase.id}`,
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

  // ─── EXPORT BUYERS ──────────────────────────────────────────────────────────
  exportBuyers: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
        search: z.string().optional(),
        status: z.string().optional().default("ALL"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const product = await ctx.db.product.findUnique({
        where: { id: input.productId, userId: ctx.session.user.id },
        select: {
          id: true,
          name: true,
          formFields: {
            select: { id: true, label: true },
            orderBy: { order: "asc" },
          }
        },
      });
      if (!product)
        throw new Error("Produk tidak ditemukan atau bukan milikmu");

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

      const items = await ctx.db.purchase.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          answers: {
            include: {
              formField: true,
            },
          },
        },
      });

      return {
        productName: product.name,
        formFields: product.formFields,
        items
      };
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
        type: z.enum(["INCOME", "WITHDRAWAL"]).optional(),
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
      const purchaseStatusMap: Record<string, string> = {
        SUCCEEDED: "completed",
        PENDING: "pending",
        FAILED: "failed",
        EXPIRED: "expired",
      };

      const purchaseWhere = {
        ...(input.type === "WITHDRAWAL"
          ? { id: "skip-all" }  // return 0 hasil
          : { productId: { in: productIds } }
        ),
        ...(input.search && input.type !== "WITHDRAWAL" ? {
          OR: [
            { buyerName: { contains: input.search, mode: "insensitive" as const } },
            { product: { name: { contains: input.search, mode: "insensitive" as const } } },
            { id: { contains: input.search, mode: "insensitive" as const } },
          ],
        } : {}),
        ...(input.status && input.status !== "ALL" ? { status: purchaseStatusMap[input.status] ?? input.status } : {}),
      };

      // 3. Query Withdrawals
      const withdrawalWhere: Prisma.WithdrawalWhereInput = {
        ...(input.type === "INCOME"
          ? { id: "skip-all" }  // return 0 hasil
          : { userId }
        ),
        ...(input.search && input.type !== "INCOME" ? {
          OR: [
            { id: { contains: input.search, mode: "insensitive" as const } },
            { bankName: { contains: input.search, mode: "insensitive" as const } },
            { accountNumber: { contains: input.search, mode: "insensitive" as const } },
          ],
        } : {}),
      };

      if (input.status && input.status !== "ALL") {
        if (input.status === "SUCCEEDED") {
          withdrawalWhere.status = WithdrawalStatus.SUCCEEDED;
        } else if (input.status === "PENDING") {
          withdrawalWhere.status = { in: [WithdrawalStatus.PENDING, WithdrawalStatus.REQUESTED, WithdrawalStatus.ACCEPTED] };
        } else if (input.status === "FAILED") {
          withdrawalWhere.status = WithdrawalStatus.FAILED;
        } else if (input.status === "EXPIRED") {
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

  getCreatorPortal: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ ctx, input }) => {
      const portalAccess = await ctx.db.portalAccess.findUnique({
        where: { token: input.token },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              image: true,
              catalog: {
                select: { slug: true },
              },
            },
          },
        },
      });

      if (!portalAccess) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Portal tidak ditemukan",
        });
      }

      if (new Date() > portalAccess.expiresAt) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Link portal sudah kedaluwarsa. Silakan minta link baru melalui email.",
        });
      }

      const purchases = await ctx.db.purchase.findMany({
        where: {
          buyerEmail: { equals: portalAccess.buyerEmail, mode: "insensitive" },
          status: "completed",
          product: {
            userId: portalAccess.creatorId,
            portalEnabled: true,
          },
        },
        select: {
          id: true,
          buyerName: true,
          buyerEmail: true,
          buyerPhone: true,
          amount: true,
          status: true,
          createdAt: true,
          paidAt: true,
          paymentMethod: true,
          paymentDetails: true,
          product: {
            select: {
              name: true,
              image: true,
              links: true,
              notes: true,
              contentType: true,
              type: true,
              price: true,
              discountPrice: true,
              user: {
                select: {
                  name: true,
                  catalog: {
                    select: { slug: true },
                  },
                },
              },
            },
          },
          voucher: {
            select: { id: true, code: true, discount: true, type: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      if (purchases.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tidak ada pembelian yang ditemukan",
        });
      }

      return {
        creator: {
          id: portalAccess.creator.id,
          name: portalAccess.creator.name,
          image: portalAccess.creator.image,
          slug: portalAccess.creator.catalog?.slug ?? null,
        },
        buyerEmail: portalAccess.buyerEmail,
        buyerName: purchases[0]!.buyerName,
        purchases,
      };
    }),

  requestCreatorPortalLink: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        creatorSlug: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const email = input.email.toLowerCase();

      const catalog = await ctx.db.catalog.findUnique({
        where: { slug: input.creatorSlug },
        include: {
          user: {
            select: { id: true, name: true },
          },
        },
      });

      if (!catalog) {
        return { success: true };
      }

      const purchases = await ctx.db.purchase.findMany({
        where: {
          buyerEmail: { equals: email, mode: "insensitive" },
          status: "completed",
          product: {
            userId: catalog.userId,
            portalEnabled: true,
          },
        },
        take: 1,
      });

      if (purchases.length === 0) {
        return { success: true };
      }

      const token = nanoid(16);
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await ctx.db.portalAccess.upsert({
        where: {
          buyerEmail_creatorId: {
            buyerEmail: email,
            creatorId: catalog.userId,
          },
        },
        update: { token, expiresAt },
        create: {
          token,
          buyerEmail: email,
          creatorId: catalog.userId,
          expiresAt,
        },
      });

      const portalUrl = `${env.NEXT_PUBLIC_APP_URL}/portal/login?token=${token}`;
      const buyerName = purchases[0]!.buyerName;

      void sendPortalLinkEmail({
        email,
        buyerName,
        creatorName: catalog.user.name ?? "Kreator",
        portalUrl,
      });

      return { success: true };
    }),

  // ─── SEND OTP RIWAYAT PEMBELIAN ──────────────────────────────────────────────
  sendPurchaseHistoryOtp: publicProcedure
    .input(z.object({ email: z.string().email("Format email tidak valid") }))
    .mutation(async ({ ctx, input }) => {
      // 1. Ambil IP dari header request
      // Ubah baris ini:
      const ip = (ctx.req?.headers.get("x-forwarded-for")?.split(",")[0] || "unknown").trim();
      const email = input.email.toLowerCase();

      // 2. RATE LIMIT BERBASIS IP (Mencegah ganti-ganti email dari 1 IP)
      // Cek apakah IP ini sudah membuat lebih dari 5 token dalam 10 menit terakhir
      const ipRequestCount = await ctx.db.verificationToken.count({
        where: {
          ipAddress: ip,
          expires: { gt: new Date() }, // Token yang belum expired
        },
      });

      if (ipRequestCount >= 5) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Terlalu banyak permintaan dari jaringan Anda. Tunggu beberapa saat.",
        });
      }

      // 3. Cek cooldown spam berbasis email (sudah ada di kode Anda)
      await assertResendCooldown(ctx.db, email);

      const existingPurchase = await ctx.db.purchase.findFirst({
        where: {
          buyerEmail: { equals: email, mode: "insensitive" },
          status: "completed",
        },
        select: { id: true },
      });

      if (!existingPurchase) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Email tidak ditemukan dalam riwayat pembelian.",
        });
      }

      const otp = crypto.randomInt(100000, 999999).toString();
      const expires = new Date(Date.now() + 10 * 60 * 1000);
      const identifier = `HISTORY:${email}`;

      await ctx.db.verificationToken.deleteMany({
        where: { identifier },
      });

      // 4. SIMPAN IP KE DATABASE saat buat token
      await ctx.db.verificationToken.create({
        data: {
          identifier,
          token: otp,
          expires,
          ipAddress: ip // Simpan IP di sini
        },
      });

      await sendPurchaseHistoryOtpEmail({ email, otp });

      await setOtpOwnership(email);
      await incrementResendCount(ctx.db, email);

      return { success: true };
    }),

  // ─── VERIFY OTP RIWAYAT PEMBELIAN ───────────────────────────────────────────
  verifyPurchaseHistoryOtp: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        otp: z.string().length(6, "OTP harus 6 digit"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const email = input.email.toLowerCase();

      // Cek kepemilikan cookie OTP
      await assertOtpOwnership(email);

      const identifier = `HISTORY:${email}`;

      const verificationToken = await ctx.db.verificationToken.findFirst({
        where: { identifier },
      });

      if (!verificationToken) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kode OTP tidak ditemukan. Silakan kirim ulang.",
        });
      }

      if (new Date() > verificationToken.expires) {
        await ctx.db.verificationToken.deleteMany({ where: { identifier } });
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Kode OTP sudah kedaluwarsa.",
        });
      }

      if (verificationToken.token !== input.otp) {
        const updated = await ctx.db.verificationToken.update({
          where: { token: verificationToken.token },
          data: { attempts: { increment: 1 } },
        });

        if (updated.attempts >= 3) {
          await ctx.db.verificationToken.deleteMany({ where: { identifier } });
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Terlalu banyak percobaan salah. Silakan minta kode OTP baru.",
          });
        }

        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Kode OTP salah. Sisa percobaan: ${3 - updated.attempts}`,
        });
      }

      // Hapus token OTP dan cooldown LIMIT setelah verifikasi berhasil
      await ctx.db.verificationToken.deleteMany({
        where: {
          identifier: { in: [identifier, `LIMIT:${email}`] },
        },
      });

      // Bersihkan cookie ownership
      await clearOtpOwnership();

      const accessToken = generateHistoryToken(email);
      return { success: true, accessToken };
    }),

  // ─── GET PURCHASE HISTORY BY TOKEN (guest) ──────────────────────────────
  getPurchaseHistoryByToken: publicProcedure
    .input(
      z.object({
        accessToken: z.string(),
        mode: z.enum(["produk", "riwayat"]).default("produk"),
      })
    )
    .query(async ({ ctx, input }) => {
      const payload = verifyHistoryToken(input.accessToken);

      if (!payload) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Token tidak valid atau sudah kedaluwarsa.",
        });
      }

      const isProduk = input.mode === "produk";

      const purchases = await ctx.db.purchase.findMany({
        where: {
          buyerEmail: { equals: payload.email, mode: "insensitive" },
          ...(isProduk ? { status: "completed" } : {}),
          ...(isProduk ? { product: { portalEnabled: true } } : {}),
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              image: true,
              type: true,
              slug: true,
              links: true,
              notes: true,
              price: true,
              discountPrice: true,
              contentType: true,
              startDate: true,
              endDate: true,
              duration: true,
              user: {
                select: {
                  name: true,
                  catalog: { select: { slug: true } },
                },
              },
            },
          },
          voucher: {
            select: { id: true, code: true, discount: true, type: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return { email: payload.email, purchases };
    }),

  // ─── GET PURCHASE HISTORY FOR CREATOR (logged in) ───────────────────────
  getPurchaseHistoryForCreator: protectedProcedure
    .input(
      z
        .object({
          mode: z.enum(["produk", "riwayat"]).default("produk"),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const email = ctx.session.user.email;
      const isProduk = (input?.mode ?? "produk") === "produk";

      if (!email) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Email tidak ditemukan di akun Anda.",
        });
      }

      const purchases = await ctx.db.purchase.findMany({
        where: {
          buyerEmail: { equals: email, mode: "insensitive" },
          ...(isProduk ? { status: "completed" } : {}),
          ...(isProduk ? { product: { portalEnabled: true } } : {}),
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              image: true,
              type: true,
              slug: true,
              links: true,
              notes: true,
              price: true,
              discountPrice: true,
              contentType: true,
              startDate: true,
              endDate: true,
              duration: true,
              user: {
                select: {
                  name: true,
                  catalog: { select: { slug: true } },
                },
              },
            },
          },
          voucher: {
            select: { id: true, code: true, discount: true, type: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return { email, purchases };
    }),

  loginWithPortalToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const portalAccess = await ctx.db.portalAccess.findUnique({
        where: { token: input.token },
      });

      if (!portalAccess) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Portal token tidak valid.",
        });
      }

      if (new Date() > portalAccess.expiresAt) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Portal token sudah kedaluwarsa.",
        });
      }

      const accessToken = generateHistoryToken(portalAccess.buyerEmail);
      return { success: true, email: portalAccess.buyerEmail, accessToken };
    }),
});

// Jalankan ini secara berkala atau buat cron job di Vercel
export async function cleanupExpiredTokens(db: any) {
  await db.verificationToken.deleteMany({
    where: { expires: { lt: new Date() } }
  });
}