'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

/** 学习路径清单：按顺序列出文章并可勾选完成，进度存 localStorage（不做账号，见计划 v1.3 C2）。 */
export default function PathChecklist({ posts }: { posts: { slug: string; title: string; weekNumber: number | null }[] }) {
  const key = 'biojing-path-progress';
  const [done, setDone] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      setDone(new Set(JSON.parse(localStorage.getItem(key) || '[]')));
    } catch {
      setDone(new Set());
    }
  }, []);

  function toggle(slug: string) {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      localStorage.setItem(key, JSON.stringify([...next]));
      return next;
    });
  }

  const finished = posts.filter((p) => done.has(p.slug)).length;
  return (
    <div>
      <p className="text-sm text-gray-500 mb-2">
        已完成 {finished}/{posts.length} 篇
      </p>
      <div className="h-2 bg-gray-100 rounded mb-6" role="progressbar" aria-valuenow={finished} aria-valuemax={posts.length}>
        <div className="h-2 bg-green-600 rounded" style={{ width: `${posts.length ? (finished / posts.length) * 100 : 0}%` }} />
      </div>
      <ol className="space-y-2">
        {posts.map((p) => (
          <li key={p.slug} className="flex items-center gap-3 card px-4 py-3">
            <input
              type="checkbox"
              checked={done.has(p.slug)}
              onChange={() => toggle(p.slug)}
              className="w-4 h-4 accent-green-700 shrink-0"
              aria-label={`标记完成：${p.title}`}
            />
            <Link
              href={`/posts/${p.slug}`}
              className={`text-sm ${done.has(p.slug) ? 'text-gray-400 line-through' : 'text-gray-700 hover:text-green-700'}`}
            >
              {p.weekNumber ? `Week ${p.weekNumber} · ` : ''}{p.title}
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
