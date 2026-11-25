import prisma from '@/lib/prisma';

/** RSS 2.0 输出：最新 20 篇已发布文章，供阅读器订阅追踪系列更新（v1.3 C1）。 */
export const revalidate = 3600;

function xmlEscape(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export async function GET() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:30001';
  const posts = await prisma.post.findMany({
    where: { status: 'published' },
    orderBy: { publishedAt: 'desc' },
    take: 20,
    select: { title: true, slug: true, excerpt: true, publishedAt: true },
  });
  const items = posts
    .map(
      (p) => `    <item>
      <title>${xmlEscape(p.title)}</title>
      <link>${base}/posts/${p.slug}</link>
      <guid>${base}/posts/${p.slug}</guid>
      <description>${xmlEscape(p.excerpt || p.title)}</description>
      <pubDate>${p.publishedAt.toUTCString()}</pubDate>
    </item>`,
    )
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>BioJING - 生信硬核科普</title>
    <link>${base}</link>
    <description>52周生信硬核科普：转录组、单细胞、空间转录组、表观遗传、基因组、免疫组库、蛋白质组、代谢组</description>
    <language>zh-CN</language>
${items}
  </channel>
</rss>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
