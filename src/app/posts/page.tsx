import prisma from '@/lib/prisma';
import Link from 'next/link';
import PostCard from '@/components/PostCard';

export const dynamic = 'force-dynamic';

export default async function PostsPage({
  searchParams,
}: {
  searchParams: { series?: string; tag?: string; page?: string };
}) {
  const page = parseInt(searchParams.page || '1');
  const pageSize = 12;
  const where: any = { status: 'published' };

  if (searchParams.series) {
    where.series = { slug: searchParams.series };
  }
  if (searchParams.tag) {
    where.tags = { some: { tag: { slug: searchParams.tag } } };
  }

  const [posts, total, series, tags] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: { weekNumber: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { series: true, tags: { include: { tag: true } } },
    }),
    prisma.post.count({ where }),
    prisma.series.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.tag.findMany({ orderBy: { name: 'asc' } }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">全部博文</h1>
      <p className="text-gray-500 mb-8">共 {total} 篇文章</p>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters sidebar */}
        <div className="lg:w-56 shrink-0">
          <div className="sticky top-20 space-y-6">
            {/* Series filter */}
            <div>
              <h4 className="font-semibold text-sm text-gray-900 mb-3">系列</h4>
              <div className="space-y-1">
                <Link
                  href="/posts"
                  className={`block text-sm py-1 ${
                    !searchParams.series ? 'text-green-600 font-medium' : 'text-gray-500 hover:text-green-600'
                  }`}
                >
                  全部
                </Link>
                {series.map((s) => (
                  <Link
                    key={s.id}
                    href={`/posts?series=${s.slug}`}
                    className={`block text-sm py-1 ${
                      searchParams.series === s.slug
                        ? 'text-green-600 font-medium'
                        : 'text-gray-500 hover:text-green-600'
                    }`}
                  >
                    {s.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Tags filter */}
            <div>
              <h4 className="font-semibold text-sm text-gray-900 mb-3">标签</h4>
              <div className="flex flex-wrap gap-1">
                {tags.map((t) => (
                  <Link
                    key={t.id}
                    href={`/posts?tag=${t.slug}`}
                    className={`tag text-xs ${
                      searchParams.tag === t.slug
                        ? 'bg-green-100 text-green-700'
                        : 'hover:bg-gray-200'
                    }`}
                  >
                    {t.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Posts grid */}
        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              {page > 1 && (
                <Link
                  href={`/posts?page=${page - 1}${searchParams.series ? `&series=${searchParams.series}` : ''}${searchParams.tag ? `&tag=${searchParams.tag}` : ''}`}
                  className="btn-secondary text-sm"
                >
                  上一页
                </Link>
              )}
              <span className="text-sm text-gray-400">
                {page} / {totalPages}
              </span>
              {page < totalPages && (
                <Link
                  href={`/posts?page=${page + 1}${searchParams.series ? `&series=${searchParams.series}` : ''}${searchParams.tag ? `&tag=${searchParams.tag}` : ''}`}
                  className="btn-secondary text-sm"
                >
                  下一页
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
