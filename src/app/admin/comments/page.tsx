import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminCommentsPage() {
  const comments = await prisma.comment.findMany({
    orderBy: { createdAt: 'desc' },
    include: { post: { select: { title: true, slug: true } } },
    take: 100,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">评论管理</h1>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-600">作者</th>
                <th className="px-4 py-3 font-medium text-gray-600">内容</th>
                <th className="px-4 py-3 font-medium text-gray-600">所属文章</th>
                <th className="px-4 py-3 font-medium text-gray-600">时间</th>
                <th className="px-4 py-3 font-medium text-gray-600">状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {comments.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-700">{c.author}</td>
                  <td className="px-4 py-3 max-w-xs truncate text-gray-500">{c.content}</td>
                  <td className="px-4 py-3">
                    <a href={`/posts/${c.post.slug}`} className="text-blue-600 hover:underline text-xs">
                      {c.post.title.slice(0, 30)}...
                    </a>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{c.createdAt.toLocaleDateString('zh-CN')}</td>
                  <td className="px-4 py-3">
                    <span className={`tag ${c.approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {c.approved ? '已通过' : '待审核'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {comments.length === 0 && <p className="text-center py-8 text-gray-400">暂无评论</p>}
      </div>
    </div>
  );
}
