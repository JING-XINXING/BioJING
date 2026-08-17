import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'BioJING - 生信硬核科普',
    template: '%s | BioJING',
  },
  description: '52周生信硬核科普，涵盖转录组、单细胞、空间转录组、表观遗传、基因组、免疫组库、蛋白质组、代谢组等生物信息学全领域深度分析教程与资源分享。',
  keywords: ['生物信息学', '生信', '转录组', '单细胞', '表观遗传', '基因组', '免疫组库', '蛋白质组', '代谢组', 'RNA-seq', 'scRNA-seq'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
