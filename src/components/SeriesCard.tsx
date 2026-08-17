import Link from 'next/link';
import { BookOpen } from 'lucide-react';

interface SeriesCardProps {
  series: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    tagline?: string | null;
    coverImage?: string | null;
  };
  postCount: number;
}

const seriesColors: Record<string, string> = {
  '转录组学系列': 'from-green-500 to-emerald-600',
  '单细胞与空间组学系列': 'from-blue-500 to-cyan-600',
  '表观遗传组学系列': 'from-purple-500 to-pink-600',
  '基因组学系列': 'from-orange-500 to-red-600',
  '免疫组库系列': 'from-teal-500 to-green-600',
  '蛋白质组学系列': 'from-indigo-500 to-purple-600',
  '代谢组学系列': 'from-amber-500 to-orange-600',
  '综合方法系列': 'from-gray-600 to-slate-700',
  '年度总结': 'from-rose-500 to-pink-600',
};

export default function SeriesCard({ series, postCount }: SeriesCardProps) {
  const gradient = seriesColors[series.name] || 'from-green-500 to-blue-600';

  return (
    <Link href={`/series/${series.slug}`} className="card p-5 block group">
      <div className={`h-2 rounded-full bg-gradient-to-r ${gradient} mb-4`} />
      <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
        {series.name}
      </h3>
      {series.tagline && (
        <p className="text-xs text-gray-500 mt-1">{series.tagline}</p>
      )}
      <div className="flex items-center gap-1 mt-3 text-xs text-gray-400">
        <BookOpen className="w-3 h-3" />
        {postCount} 篇文章
      </div>
    </Link>
  );
}
