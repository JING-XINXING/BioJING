import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Pencil, Trash2, Eye, Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminPostsPage() {
  const posts = await prisma.post.findMany({
    orderBy: { weekNumber: 'desc' },
    include: { series: true },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">文章管理</h1>
        <Link href="/admin/posts/new" className="btn-primary text-sm flex items-center gap-1">
          <Plus className="w-4 h-4" /> 新建文章
        </Link>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-600">周次</th>
                <th className="px-4 py-3 font-medium text-gray-600">标题</th>
                <th className="px-4 py-3 font-medium text-gray-600">系列</th>
                <th className="px-4 py-3 font-medium text-gray-600">状态</th>
                <th className="px-4 py-3 font-medium text-gray-600">浏览</th>
                <th className="px-4 py-3 font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {posts.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-400">{p.weekNumber || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="max-w-xs truncate font-medium text-gray-700">{p.title}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{p.series?.name || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                      p.status === 'published' ? 'bg-green-100 text-green-700' :
                      p.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-500'
                    }`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{p.viewCount}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/posts/${p.slug}`} className="p-1 hover:bg-gray-100 rounded" title="查看">
                        <Eye className="w-4 h-4 text-gray-400" />
                      </Link>
                      <Link href={`/admin/posts/${p.id}/edit`} className="p-1 hover:bg-gray-100 rounded" title="编辑">
                        <Pencil className="w-4 h-4 text-blue-600" />
                      </Link>
                      <button
                        onClick={async () => {
                          if (confirm('确定删除？')) {
                            await fetch(`/api/admin/posts/${p.id}`, { method: 'DELETE' });
                            location.reload();
                          }
                        }}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
