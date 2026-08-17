import prisma from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminBackupPage() {
  const backups = await prisma.backupLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  const totalSize = backups.filter(b => b.status === 'success').reduce((sum, b) => sum + b.size, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">备份管理</h1>
          <p className="text-sm text-gray-500 mt-1">{backups.length} 条记录 · 总计 {(totalSize / (1024 * 1024)).toFixed(1)} MB</p>
        </div>
        <div className="flex items-center gap-3">
          <form action="/api/admin/backup" method="POST">
            <input type="hidden" name="type" value="db" />
            <button type="submit" className="btn-secondary text-sm">备份数据库</button>
          </form>
          <form action="/api/admin/backup" method="POST">
            <input type="hidden" name="type" value="full" />
            <button type="submit" className="btn-primary text-sm">完整备份</button>
          </form>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-600">文件名</th>
                <th className="px-4 py-3 font-medium text-gray-600">类型</th>
                <th className="px-4 py-3 font-medium text-gray-600">大小</th>
                <th className="px-4 py-3 font-medium text-gray-600">状态</th>
                <th className="px-4 py-3 font-medium text-gray-600">时间</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {backups.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-700">{b.filename}</td>
                  <td className="px-4 py-3">
                    <span className="tag">{b.type === 'db' ? '数据库' : b.type === 'full' ? '完整' : '上传文件'}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{b.size > 0 ? `${(b.size / (1024 * 1024)).toFixed(1)} MB` : '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`tag ${b.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {b.status === 'success' ? '成功' : '失败'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{b.createdAt.toLocaleString('zh-CN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {backups.length === 0 && <p className="text-center py-8 text-gray-400">暂无备份记录，点击上方按钮创建备份</p>}
      </div>

      <div className="mt-6 card p-5">
        <h3 className="font-semibold text-gray-900 mb-3">自动备份说明</h3>
        <div className="text-sm text-gray-500 space-y-2">
          <p>• 备份文件存储在 <code className="bg-gray-100 px-1 rounded">backups/</code> 目录下</p>
          <p>• 建议每周进行一次完整备份（数据库 + 上传文件）</p>
          <p>• 可通过配置定时任务实现自动备份</p>
          <p>• 备份文件命名格式：<code className="bg-gray-100 px-1 rounded">backup-{'{type}'}-{'{date}'}.{'{ext}'}</code></p>
        </div>
      </div>
    </div>
  );
}
