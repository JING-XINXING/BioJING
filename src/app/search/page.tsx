import prisma from '@/lib/prisma';
import PostCard from '@/components/PostCard';

export const dynamic = 'force-dynamic';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q?.trim() || '';

  let posts: any[] = [];
  if (query) {
    posts = await prisma.post.findMany({
      where: {
        status: 'published',
        OR: [
          { title: { contains: query } },
          { content: { contains: query } },
          { excerpt: { contains: query } },
        ],
      },
      orderBy: { weekNumber: 'desc' },
      include: { series: true, tags: { include: { tag: true } } },
    });
  }

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
          <p className="text-gray-500 mb-6">找到 {posts.length} 篇相关文章</p>
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
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400">
          <p>输入关键词搜索 BioJING 文章</p>
        </div>
      )}
    </div>
  );
}
