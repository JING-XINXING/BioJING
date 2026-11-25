'use client';
import { useEffect } from 'react';

/** 文章页访问埋点：上报路径与文章 ID（IP/UA 由服务端从请求头取，见 /api/analytics/track）。 */
export default function VisitTracker({ postId, path }: { postId: string; path: string }) {
  useEffect(() => {
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, postId }),
      keepalive: true,
    }).catch(() => {
      // 埋点失败不影响阅读
    });
  }, [postId, path]);
  return null;
}
