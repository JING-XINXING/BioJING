import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import PostCard from '@/components/PostCard';

export const dynamic = 'force-dynamic';

export default async function SeriesDetailPage({ params }: { params: { slug: string } }) {
  const series = await prisma.series.findUnique({
    where: { slug: params.slug },
    include: {
      posts: {
        where: { status: 'published' },
        orderBy: { weekNumber: 'asc' },
        include: { tags: { include: { tag: true } } },
      },
    },
  });

  if (!series) notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{series.name}</h1>
      {series.tagline && (
        <p className="text-gray-500 mb-2">{series.tagline}</p>
      )}
      {series.description && (
        <p className="text-gray-600 text-sm mb-8 max-w-2xl">{series.description}</p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {series.posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
      {series.posts.length === 0 && (
        <p className="text-gray-400 text-center py-12">该系列暂无文章</p>
      )}
    </div>
  );
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const series = await prisma.series.findUnique({ where: { slug: params.slug } });
  if (!series) return { title: '系列未找到' };
  return { title: `${series.name} | 系列专题` };
}
