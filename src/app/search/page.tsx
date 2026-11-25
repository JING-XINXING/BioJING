import prisma from '@/lib/prisma';
import PostCard from '@/components/PostCard';

export const dynamic = 'force-dynamic';

const SEARCH_PAGE_SIZE = 12;
/** 单次查询上界，防止大结果集全量返回（v1.2 R4）。 */
const SEARCH_FETCH_CAP = 200;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string };
}) {
  const query = searchParams.q?.trim() || '';
  const page = Math.max(1, parseInt(searchParams.page || '1') || 1);

  type PostRow = Awaited<ReturnType<typeof prisma.post.findMany>>[number];
  let total = 0;
  let pagePosts: PostRow[] = [];
  let totalPages = 1;
  if (query) {
    const include = { series: true, tags: { include: { tag: true } } } as const;
    // 标题命中优先、正文命中其次，合并去重后分页
    const [titleHits, contentHits] = await Promise.all([
      prisma.post.findMany({
        where: { status: 'published', title: { contains: query } },
        orderBy: { weekNumber: 'desc' }, take: SEARCH_FETCH_CAP, include,
      }),
      prisma.post.findMany({
        where: { status: 'published', OR: [{ content: { contains: query } }, { excerpt: { contains: query } }] },
        orderBy: { weekNumber: 'desc' }, take: SEARCH_FETCH_CAP, include,
      }),
    ]);
    const seen = new Set<string>();
    const merged: PostRow[] = [];
    for (const post of [...titleHits, ...contentHits]) {
      if (seen.has(post.id)) continue;
      seen.add(post.id);
      merged.push(post);
    }
    total = merged.length;
    totalPages = Math.max(1, Math.ceil(total / SEARCH_PAGE_SIZE));
    pagePosts = merged.slice((page - 1) * SEARCH_PAGE_SIZE, page * SEARCH_PAGE_SIZE);
  }
  const posts = pagePosts;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">搜索</h1>
      <form method="get" action="/search" className="mb-8">
        <div className="relative max-w-xl">
          <input
            name="q"
            type="text"
            defaultValue={query}
            placeholder="搜索文章标题、内容..."
            className="input-field pr-20"
          />
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary text-sm py-1.5">
            搜索
          </button>
        </div>
      </form>

      {query ? (
        <div>
          <p className="text-gray-500 mb-6">找到 {total} 篇相关文章（第 {page}/{totalPages} 页）</p>
          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400">
              <p className="text-lg">没有找到相关文章</p>
              <p className="text-sm mt-2">试试其他关键词</p>
            </div>
          )}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              {page > 1 && (
                <a href={`/search?q=${encodeURIComponent(query)}&page=${page - 1}`} className="btn-secondary text-sm">上一页</a>
              )}
              <span className="text-sm text-gray-400">{page} / {totalPages}</span>
              {page < totalPages && (
                <a href={`/search?q=${encodeURIComponent(query)}&page=${page + 1}`} className="btn-secondary text-sm">下一页</a>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400">
          <p>输入关键词搜索 BioJING 文章</p>
        </div>
      )}
    </div>
  );
}
