'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface Series { id: string; name: string; }
interface Tag { id: string; name: string; }

export default function PostEditor({ post: initialPost }: { post?: any }) {
  const router = useRouter();
  const [title, setTitle] = useState(initialPost?.title || '');
  const [slug, setSlug] = useState(initialPost?.slug || '');
  const [content, setContent] = useState(initialPost?.content || '');
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt || '');
  const [seriesId, setSeriesId] = useState(initialPost?.seriesId || '');
  const [weekNumber, setWeekNumber] = useState(initialPost?.weekNumber?.toString() || '');
  const [status, setStatus] = useState(initialPost?.status || 'draft');
  const [selectedTags, setSelectedTags] = useState<string[]>(
    initialPost?.tags?.map((pt: any) => pt.tag.name) || []
  );
  const [tagInput, setTagInput] = useState('');
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    fetch('/api/admin/series').then(r => r.json()).then(setSeriesList);
  }, []);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!selectedTags.includes(tagInput.trim())) {
        setSelectedTags([...selectedTags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const generateSlug = () => {
    setSlug(title.replace(/[^a-zA-Z0-9一-龥-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').toLowerCase() || 'untitled');
  };

  const handleSave = async (publishStatus?: string) => {
    setSaving(true);
    const charCount = content.length;
    const url = initialPost ? `/api/admin/posts/${initialPost.id}` : '/api/admin/posts';
    const method = initialPost ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, slug, content, excerpt, seriesId: seriesId || null,
          weekNumber: weekNumber ? parseInt(weekNumber) : null,
          status: publishStatus || status,
          charCount, tags: selectedTags,
        }),
      });
      if (res.ok) {
        toast.success('保存成功！');
        if (publishStatus) setStatus(publishStatus);
        router.refresh();
      } else {
        const err = await res.json();
        toast.error(err.error || '保存失败');
      }
    } catch {
      toast.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {initialPost ? '编辑文章' : '新建文章'}
        </h1>
        <div className="flex items-center gap-3">
          <button onClick={() => setPreview(!preview)} className="btn-secondary text-sm">
            {preview ? '编辑' : '预览'}
          </button>
          <button
            onClick={() => handleSave('draft')}
            disabled={saving}
            className="btn-secondary text-sm"
          >
            保存草稿
          </button>
          <button
            onClick={() => handleSave('published')}
            disabled={saving}
            className="btn-primary text-sm"
          >
            {saving ? '保存中...' : '发布'}
          </button>
        </div>
      </div>

      {preview ? (
        <div className="card p-6">
          <h1 className="text-3xl font-bold mb-4">{title || '未命名文章'}</h1>
          <div className="prose-biojing" dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br>') }} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main editor */}
          <div className="lg:col-span-2 space-y-4">
            <input
              type="text"
              placeholder="文章标题"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => !slug && generateSlug()}
              className="w-full text-2xl font-bold px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            />
            <input
              type="text"
              placeholder="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none font-mono"
            />
            <textarea
              placeholder="文章摘要（可选）"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
              className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            />
            <textarea
              placeholder="Markdown 内容 ..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={25}
              className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none font-mono leading-relaxed"
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="card p-4 space-y-3">
              <h4 className="font-semibold text-sm text-gray-900">发布设置</h4>
              <div>
                <label className="text-xs text-gray-500">状态</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-field text-sm mt-1">
                  <option value="draft">草稿</option>
                  <option value="published">已发布</option>
                  <option value="archived">已归档</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500">系列</label>
                <select value={seriesId} onChange={(e) => setSeriesId(e.target.value)} className="input-field text-sm mt-1">
                  <option value="">无系列</option>
                  {seriesList.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500">周次</label>
                <input
                  type="number"
                  value={weekNumber}
                  onChange={(e) => setWeekNumber(e.target.value)}
                  placeholder="如：1"
                  className="input-field text-sm mt-1"
                />
              </div>
            </div>

            <div className="card p-4 space-y-3">
              <h4 className="font-semibold text-sm text-gray-900">标签</h4>
              <div className="flex flex-wrap gap-1">
                {selectedTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs"
                  >
                    {tag}
                    <button
                      onClick={() => setSelectedTags(selectedTags.filter((t) => t !== tag))}
                      className="hover:text-red-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                placeholder="添加标签后按回车"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                className="input-field text-sm"
              />
            </div>

            <div className="card p-4 text-xs text-gray-400">
              <p>字数: {content.length.toLocaleString()}</p>
              <p>预计阅读: {Math.ceil(content.length / 800)} 分钟</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
