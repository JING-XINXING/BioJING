import Link from 'next/link';
import AdminNav from '@/components/AdminNav';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <div className="flex">
        <aside className="hidden md:block w-56 shrink-0 bg-white border-r border-gray-200 min-h-[calc(100vh-57px)]">
          <nav className="p-4 space-y-1">
            <Link href="/admin" className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg hover:text-green-600">概览</Link>
            <Link href="/admin/posts" className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg hover:text-green-600">文章管理</Link>
            <Link href="/admin/posts/new" className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg hover:text-green-600">新建文章</Link>
            <Link href="/admin/series" className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg hover:text-green-600">系列管理</Link>
            <Link href="/admin/files" className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg hover:text-green-600">文件管理</Link>
            <Link href="/admin/comments" className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg hover:text-green-600">评论管理</Link>
            <Link href="/admin/analytics" className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg hover:text-green-600">数据统计</Link>
            <Link href="/admin/backup" className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg hover:text-green-600">备份管理</Link>
            <Link href="/admin/settings" className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg hover:text-green-600">站点设置</Link>
          </nav>
        </aside>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
