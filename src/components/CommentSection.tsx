'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: Date;
}

export default function CommentSection({
  postId,
  initialComments,
}: {
  postId: string;
  initialComments: Comment[];
}) {
  const [comments, setComments] = useState(initialComments);
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, author: author.trim() || '匿名', content: content.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        // 评论默认待审核，后台放行后才显示，不直接插入列表
        setAuthor('');
        setContent('');
        toast.success('评论已提交，审核通过后显示');
      } else {
        toast.error(data.error || '提交失败');
      }
    } catch {
      toast.error('提交失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-6">
        评论 ({comments.length})
      </h3>

      {/* Comment form */}
      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <input
          type="text"
          placeholder="昵称（选填）"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className="input-field max-w-sm"
        />
        <textarea
          placeholder="写下你的想法..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          className="input-field"
          required
        />
        <button type="submit" disabled={submitting} className="btn-primary text-sm">
          {submitting ? '提交中...' : '发表评论'}
        </button>
      </form>

      {/* Comments list */}
      <div className="space-y-4">
        {comments.map((c) => (
          <div key={c.id} className="border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2 text-sm mb-2">
              <span className="font-medium text-gray-700">{c.author}</span>
              <span className="text-gray-300">·</span>
              <span className="text-gray-400">
                {new Date(c.createdAt).toLocaleDateString('zh-CN')}
              </span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">{c.content}</p>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-gray-400 text-sm">暂无评论，来说两句吧</p>
        )}
      </div>
    </div>
  );
}
