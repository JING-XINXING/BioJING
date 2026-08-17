'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function FileUploader({ postId }: { postId?: string }) {
  const [uploading, setUploading] = useState(false);
  const [fileType, setFileType] = useState('attachment');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileType', fileType);
    if (postId) formData.append('postId', postId);

    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      if (res.ok) {
        toast.success('上传成功！');
        window.location.reload();
      } else {
        const err = await res.json();
        toast.error(err.error || '上传失败');
      }
    } catch {
      toast.error('上传失败');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="card p-4">
      <h4 className="font-semibold text-sm text-gray-900 mb-3">上传文件</h4>
      <div className="space-y-3">
        <select value={fileType} onChange={(e) => setFileType(e.target.value)} className="input-field text-sm">
          <option value="attachment">附件</option>
          <option value="image">图片</option>
          <option value="video">视频</option>
          <option value="software">软件</option>
          <option value="data">数据</option>
        </select>
        <label className="block">
          <input
            type="file"
            onChange={handleUpload}
            disabled={uploading}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
          />
        </label>
        {uploading && <p className="text-xs text-gray-400">上传中...</p>}
        <p className="text-xs text-gray-400">
          支持图片、文档、压缩包、视频等格式，单文件最大 100MB
        </p>
      </div>
    </div>
  );
}
