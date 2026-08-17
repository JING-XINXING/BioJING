import prisma from '@/lib/prisma';
import FileUploader from '@/components/FileUploader';
import Link from 'next/link';
import { Trash2, Download } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminFilesPage() {
  const files = await prisma.postFile.findMany({
    orderBy: { createdAt: 'desc' },
    include: { post: { select: { title: true, slug: true } } },
  });

  const totalSize = files.reduce((sum, f) => sum + f.size, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">文件管理</h1>
      <p className="text-sm text-gray-500 mb-6">
        {files.length} 个文件 · 总计 {(totalSize / (1024 * 1024)).toFixed(1)} MB
      </p>

      <div className="mb-8">
        <FileUploader />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-600">文件名</th>
                <th className="px-4 py-3 font-medium text-gray-600">类型</th>
                <th className="px-4 py-3 font-medium text-gray-600">大小</th>
                <th className="px-4 py-3 font-medium text-gray-600">所属文章</th>
                <th className="px-4 py-3 font-medium text-gray-600">下载</th>
                <th className="px-4 py-3 font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {files.map((f) => (
                <tr key={f.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 max-w-xs truncate font-medium text-gray-700">{f.originalName}</td>
                  <td className="px-4 py-3">
                    <span className="tag">{f.fileType}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{f.size > 1024 * 1024 ? `${(f.size / (1024 * 1024)).toFixed(1)} MB` : `${(f.size / 1024).toFixed(0)} KB`}</td>
                  <td className="px-4 py-3">
                    {f.post ? (
                      <Link href={`/posts/${f.post.slug}`} className="text-blue-600 hover:underline">{f.post.title.slice(0, 30)}...</Link>
                    ) : <span className="text-gray-400">未关联</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-400">{f.downloadCount}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <a href={`/api/files/${f.id}/download`} className="p-1 hover:bg-gray-100 rounded" title="下载">
                        <Download className="w-4 h-4 text-blue-600" />
                      </a>
                      <button
                        onClick={async () => {
                          if (confirm('确定删除？')) {
                            await fetch(`/api/admin/files/${f.id}`, { method: 'DELETE' });
                            location.reload();
                          }
                        }}
                        className="p-1 hover:bg-gray-100 rounded"
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
        {files.length === 0 && <p className="text-center py-8 text-gray-400">暂无文件</p>}
      </div>
    </div>
  );
}
