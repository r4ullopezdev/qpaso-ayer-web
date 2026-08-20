import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { getAllArticles } from "@/lib/blog";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

  const paths = ["", "/eventos", "/restaurante", "/nosotros", "/blog", "/en", "/en/eventos", "/en/restaurante", "/en/nosotros"];
  const staticPages = paths.map((p) => ({
    url: `${base}${p}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.7,
  }));

  let eventPages: MetadataRoute.Sitemap = [];
  try {
    const events = await prisma.event.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    });
    eventPages = events.flatMap((e) => [
      { url: `${base}/eventos/${e.slug}`, lastModified: e.updatedAt, changeFrequency: "weekly" as const, priority: 0.8 },
      { url: `${base}/en/eventos/${e.slug}`, lastModified: e.updatedAt, changeFrequency: "weekly" as const, priority: 0.7 },
    ]);
  } catch {
    // ignore
  }

  const blogPages = getAllArticles().map((a) => ({
    url: `${base}/blog/${a.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...eventPages, ...blogPages];
}
