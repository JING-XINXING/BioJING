import { Download, FileText, Film, Image, Database, Microscope } from 'lucide-react';
import Link from 'next/link';

interface PostSidebarProps {
  post: {
    id: string;
    series?: { name: string; slug: string; description?: string | null } | null;
    weekNumber?: number | null;
    files?: {
      id: string;
      filename: string;
      originalName: string;
      mimeType: string;
      size: number;
      fileType: string;
      description?: string | null;
      downloadCount: number;
    }[];
    viewCount: number;
  };
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

const fileTypeIcons: Record<string, any> = {
  image: Image,
  video: Film,
  software: Microscope,
  data: Database,
  attachment: FileText,
};

export default function PostSidebar({ post }: PostSidebarProps) {
  return (
    <aside className="w-full">
      <div className="sticky top-20 space-y-6">
        {/* Post info */}
        <div className="card p-4">
          <h4 className="font-semibold text-sm text-gray-900 mb-3">文章信息</h4>
          <div className="space-y-2 text-sm text-gray-500">
            {post.series && (
              <div className="flex justify-between">
                <span>系列</span>
                <a href={`/series/${post.series.slug}`} className="text-green-600">{post.series.name}</a>
              </div>
            )}
            {post.weekNumber && (
              <div className="flex justify-between">
                <span>周次</span>
                <span>Week {post.weekNumber}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>浏览</span>
              <span>{post.viewCount}</span>
            </div>
          </div>
        </div>

        {/* Series info */}
        {post.series && (
          <div className="card p-4">
            <h4 className="font-semibold text-sm text-gray-900 mb-2">所属系列</h4>
            <Link href={`/series/${post.series.slug}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              {post.series.name}
            </Link>
            {post.series.description && (
              <p className="text-xs text-gray-500 mt-2">{post.series.description}</p>
            )}
          </div>
        )}

        {/* Resources/Downloads */}
        {post.files && post.files.length > 0 && (
          <div className="card p-4">
            <h4 className="font-semibold text-sm text-gray-900 mb-3 flex items-center gap-2">
              <Download className="w-4 h-4" />
              资源下载 ({post.files.length})
            </h4>
            <div className="space-y-2">
              {post.files.map((file) => {
                const Icon = fileTypeIcons[file.fileType] || FileText;
                return (
                  <a
                    key={file.id}
                    href={`/api/files/${file.id}/download`}
                    className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50 group"
                  >
                    <Icon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium text-gray-700 group-hover:text-green-600 truncate">
                        {file.originalName}
                      </div>
                      <div className="text-xs text-gray-400">
                        {formatSize(file.size)}
                        {file.description && ` · ${file.description}`}
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
