import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { sendProductEmail } from "../../../lib/nodemailer";
import { env } from "~/env";
import { createInvoice as createXenditInvoice } from "~/lib/xendit";

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
  // Create a purchase (public — called from checkout page)
  create: publicProcedure
    .input(
      z.object({
        productId: z.string(),
        buyerName: z.string().min(1, "Nama wajib diisi"),
        buyerEmail: z.string().email("Email tidak valid"),
        buyerPhone: z.string().min(1, "Nomor telepon wajib diisi"),
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
      // Get the product to determine amount and link
      const product = await ctx.db.product.findUnique({
        where: { id: input.productId, status: "published" },
        select: { id: true, name: true, price: true, link: true, userId: true },
      });
      if (!product)
        throw new Error("Produk tidak ditemukan atau tidak tersedia");

      if (ctx.session?.user.id === product.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Kamu tidak bisa membeli produk milik sendiri.",
        });
      }

      const price = Number(product.price);

      // Produk gratis → langsung completed
      if (price === 0) {
        const purchase = await ctx.db.$transaction(async (tx) => {
          const newPurchase = await tx.purchase.create({
            data: {
              productId: input.productId,
              buyerName: input.buyerName,
              buyerEmail: input.buyerEmail,
              buyerPhone: input.buyerPhone,
              amount: 0,
              status: "completed",
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

          return newPurchase;
        });

        if (product.link) {
          void sendProductEmail({
            buyerEmail: input.buyerEmail,
            productName: product.name,
            productLink: product.link,
          });
        }

        return { status: "free", purchase };
      }

      // Create pending purchase
      // const purchase = await ctx.db.$transaction(async (tx) => {
      //     const newPurchase = await tx.purchase.create({
      //         data: {
      //             productId: input.productId,
      //             buyerName: input.buyerName,
      //             buyerEmail: input.buyerEmail,
      //             buyerPhone: input.buyerPhone,
      //             amount: price,
      //             status: "pending",
      //         },
      //     });

      //     // Create form answers if provided
      //     if (input.answers?.length) {
      //         await tx.formAnswer.createMany({
      //             data: input.answers.map((a) => ({
      //                 purchaseId: newPurchase.id,
      //                 formFieldId: a.formFieldId,
      //                 answer: a.answer,
      //             })),
      //         });
      //     }

      //     return newPurchase;
      // });

      const purchase = await ctx.db.$transaction(async (tx) => {
        const newPurchase = await tx.purchase.create({
          data: {
            productId: input.productId,
            buyerName: input.buyerName,
            buyerEmail: input.buyerEmail,
            buyerPhone: input.buyerPhone,
            amount: price,
            status: "pending",
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

        return newPurchase;
      });

      return { status: "pending", purchase };
    }),

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
            select: {
              name: true,
            },
          },
        },
      });

      if (!purchase) throw new Error("Transaksi tidak ditemukan");
      if (purchase.status === "completed")
        throw new Error("Transaksi sudah dibayar");
      if (Number(purchase.amount) <= 0)
        throw new Error("Transaksi gratis tidak membutuhkan pembayaran");

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

      if (purchase.xenditInvoiceUrl && purchase.xenditPaymentMethod) {
        return {
          invoiceUrl: purchase.xenditInvoiceUrl,
          xenditInvoiceId: purchase.xenditInvoiceId,
        };
      }

      const xenditPaymentMethod = XENDIT_PAYMENT_METHODS[input.paymentMethod];

      const invoice = await createXenditInvoice({
        externalId: `${purchase.id}__${input.paymentMethod}__${Date.now()}`,
        amount: Number(purchase.amount),
        payerEmail: purchase.buyerEmail,
        description: `Pembelian ${purchase.product.name}`,
        paymentMethods: [xenditPaymentMethod],
        successRedirectUrl: `${env.NEXT_PUBLIC_APP_URL}/payment/success?id=${purchase.id}`,
        failureRedirectUrl: `${env.NEXT_PUBLIC_APP_URL}/payment/failed?id=${purchase.id}`,
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

  // List all purchases for a product (creator dashboard, with pagination + search)
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
      // Verify product belongs to user
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

  // get Purcase by id

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
            },
          },
        },
      });

      if (!purchase) throw new Error("Transaksi tidak ditemukan");

      return purchase;
    }),

  // Get single purchase detail with form answers (creator dashboard)
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

  // Count purchases for a product (for product list page)
  countByProductId: protectedProcedure
    .input(z.object({ productId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.purchase.count({
        where: { productId: input.productId },
      });
    }),

  // Batch count purchases for multiple products (for product list page)
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

  // Get all unique participants across all products owned by the creator
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

      // Get all product IDs owned by this creator
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

      // Define base where clause
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

      // First, get unique emails to handle pagination correctly
      // Prisma doesn't support easy pagination on groupBy yet for all fields
      // So we'll get the aggregate data first
      const participantsAggregate = await ctx.db.purchase.groupBy({
        by: ["buyerEmail", "buyerName", "buyerPhone"],
        where: whereClause,
        _count: {
          id: true,
        },
        _sum: {
          amount: true,
        },
        orderBy: {
          buyerName: "asc",
        },
      });

      const total = participantsAggregate.length;
      const paginatedItems = participantsAggregate.slice(
        skip,
        skip + input.limit,
      );

      return {
        items: paginatedItems.map((p) => ({
          email: p.buyerEmail,
          name: p.buyerName,
          phone: p.buyerPhone,
          productsBought: p._count.id,
          totalTransaction: Number(p._sum.amount ?? 0),
        })),
        total,
        page: input.page,
        limit: input.limit,
        totalPages: Math.ceil(total / input.limit),
      };
    }),

  // List all purchases for all products owned by the creator (creator dashboard)
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

      // Get all product IDs owned by this creator
      const products = await ctx.db.product.findMany({
        where: { userId: ctx.session.user.id },
        select: { id: true },
      });
      const productIds = products.map((p) => p.id);

      if (productIds.length === 0) {
        return {
          items: [],
          total: 0,
          page,
          limit,
          totalPages: 0,
          stats: {
            totalIncome: 0,
            totalTransactions: 0,
            balance: 0,
          },
        };
      }

      const where = {
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
                  product: {
                    name: {
                      contains: input.search,
                      mode: "insensitive" as const,
                    },
                  },
                },
                {
                  id: { contains: input.search, mode: "insensitive" as const },
                },
              ],
            }
          : {}),
        ...(input.status && input.status !== "ALL"
          ? { status: input.status }
          : {}),
      };

      const [items, total, allCompletedPurchases] = await Promise.all([
        ctx.db.purchase.findMany({
          where,
          include: {
            product: {
              select: { name: true },
            },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        ctx.db.purchase.count({ where }),
        ctx.db.purchase.findMany({
          where: {
            productId: { in: productIds },
            status: "completed",
          },
          select: { amount: true },
        }),
      ]);

      const totalIncome = allCompletedPurchases.reduce(
        (acc, p) => acc + Number(p.amount),
        0,
      );

      return {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        stats: {
          totalIncome,
          totalTransactions: allCompletedPurchases.length,
          balance: totalIncome, // Simplified for now
        },
      };
    }),

  // Delete single purchase (creator dashboard)
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

      await ctx.db.purchase.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});
