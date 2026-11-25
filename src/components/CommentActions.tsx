'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';

/** 后台评论操作：放行/撤下/删除，调用已鉴权的管理 API 后刷新列表。 */
export default function CommentActions({ id, approved }: { id: string; approved: boolean }) {
  const [busy, setBusy] = useState(false);

  async function act(action: 'approve' | 'reject' | 'delete') {
    setBusy(true);
    try {
      const res = action === 'delete'
        ? await fetch(`/api/admin/comments/${id}`, { method: 'DELETE' })
        : await fetch(`/api/admin/comments/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ approved: action === 'approve' }),
          });
      if (res.ok) {
        toast.success('已更新');
        window.location.reload();
      } else {
        toast.error('操作失败');
      }
    } catch {
      toast.error('操作失败');
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="inline-flex gap-2">
      {approved
        ? <button disabled={busy} onClick={() => act('reject')} className="text-xs text-yellow-700 hover:underline">撤下</button>
        : <button disabled={busy} onClick={() => act('approve')} className="text-xs text-green-700 hover:underline">放行</button>}
      <button disabled={busy} onClick={() => act('delete')} className="text-xs text-red-600 hover:underline">删除</button>
    </span>
  );
}
