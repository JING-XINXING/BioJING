import prisma from '@/lib/prisma';
import { BookOpen, Eye, MessageSquare, FileText, HardDrive, ArrowUp } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const [postCount, totalViews, commentCount, fileCount, files, latestPosts, latestComments] = await Promise.all([
    prisma.post.count(),
    prisma.post.aggregate({ _sum: { viewCount: true } }),
    prisma.comment.count(),
    prisma.postFile.count(),
    prisma.postFile.findMany({ orderBy: { createdAt: 'desc' }, take: 10 }),
    prisma.post.findMany({ orderBy: { updatedAt: 'desc' }, take: 5, include: { series: true } }),
    prisma.comment.findMany({ orderBy: { createdAt: 'desc' }, take: 5, include: { post: { select: { title: true, slug: true } } } }),
  ]);

  const totalFileSize = files.reduce((sum, f) => sum + f.size, 0);

  const stats = [
    { label: '文章数', value: postCount, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: '总浏览', value: totalViews._sum.viewCount || 0, icon: Eye, color: 'text-green-600', bg: 'bg-green-50' },
    { label: '总评论', value: commentCount, icon: MessageSquare, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: '文件数', value: fileCount, icon: FileText, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">管理后台</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="card p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${s.bg}`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{s.value.toLocaleString()}</div>
                <div className="text-xs text-gray-400">{s.label}</div>
              </div>
            </div>
          </div>
        ))}
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-50">
              <HardDrive className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{(totalFileSize / (1024 * 1024)).toFixed(1)} MB</div>
              <div className="text-xs text-gray-400">存储占用</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Posts */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4" /> 最近更新
          </h3>
          <div className="space-y-3">
            {latestPosts.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm">
                <div className="min-w-0 flex-1">
                  <a href={`/posts/${p.slug}`} className="text-gray-700 hover:text-green-600 truncate block">{p.title}</a>
                  <span className="text-xs text-gray-400">{p.status} · {p.series?.name || '无系列'}</span>
                </div>
                <span className="text-xs text-gray-400 shrink-0 ml-2">{p.updatedAt.toLocaleDateString('zh-CN')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Comments */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" /> 最新评论
          </h3>
          <div className="space-y-3">
            {latestComments.map((c) => (
              <div key={c.id} className="text-sm">
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                  <span className="font-medium text-gray-600">{c.author}</span>
                  <span>·</span>
                  <a href={`/posts/${c.post.slug}`} className="text-blue-600 truncate">{c.post.title}</a>
                </div>
                <p className="text-gray-500 text-xs line-clamp-2">{c.content}</p>
              </div>
            ))}
            {latestComments.length === 0 && <p className="text-gray-400 text-sm">暂无评论</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
