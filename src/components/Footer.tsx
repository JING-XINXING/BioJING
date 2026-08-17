import Link from 'next/link';
import { Dna } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Dna className="w-6 h-6 text-green-600" />
              <span className="text-lg font-bold text-gray-900">BioJING</span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed max-w-md">
              52周生信硬核科普，涵盖转录组、单细胞、空间转录组、表观遗传、基因组、免疫组库、蛋白质组、代谢组等生物信息学全领域深度分析教程。
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">快速链接</h4>
            <div className="flex flex-col gap-2">
              <Link href="/posts" className="text-sm text-gray-500 hover:text-green-600">全部博文</Link>
              <Link href="/series" className="text-sm text-gray-500 hover:text-green-600">系列专题</Link>
              <Link href="/about" className="text-sm text-gray-500 hover:text-green-600">关于我们</Link>
              <Link href="/search" className="text-sm text-gray-500 hover:text-green-600">搜索</Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">热门系列</h4>
            <div className="flex flex-col gap-2">
              <Link href="/series/transcriptomics" className="text-sm text-gray-500 hover:text-green-600">转录组学系列</Link>
              <Link href="/series/single-cell-spatial" className="text-sm text-gray-500 hover:text-green-600">单细胞与空间组学</Link>
              <Link href="/series/epigenomics" className="text-sm text-gray-500 hover:text-green-600">表观遗传组学</Link>
              <Link href="/series/genomics" className="text-sm text-gray-500 hover:text-green-600">基因组学系列</Link>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} BioJING. 生信硬核科普 · 专业分析服务.
          </p>
        </div>
      </div>
    </footer>
  );
}
