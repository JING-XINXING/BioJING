import prisma from '@/lib/prisma';
import Link from 'next/link';
import PostCard from '@/components/PostCard';
import SeriesCard from '@/components/SeriesCard';
import { Dna, BookOpen, TrendingUp, Search } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [featuredPosts, series, stats] = await Promise.all([
    prisma.post.findMany({
      where: { status: 'published' },
      orderBy: { weekNumber: 'desc' },
      take: 6,
      include: { series: true, tags: { include: { tag: true } } },
    }),
    prisma.series.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { posts: true } } },
    }),
    prisma.post.count({ where: { status: 'published' } }),
  ]);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 via-white to-blue-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-6">
              <Dna className="w-4 h-4" />
              52周生信硬核科普
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              生物信息学
              <span className="text-green-600">深度科普</span>
              与
              <span className="text-blue-600">分析服务</span>
            </h1>
            <p className="mt-6 text-lg text-gray-500 leading-relaxed">
              从转录组到三维基因组，从 Bulk 到单细胞，从蛋白质组到代谢组——
              覆盖生物信息学全领域的深度教程、实战代码与高分文献解读。
            </p>
            <div className="flex items-center gap-4 mt-8">
              <Link href="/posts" className="btn-primary flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                浏览全部博文
              </Link>
              <Link href="/series" className="btn-secondary">
                查看专题系列
              </Link>
            </div>
            <div className="flex items-center gap-6 mt-8 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                {stats} 篇文章
              </span>
              <span>{series.length} 个系列</span>
              <span>9 大组学领域</span>
            </div>
          </div>
        </div>
      </section>

      {/* Series Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">系列专题</h2>
          <Link href="/series" className="text-sm text-green-600 hover:text-green-700 font-medium">
            查看全部 →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {series.map((s) => (
            <SeriesCard key={s.id} series={s} postCount={s._count.posts} />
          ))}
        </div>
      </section>

      {/* Latest Posts */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">最新博文</h2>
            <Link href="/posts" className="text-sm text-green-600 hover:text-green-700 font-medium">
              查看全部 →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </section>

      {/* Service CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-10 md:p-14 text-white">
          <div className="max-w-2xl">
            <h2 className="text-2xl md:text-3xl font-bold">需要专业生信分析服务？</h2>
            <p className="mt-4 text-green-100 leading-relaxed">
              提供转录组、单细胞、空间转录组、表观遗传、基因组、免疫组库、蛋白质组、代谢组等全方位生物信息学分析服务。
              支持定制化分析方案与论文投稿修改。
            </p>
            <Link href="/about" className="inline-block mt-6 px-6 py-3 bg-white text-green-700 rounded-lg font-semibold hover:bg-green-50 transition-colors">
              了解更多
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
