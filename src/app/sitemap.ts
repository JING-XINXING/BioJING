import type { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';

/** 动态 sitemap：静态页 + 全部已发布文章 + 系列页（v1.2 R2）。 */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:30001';
  const [posts, series] = await Promise.all([
    prisma.post.findMany({ where: { status: 'published' }, select: { slug: true, updatedAt: true } }),
    prisma.series.findMany({ select: { slug: true, updatedAt: true } }),
  ]);
  return [
    { url: `${base}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/posts`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/series`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/about`, changeFrequency: 'monthly', priority: 0.5 },
    ...series.map((s) => ({ url: `${base}/series/${s.slug}`, lastModified: s.updatedAt, changeFrequency: 'monthly' as const, priority: 0.6 })),
    ...posts.map((p) => ({ url: `${base}/posts/${p.slug}`, lastModified: p.updatedAt, changeFrequency: 'monthly' as const, priority: 0.7 })),
  ];
}
