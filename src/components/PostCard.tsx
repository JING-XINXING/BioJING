import Link from 'next/link';
import { Calendar, Eye, Tag } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface PostCardProps {
  post: {
    id: string;
    title: string;
    slug: string;
    excerpt?: string | null;
    coverImage?: string | null;
    weekNumber?: number | null;
    viewCount: number;
    publishedAt: Date;
    charCount: number;
    series?: { name: string; slug: string } | null;
    tags?: { tag: { name: string; slug: string } }[];
  };
}

export default function PostCard({ post }: PostCardProps) {
  const readingTime = Math.ceil(post.charCount / 800) || 5;

  return (
    <Link href={`/posts/${post.slug}`} className="card p-6 block group">
      {post.series && (
        <div className="text-xs text-green-600 font-medium mb-2">{post.series.name}</div>
      )}
      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors leading-snug">
        {post.title}
      </h3>
      {post.excerpt && (
        <p className="mt-2 text-sm text-gray-500 line-clamp-2">{post.excerpt}</p>
      )}
      <div className="flex items-center gap-4 mt-4 text-xs text-gray-400">
        {post.weekNumber && (
          <span className="bg-gray-100 px-2 py-0.5 rounded-full">Week {post.weekNumber}</span>
        )}
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {format(new Date(post.publishedAt), 'MM/dd', { locale: zhCN })}
        </span>
        <span className="flex items-center gap-1">
          <Eye className="w-3 h-3" />
          {post.viewCount}
        </span>
        <span>{readingTime} 分钟阅读</span>
      </div>
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {post.tags.slice(0, 3).map((pt) => (
            <span key={pt.tag.slug} className="tag">{pt.tag.name}</span>
          ))}
        </div>
      )}
    </Link>
  );
}
