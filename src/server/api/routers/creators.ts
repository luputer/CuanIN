import { z } from "zod";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, adminProcedure } from "~/server/api/trpc";

// ─── Schemas ────────────────────────────────────────────────────────────────

const createCreatorSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phoneNumber: z.string().min(1, "Nomor HP wajib diisi"),
  password: z.string().min(6),
  image: z.string().optional().nullable(),
  banner: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
});

const updateCreatorSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  email: z.string().email(),
  phoneNumber: z.string().min(1, "Nomor HP wajib diisi"),
  password: z.string().min(6).optional(),
  image: z.string().optional().nullable(),
  banner: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
});

const getProductsSchema = z.object({
  creatorId: z.string(),
  type: z.enum(["WEBINAR", "DIGITAL_PRODUCT", "KELAS_ONLINE"]).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  search: z.string().optional(),
  sortBy: z.enum(["name", "createdAt"]).optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  priceType: z.enum(["ALL", "FREE", "PAID"]).optional().default("ALL"),
  status: z.string().optional().default("ALL"),
});

// ─── Router ─────────────────────────────────────────────────────────────────

export const creatorsRouter = createTRPCRouter({
  getAll: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.user.findMany({
      where: { role: "CREATOR" },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { products: true } },
        catalog: { select: { slug: true } },
      },
    });
  }),

  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const creator = await ctx.db.user.findUnique({
        where: { id: input.id },
        include: { profile: true },
      });

      if (!creator || creator.role !== "CREATOR") {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kreator tidak ditemukan",
        });
      }

      const [totalProducts, totalUsers, earningsResult] = await Promise.all([
        ctx.db.product.count({ where: { userId: input.id } }),
        ctx.db.purchase.count({
          where: {
            product: { userId: input.id },
            status: "completed",
          },
        }),
        ctx.db.purchase.aggregate({
          where: {
            product: { userId: input.id },
            status: "completed",
          },
          _sum: { amount: true },
        }),
      ]);

      return {
        ...creator,
        bio: creator.profile?.bio ?? "",
        banner: creator.profile?.banner ?? "",
        metrics: {
          totalProducts,
          totalUsers,
          totalEarnings: Number(earningsResult._sum.amount ?? 0),
        },
      };
    }),

  create: adminProcedure
    .input(createCreatorSchema)
    .mutation(async ({ ctx, input }) => {
      const existingUser = await ctx.db.user.findUnique({
        where: { email: input.email },
      });

      if (existingUser) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Email sudah terdaftar",
        });
      }

      const hashedPassword = await bcrypt.hash(input.password, 10);

      const baseSlug = input.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 30) || "user";
      const slug = `${baseSlug}-${crypto.randomBytes(4).toString("hex")}`;

      return ctx.db.user.create({
        data: {
          name: input.name,
          email: input.email,
          phoneNumber: input.phoneNumber,
          password: hashedPassword,
          role: "CREATOR",
          status: "active",
          emailVerified: new Date(),
          image: input.image,
          profile: {
            create: {
              bio: input.bio ?? "",
              banner: input.banner ?? "",
            },
          },
          catalog: {
            create: { slug },
          },
        },
      });
    }),

  update: adminProcedure
    .input(updateCreatorSchema)
    .mutation(async ({ ctx, input }) => {
      const creator = await ctx.db.user.findUnique({
        where: { id: input.id },
      });

      if (!creator || creator.role !== "CREATOR") {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kreator tidak ditemukan",
        });
      }

      const existingUser = await ctx.db.user.findUnique({
        where: { email: input.email },
      });

      if (existingUser && existingUser.id !== input.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Email sudah digunakan oleh user lain",
        });
      }

      const updateData: any = {
        name: input.name,
        email: input.email,
        phoneNumber: input.phoneNumber,
        image: input.image,
        profile: {
          upsert: {
            create: {
              bio: input.bio ?? "",
              banner: input.banner ?? "",
            },
            update: {
              ...(input.bio !== undefined && { bio: input.bio }),
              ...(input.banner !== undefined && { banner: input.banner }),
            },
          },
        },
      };

      if (input.password) {
        updateData.password = await bcrypt.hash(input.password, 10);
      }

      return ctx.db.user.update({
        where: { id: input.id },
        data: updateData,
      });
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const creator = await ctx.db.user.findUnique({
        where: { id: input.id },
      });

      if (!creator || creator.role !== "CREATOR") {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kreator tidak ditemukan",
        });
      }

      return ctx.db.user.delete({
        where: { id: input.id },
      });
    }),

  getProducts: adminProcedure
    .input(getProductsSchema)
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.limit;
      const now = new Date();
      const andClauses: any[] = [{ userId: input.creatorId }];

      if (input.type) andClauses.push({ type: input.type });
      
      if (input.search) {
        andClauses.push({
          name: { contains: input.search, mode: "insensitive" as const },
        });
      }

      if (input.priceType === "FREE") {
        andClauses.push({ price: { equals: 0 } });
      } else if (input.priceType === "PAID") {
        andClauses.push({ price: { gt: 0 } });
      }

      if (input.status && input.status !== "ALL") {
        if (input.status === "published") {
          andClauses.push({
            status: "published",
            OR: [
              { type: { not: "WEBINAR" } },
              { endDate: null },
              { endDate: { gte: now } }
            ]
          });
        } else if (input.status === "selesai") {
          andClauses.push({
            OR: [
              { status: "archived" },
              {
                status: "published",
                type: "WEBINAR",
                endDate: { lt: now }
              }
            ]
          });
        } else if (input.status === "unpublished") {
          andClauses.push({ status: "unpublished" });
        } else {
          andClauses.push({ status: input.status });
        }
      }

      const where = { AND: andClauses };

      const [items, total] = await Promise.all([
        ctx.db.product.findMany({
          where,
          include: {
            user: {
              select: {
                name: true,
                email: true,
                image: true,
                catalog: { select: { slug: true } },
              },
            },
          },
          orderBy: { [input.sortBy]: input.sortOrder },
          skip,
          take: input.limit,
        }),
        ctx.db.product.count({ where }),
      ]);

      return {
        items,
        total,
        page: input.page,
        limit: input.limit,
        totalPages: Math.ceil(total / input.limit),
      };
    }),
});

