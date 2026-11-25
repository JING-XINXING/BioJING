import prisma from '@/lib/prisma';
import SeriesCard from '@/components/SeriesCard';

// ISR：公开页每小时再验证（v1.2 R1）
export const revalidate = 3600;

export default async function SeriesPage() {
  const series = await prisma.series.findMany({
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { posts: true } } },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">系列专题</h1>
      <p className="text-gray-500 mb-8">按组学领域分类浏览博文系列</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {series.map((s) => (
          <SeriesCard key={s.id} series={s} postCount={s._count.posts} />
        ))}
      </div>
    </div>
  );
}
