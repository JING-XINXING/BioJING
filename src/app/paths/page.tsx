import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Route } from 'lucide-react';

export const revalidate = 3600;

/** 学习路径总览：每个系列即一条按周次递进的路径（v1.3 C2）。 */
export default async function PathsPage() {
  const series = await prisma.series.findMany({
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { posts: true } }, posts: { where: { status: 'published' }, select: { weekNumber: true } } },
  });
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
        <Route className="w-7 h-7 text-green-600" /> 学习路径
      </h1>
      <p className="text-gray-500 mb-8">按系列顺序系统学习，每篇可勾选完成，进度保存在本机浏览器。</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {series.map((s) => {
          const weeks = s.posts.map((p) => p.weekNumber).filter((w): w is number => w != null);
          return (
            <Link key={s.id} href={`/paths/${s.slug}`} className="card p-5 block">
              <h3 className="font-bold text-gray-900">{s.name}</h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{s.tagline || s.description || ''}</p>
              <p className="text-xs text-gray-400 mt-3">
                {s._count.posts} 篇{weeks.length ? ` · Week ${Math.min(...weeks)}–${Math.max(...weeks)}` : ''}
              </p>
            </Link>
          );
        })}
      </div>
      {series.length === 0 && <p className="text-center py-16 text-gray-400">暂无路径，待内容导入后显示</p>}
    </div>
  );
}
