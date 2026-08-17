'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Dna, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function AdminNav() {
  const router = useRouter();
  const [mOpen, setMOpen] = useState(false);

  const logout = () => {
    document.cookie = 'biojing_token=; path=/; max-age=0';
    router.push('/admin/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-gray-900 text-white">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-3">
          <button className="md:hidden" onClick={() => setMOpen(!mOpen)}>
            {mOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <Link href="/admin" className="flex items-center gap-2">
            <Dna className="w-5 h-5 text-green-400" />
            <span className="font-bold">BioJING Admin</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm text-gray-400 hover:text-white">查看网站</Link>
          <button onClick={logout} className="text-sm text-gray-400 hover:text-white flex items-center gap-1">
            <LogOut className="w-3 h-3" /> 退出
          </button>
        </div>
      </div>
      {/* Mobile nav */}
      {mOpen && (
        <div className="md:hidden bg-gray-800 px-4 py-3 space-y-2">
          <Link href="/admin" className="block py-1 text-sm text-gray-300">概览</Link>
          <Link href="/admin/posts" className="block py-1 text-sm text-gray-300">文章管理</Link>
          <Link href="/admin/posts/new" className="block py-1 text-sm text-gray-300">新建文章</Link>
          <Link href="/admin/files" className="block py-1 text-sm text-gray-300">文件管理</Link>
          <Link href="/admin/analytics" className="block py-1 text-sm text-gray-300">数据统计</Link>
          <Link href="/admin/backup" className="block py-1 text-sm text-gray-300">备份管理</Link>
        </div>
      )}
    </nav>
  );
}
