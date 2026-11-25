'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Search, Menu, X, Dna } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(search.trim())}`;
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Dna className="w-7 h-7 text-green-600" />
            <span className="text-xl font-bold text-gray-900">BioJING</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/posts" className="text-sm text-gray-600 hover:text-green-600 transition-colors">全部博文</Link>
            <Link href="/series" className="text-sm text-gray-600 hover:text-green-600 transition-colors">系列专题</Link>
            <Link href="/paths" className="text-sm text-gray-600 hover:text-green-600 transition-colors">学习路径</Link>
            <a href="/feed.xml" className="text-sm text-gray-600 hover:text-green-600 transition-colors">RSS</a>
            <Link href="/about" className="text-sm text-gray-600 hover:text-green-600 transition-colors">关于</Link>
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索文章..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-48 pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </form>
          </div>

          {/* Mobile menu */}
          <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu panel */}
        {open && (
          <div className="md:hidden pb-4 border-t border-gray-100 pt-4">
            <div className="flex flex-col gap-3">
              <Link href="/posts" className="text-sm text-gray-600 hover:text-green-600" onClick={() => setOpen(false)}>全部博文</Link>
              <Link href="/series" className="text-sm text-gray-600 hover:text-green-600" onClick={() => setOpen(false)}>系列专题</Link>
              <Link href="/paths" className="text-sm text-gray-600 hover:text-green-600" onClick={() => setOpen(false)}>学习路径</Link>
              <Link href="/about" className="text-sm text-gray-600 hover:text-green-600" onClick={() => setOpen(false)}>关于</Link>
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </form>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
