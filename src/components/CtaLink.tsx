'use client';
import Link from 'next/link';

/** 服务 CTA 链接：点击时上报埋点（path 记为 /cta:<目标>，与文章访问在统计中区分）。 */
export default function CtaLink({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) {
  function report() {
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: `/cta:${href}` }),
      keepalive: true,
    }).catch(() => {});
  }
  return (
    <Link href={href} className={className} onClick={report}>
      {children}
    </Link>
  );
}
