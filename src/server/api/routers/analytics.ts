import { z } from "zod";
import { createHash } from "node:crypto";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { startOfDay, subDays, format, eachDayOfInterval } from "date-fns";

const calculateChange = (current: number, previous: number) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

const getClientIp = (headers: Headers) => {
  const forwardedFor = headers.get("x-forwarded-for");
  const forwardedIp = forwardedFor?.split(",")[0]?.trim();

  return (
    forwardedIp ??
    headers.get("x-real-ip") ??
    headers.get("cf-connecting-ip") ??
    headers.get("x-client-ip")
  );
};

const hashIp = (ip: string | null | undefined) => {
  if (!ip) return null;
  return createHash("sha256").update(ip).digest("hex");
};

const parseUserAgent = (userAgent: string | null) => {
  const ua = userAgent ?? "";

  const browser = ua.includes("Edg/")
    ? "Edge"
    : ua.includes("OPR/") || ua.includes("Opera")
      ? "Opera"
      : ua.includes("Firefox/")
        ? "Firefox"
        : ua.includes("Chrome/")
          ? "Chrome"
          : ua.includes("Safari/")
            ? "Safari"
            : "Unknown";

  const os = ua.includes("Windows")
    ? "Windows"
    : ua.includes("Android")
      ? "Android"
      : ua.includes("iPhone") || ua.includes("iPad")
        ? "iOS"
        : ua.includes("Mac OS X") || ua.includes("Macintosh")
          ? "macOS"
          : ua.includes("Linux")
            ? "Linux"
            : "Unknown";

  const device = /Mobile|Android|iPhone|iPod/i.test(ua)
    ? "Mobile"
    : /iPad|Tablet/i.test(ua)
      ? "Tablet"
      : "Desktop";

  return { browser, os, device };
};

const getViewMetadata = (headers: Headers | undefined) => {
  const userAgent = headers?.get("user-agent") ?? null;
  const { browser, os, device } = parseUserAgent(userAgent);
  const ipHash = hashIp(headers ? getClientIp(headers) : null);

  return { ipHash, userAgent, browser, os, device };
};

