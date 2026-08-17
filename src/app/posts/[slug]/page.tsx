import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import PostContent from '@/components/PostContent';
import PostSidebar from '@/components/PostSidebar';
import CommentSection from '@/components/CommentSection';

export const dynamic = 'force-dynamic';

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
    include: {
      series: true,
      tags: { include: { tag: true } },
      files: { orderBy: { createdAt: 'desc' } },
      comments: { where: { approved: true }, orderBy: { createdAt: 'desc' } },
    },
  });

  if (!post || post.status !== 'published') notFound();

  // Increment view count (fire-and-forget)
  prisma.post.update({
    where: { id: post.id },
    data: { viewCount: { increment: 1 } },
  }).catch(() => {});

  // Get prev/next posts in same series
  const [prevPost, nextPost] = post.seriesId
    ? await Promise.all([
        prisma.post.findFirst({
          where: { seriesId: post.seriesId, weekNumber: { lt: post.weekNumber || undefined }, status: 'published' },
          orderBy: { weekNumber: 'desc' },
          select: { title: true, slug: true },
        }),
        prisma.post.findFirst({
          where: { seriesId: post.seriesId, weekNumber: { gt: post.weekNumber || undefined }, status: 'published' },
          orderBy: { weekNumber: 'asc' },
          select: { title: true, slug: true },
        }),
      ])
    : [null, null];

  const readingTime = Math.ceil((post.charCount || 0) / 800) || 10;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Main content */}
        <article className="flex-1 min-w-0">
          {/* Header */}
          <header className="mb-8">
            {post.series && (
              <div className="text-sm text-green-600 font-medium mb-3">
                <a href={`/series/${post.series.slug}`}>{post.series.name}</a>
                {post.weekNumber && ` · Week ${post.weekNumber}`}
              </div>
            )}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              {post.title}
            </h1>
            <div className="flex items-center gap-4 mt-4 text-sm text-gray-400">
              <span>发布于 {new Date(post.publishedAt).toLocaleDateString('zh-CN')}</span>
              <span>{readingTime} 分钟阅读</span>
              <span>{post.charCount?.toLocaleString() || 0} 字</span>
            </div>
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {post.tags.map((pt) => (
                  <a key={pt.tag.slug} href={`/posts?tag=${pt.tag.slug}`} className="tag hover:bg-gray-200">
                    {pt.tag.name}
                  </a>
                ))}
              </div>
            )}
          </header>

          {/* Content */}
          <div className="prose-biojing">
            <PostContent content={post.content} />
          </div>

          {/* Prev/Next navigation */}
          {(prevPost || nextPost) && (
            <div className="flex items-center justify-between mt-12 pt-8 border-t border-gray-200">
              {prevPost ? (
                <a href={`/posts/${prevPost.slug}`} className="text-sm text-gray-500 hover:text-green-600">
                  ← {prevPost.title}
                </a>
              ) : <span />}
              {nextPost ? (
                <a href={`/posts/${nextPost.slug}`} className="text-sm text-gray-500 hover:text-green-600 text-right">
                  {nextPost.title} →
                </a>
              ) : <span />}
            </div>
          )}

          {/* Comments */}
          <section className="mt-10 pt-8 border-t border-gray-200">
            <CommentSection postId={post.id} initialComments={post.comments} />
          </section>
        </article>

        {/* Sidebar */}
        <PostSidebar post={post} />
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await prisma.post.findUnique({ where: { slug: params.slug } });
  if (!post) return { title: '404 - 文章未找到' };
  return {
    title: post.title,
    description: post.excerpt || post.title,
  };
}
