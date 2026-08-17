import prisma from '@/lib/prisma';
import { Eye, TrendingUp, Users, Download, FileText } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminAnalyticsPage() {
  const [totalViews, totalComments, totalDownloads, postCount, topPosts, recentVisits] = await Promise.all([
    prisma.post.aggregate({ _sum: { viewCount: true } }),
    prisma.comment.count(),
    prisma.postFile.aggregate({ _sum: { downloadCount: true } }),
    prisma.post.count({ where: { status: 'published' } }),
    prisma.post.findMany({
      where: { status: 'published' },
      orderBy: { viewCount: 'desc' },
      take: 10,
      select: { title: true, slug: true, viewCount: true },
    }),
    prisma.visitLog.count(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">数据统计</h1>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="card p-4">
          <div className="text-sm text-gray-400 mb-1">总浏览</div>
          <div className="text-2xl font-bold text-gray-900">{(totalViews._sum.viewCount || 0).toLocaleString()}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-gray-400 mb-1">访问记录</div>
          <div className="text-2xl font-bold text-gray-900">{recentVisits.toLocaleString()}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-gray-400 mb-1">总评论</div>
          <div className="text-2xl font-bold text-gray-900">{totalComments.toLocaleString()}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-gray-400 mb-1">总下载</div>
          <div className="text-2xl font-bold text-gray-900">{(totalDownloads._sum.downloadCount || 0).toLocaleString()}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-gray-400 mb-1">文章数</div>
          <div className="text-2xl font-bold text-gray-900">{postCount}</div>
        </div>
      </div>

      {/* Top Posts */}
      <div className="card p-5">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" /> 热门文章 TOP 10
        </h3>
        <div className="space-y-2">
          {topPosts.map((p, i) => (
            <div key={p.slug} className="flex items-center gap-3 text-sm">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i < 3 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {i + 1}
              </span>
              <a href={`/posts/${p.slug}`} className="flex-1 text-gray-700 hover:text-green-600 truncate">{p.title}</a>
              <span className="text-gray-400 shrink-0">{p.viewCount.toLocaleString()} 浏览</span>
            </div>
          ))}
        </div>
      </div>

      {/* Placeholder charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-4">浏览量趋势</h3>
          <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 text-sm">
            📊 浏览量趋势图（部署后采集数据）
          </div>
        </div>
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-4">下载量分布</h3>
          <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 text-sm">
            📥 下载量分布图（部署后采集数据）
          </div>
        </div>
      </div>
    </div>
  );
}
