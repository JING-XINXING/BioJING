import type { TocItem } from '@/lib/toc';

/** 文章目录：桌面端侧栏粘性展示，移动端折叠（details）避免挤占正文（v1.2 R3/R5）。 */
export default function PostToc({ items }: { items: TocItem[] }) {
  if (items.length === 0) return null;
  const list = (
    <ul className="space-y-1 text-sm">
      {items.map((item) => (
        <li key={item.slug} className={item.level === 3 ? 'pl-4' : ''}>
          <a href={`#${item.slug}`} className="text-gray-500 hover:text-green-700 leading-snug block py-0.5">
            {item.text}
          </a>
        </li>
      ))}
    </ul>
  );
  return (
    <>
      {/* 移动端：折叠目录 */}
      <details className="lg:hidden card p-4 mb-6">
        <summary className="font-semibold text-sm text-gray-900 cursor-pointer">本文目录（{items.length}）</summary>
        <div className="mt-3">{list}</div>
      </details>
      {/* 桌面端：粘性目录 */}
      <div className="hidden lg:block card p-4">
        <h4 className="font-semibold text-sm text-gray-900 mb-3">本文目录</h4>
        {list}
      </div>
    </>
  );
}