export const analyticsRouter = createTRPCRouter({
  recordView: publicProcedure
    .input(
      z.object({
        productId: z.string(),
        visitorId: z.string().min(1).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const metadata = getViewMetadata(ctx.req?.headers);

      try {
        await ctx.db.productView.create({
          data: {
            productId: input.productId,
            visitorId: input.visitorId,
            ...metadata,
          },
        });
        return { success: true };
      } catch (error) {
        console.warn("Failed to record product view", error);
        return { success: false };
      }
    }),

  recordCatalogView: publicProcedure
    .input(
      z.object({
        catalogId: z.string(),
        visitorId: z.string().min(1).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const catalog = await ctx.db.catalog.findUnique({
        where: { id: input.catalogId },
        select: { id: true, userId: true },
      });

      if (!catalog) return { success: false };

      try {
        await ctx.db.catalogView.create({
          data: {
            catalogId: catalog.id,
            userId: catalog.userId,
            visitorId: input.visitorId,
            ...getViewMetadata(ctx.req?.headers),
          },
        });

        return { success: true };
      } catch (error) {
        console.warn("Failed to record catalog view", error);
        return { success: false };
      }
    }),

  getDashboardStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const products = await ctx.db.product.findMany({
      where: { userId },
      select: { id: true },
    });
    const productIds = products.map((p) => p.id);

    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);
    const sixtyDaysAgo = subDays(now, 60);
    const sevenDaysAgo = startOfDay(subDays(now, 6));

    const [
      totalProducts,
      currentProducts,
      previousProducts,
      allTimeStats,
      last30DaysStats,
      prev30DaysStats,
      categoryStats,
      uniqueBuyersCount,
      currentUniqueBuyersCount,
      previousUniqueBuyersCount,
      weeklyPurchases,
      monthlyPurchases,
      totalProductViewsCount,
      totalCatalogViewsCount,
      allTimeProductVisitorIds,
      allTimeCatalogVisitorIds,
      allTimeAnonymousProductViews,
      allTimeAnonymousCatalogViews,
      currentProductVisitorIds,
      currentCatalogVisitorIds,
      currentAnonymousProductViews,
      currentAnonymousCatalogViews,
      previousProductVisitorIds,
      previousCatalogVisitorIds,
      previousAnonymousProductViews,
      previousAnonymousCatalogViews,
      weeklyProductViews,
      weeklyCatalogViews,
    ] = await Promise.all([
      ctx.db.product.count({ where: { userId } }),
      ctx.db.product.count({
        where: { userId, createdAt: { gte: thirtyDaysAgo } },
      }),
      ctx.db.product.count({
        where: {
          userId,
          createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
        },
      }),
      ctx.db.purchase.aggregate({
        where: { productId: { in: productIds }, status: "completed" },
        _sum: { amount: true },
        _count: { id: true },
      }),
      ctx.db.purchase.aggregate({
        where: {
          productId: { in: productIds },
          status: "completed",
          createdAt: { gte: thirtyDaysAgo },
        },
        _sum: { amount: true },
        _count: { id: true },
      }),
      ctx.db.purchase.aggregate({
        where: {
          productId: { in: productIds },
          status: "completed",
          createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
        },
        _sum: { amount: true },
        _count: { id: true },
      }),
      ctx.db.product.groupBy({
        by: ["type"],
        where: { userId },
        _count: { id: true },
      }),
      ctx.db.purchase.groupBy({
        by: ["buyerEmail"],
        where: { productId: { in: productIds }, status: "completed" },
      }).then((res) => res.length),
      ctx.db.purchase.groupBy({
        by: ["buyerEmail"],
        where: {
          productId: { in: productIds },
          status: "completed",
          createdAt: { gte: thirtyDaysAgo },
        },
      }).then((res) => res.length),
      ctx.db.purchase.groupBy({
        by: ["buyerEmail"],
        where: {
          productId: { in: productIds },
          status: "completed",
          createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
        },
      }).then((res) => res.length),
      ctx.db.purchase.findMany({
        where: {
          productId: { in: productIds },
          status: "completed",
          createdAt: { gte: sevenDaysAgo },
        },
        select: { createdAt: true, amount: true },
      }),
      ctx.db.purchase.findMany({
        where: {
          productId: { in: productIds },
          status: "completed",
          createdAt: { gte: thirtyDaysAgo },
        },
        select: { buyerEmail: true, createdAt: true },
      }),
      ctx.db.productView.count({
        where: { productId: { in: productIds } },
      }),
      ctx.db.catalogView.count({
        where: { userId },
      }).catch(() => 0),
      ctx.db.productView.groupBy({
        by: ["visitorId"],
        where: {
          productId: { in: productIds },
          visitorId: { not: null },
        },
      }).then((res) => res.map((view) => view.visitorId).filter(Boolean)),
      ctx.db.catalogView.groupBy({
        by: ["visitorId"],
        where: {
          userId,
          visitorId: { not: null },
        },
      })
        .then((res) => res.map((view) => view.visitorId).filter(Boolean))
        .catch(() => []),
      ctx.db.productView.count({
        where: {
          productId: { in: productIds },
          visitorId: null,
        },
      }),
      ctx.db.catalogView.count({
        where: {
          userId,
          visitorId: null,
        },
      }).catch(() => 0),
      ctx.db.productView.groupBy({
        by: ["visitorId"],
        where: {
          productId: { in: productIds },
          visitorId: { not: null },
          createdAt: { gte: thirtyDaysAgo },
        },
      }).then((res) => res.map((view) => view.visitorId).filter(Boolean)),
      ctx.db.catalogView.groupBy({
        by: ["visitorId"],
        where: {
          userId,
          visitorId: { not: null },
          createdAt: { gte: thirtyDaysAgo },
        },
      })
        .then((res) => res.map((view) => view.visitorId).filter(Boolean))
        .catch(() => []),
      ctx.db.productView.count({
        where: {
          productId: { in: productIds },
          visitorId: null,
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      ctx.db.catalogView.count({
        where: {
          userId,
          visitorId: null,
          createdAt: { gte: thirtyDaysAgo },
        },
      }).catch(() => 0),
      ctx.db.productView.groupBy({
        by: ["visitorId"],
        where: {
          productId: { in: productIds },
          visitorId: { not: null },
          createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
        },
      }).then((res) => res.map((view) => view.visitorId).filter(Boolean)),
      ctx.db.catalogView.groupBy({
        by: ["visitorId"],
        where: {
          userId,
          visitorId: { not: null },
          createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
        },
      })
        .then((res) => res.map((view) => view.visitorId).filter(Boolean))
        .catch(() => []),
      ctx.db.productView.count({
        where: {
          productId: { in: productIds },
          visitorId: null,
          createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
        },
      }),
      ctx.db.catalogView.count({
        where: {
          userId,
          visitorId: null,
          createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
        },
      }).catch(() => 0),
      ctx.db.productView.findMany({
        where: {
          productId: { in: productIds },
          createdAt: { gte: sevenDaysAgo },
        },
        select: { createdAt: true },
      }),
      ctx.db.catalogView.findMany({
        where: {
          userId,
          createdAt: { gte: sevenDaysAgo },
        },
        select: { createdAt: true },
      }).catch(() => []),
    ]);

    // Format weekly revenue for chart
    const last7Days = eachDayOfInterval({
      start: sevenDaysAgo,
      end: now,
    });

    const dayNames = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ];

    const weeklyRevenue = last7Days.map((date) => {
      const dayName = dayNames[date.getDay()] ?? "";
      const dayTotal = weeklyPurchases
        .filter(
          (p) =>
            format(p.createdAt, "yyyy-MM-dd") === format(date, "yyyy-MM-dd"),
        )
        .reduce((sum, p) => sum + Number(p.amount), 0);
      return { day: dayName, value: dayTotal };
    });

    // Format weekly views (traffic)
    const trafficData = last7Days.map((date) => {
      const dayName = dayNames[date.getDay()] ?? "";
      const dayProductViews = weeklyProductViews.filter(
        (v) => format(v.createdAt, "yyyy-MM-dd") === format(date, "yyyy-MM-dd"),
      ).length;
      const dayCatalogViews = weeklyCatalogViews.filter(
        (v) => format(v.createdAt, "yyyy-MM-dd") === format(date, "yyyy-MM-dd"),
      ).length;
      return { day: dayName, value: dayProductViews + dayCatalogViews };
    });

    const categoryMap: Record<string, string> = {
      WEBINAR: "Webinar",
      KELAS_ONLINE: "Kelas",
      DIGITAL_PRODUCT: "Produk Digital",
    };

    const formattedCategoryData = categoryStats.map((stat) => ({
      name: categoryMap[stat.type] ?? stat.type,
      total: stat._count.id,
    }));

    const buyerWeeks = [
      { week: "Minggu 1", start: subDays(now, 27), end: subDays(now, 21) },
      { week: "Minggu 2", start: subDays(now, 20), end: subDays(now, 14) },
      { week: "Minggu 3", start: subDays(now, 13), end: subDays(now, 7) },
      { week: "Minggu 4", start: subDays(now, 6), end: now },
    ];

    const buyerData = buyerWeeks.map(({ week, start, end }) => {
      const buyers = new Set(
        monthlyPurchases
          .filter((purchase) => {
            const time = purchase.createdAt.getTime();
            return time >= start.getTime() && time <= end.getTime();
          })
          .map((purchase) => purchase.buyerEmail),
      );

      return { week, total: buyers.size };
    });

    const totalIncome = Number(allTimeStats._sum.amount ?? 0);
    const current30DaysIncome = Number(last30DaysStats._sum.amount ?? 0);
    const prev30DaysIncome = Number(prev30DaysStats._sum.amount ?? 0);
    const allTimeUniqueVisitors = new Set([
      ...allTimeProductVisitorIds,
      ...allTimeCatalogVisitorIds,
    ]).size;
    const currentUniqueVisitors = new Set([
      ...currentProductVisitorIds,
      ...currentCatalogVisitorIds,
    ]).size;
    const previousUniqueVisitors = new Set([
      ...previousProductVisitorIds,
      ...previousCatalogVisitorIds,
    ]).size;
    const totalVisitors =
      allTimeUniqueVisitors +
      allTimeAnonymousProductViews +
      allTimeAnonymousCatalogViews;
    const currentVisitors =
      currentUniqueVisitors +
      currentAnonymousProductViews +
      currentAnonymousCatalogViews;
    const previousVisitors =
      previousUniqueVisitors +
      previousAnonymousProductViews +
      previousAnonymousCatalogViews;

    return {
      totalIncome,
      totalProducts,
      totalUsers: uniqueBuyersCount,
      totalVisitors,
      totalViews: totalProductViewsCount + totalCatalogViewsCount,
      incomeChange: calculateChange(current30DaysIncome, prev30DaysIncome),
      productsChange: calculateChange(currentProducts, previousProducts),
      usersChange: calculateChange(
        currentUniqueBuyersCount,
        previousUniqueBuyersCount,
      ),
      visitorsChange: calculateChange(currentVisitors, previousVisitors),
      weeklyRevenue,
      categoryData: formattedCategoryData,
      trafficData,
      buyerData,
      userName: ctx.session.user.name,
    };
  }),
});
