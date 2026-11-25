import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import PathChecklist from '@/components/PathChecklist';
import Link from 'next/link';

export const revalidate = 3600;

/** 单条学习路径：系列内文章按周次顺序排列，可勾选完成（v1.3 C2）。 */
export default async function PathDetailPage({ params }: { params: { slug: string } }) {
  const series = await prisma.series.findUnique({
    where: { slug: params.slug },
    include: {
      posts: {
        where: { status: 'published' },
        orderBy: [{ weekNumber: 'asc' }, { publishedAt: 'asc' }],
        select: { slug: true, title: true, weekNumber: true },
      },
    },
  });
  if (!series) notFound();
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/paths" className="text-sm text-gray-400 hover:text-green-600">← 全部路径</Link>
      <h1 className="text-3xl font-bold text-gray-900 mt-3 mb-2">{series.name}</h1>
      <p className="text-gray-500 mb-8">{series.description || series.tagline || ''}</p>
      <PathChecklist posts={series.posts} />
    </div>
  );
}
