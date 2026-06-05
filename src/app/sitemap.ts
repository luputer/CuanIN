import { type MetadataRoute } from "next";
import { db } from "~/server/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const [catalogs, products] = await Promise.all([
    db.catalog.findMany({
      select: { slug: true, updatedAt: true },
    }),
    db.product.findMany({
      where: { status: "published", slug: { not: null } },
      select: {
        slug: true,
        updatedAt: true,
        user: {
          select: {
            catalog: { select: { slug: true } },
          },
        },
      },
    }),
  ]);

  const entries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/setup`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...catalogs.map((catalog) => ({
      url: `${baseUrl}/${catalog.slug}`,
      lastModified: catalog.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...products
      .filter((p) => p.slug && p.user?.catalog?.slug)
      .map((product) => ({
        url: `${baseUrl}/${product.user!.catalog!.slug}/${product.slug}`,
        lastModified: product.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
  ];

  return entries;
}
