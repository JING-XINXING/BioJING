import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminSeriesPage() {
  const series = await prisma.series.findMany({
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { posts: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">系列管理</h1>
        <form
          action="/api/admin/series"
          method="POST"
          className="flex items-center gap-2"
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const name = (form.elements.namedItem('name') as HTMLInputElement).value;
            const slug = name.toLowerCase().replace(/\s+/g, '-');
            await fetch('/api/admin/series', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name, slug }),
            });
            location.reload();
          }}
        >
          <input name="name" placeholder="系列名称" className="input-field text-sm w-48" required />
          <button type="submit" className="btn-primary text-sm py-1.5">添加</button>
        </form>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-600">名称</th>
                <th className="px-4 py-3 font-medium text-gray-600">Slug</th>
                <th className="px-4 py-3 font-medium text-gray-600">文章数</th>
                <th className="px-4 py-3 font-medium text-gray-600">排序</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {series.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-700">{s.name}</td>
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">{s.slug}</td>
                  <td className="px-4 py-3 text-gray-500">{s._count.posts}</td>
                  <td className="px-4 py-3 text-gray-400">{s.sortOrder}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
