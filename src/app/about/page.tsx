import { Dna } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">关于 BioJING</h1>

      <section className="prose-biojing">
        <p>
          <strong>BioJING</strong> 是一个专注于生物信息学深度科普与专业分析服务的平台。
          我们通过52周硬核科普系列，系统性地覆盖生物信息学全领域——
          从转录组、单细胞、空间转录组，到表观遗传、基因组、免疫组库、蛋白质组和代谢组。
        </p>

        <h2>🧬 核心特色</h2>

        <h3>系统化知识体系</h3>
        <p>52周，9大系列，每个专题从实验原理到生信分析流程，再到高分文献案例，形成完整的知识闭环。</p>

        <h3>实战代码驱动</h3>
        <p>每个分析专题都附带可运行的代码示例，覆盖 R/Python/Bash 等生信常用语言与工具。</p>

        <h3>专业图表展示</h3>
        <p>提供高质量分析结果图表，包含火山图、热图、富集分析、UMAP可视化、细胞通讯网络等。</p>

        <h3>资源共享</h3>
        <p>提供配套的数据文件、示例代码、软件工具等资源下载，方便读者实践操作。</p>

        <h2>📅 52周内容规划</h2>
        <table>
          <thead>
            <tr><th>周次</th><th>系列</th><th>内容</th></tr>
          </thead>
          <tbody>
            <tr><td>Week 1-8</td><td>转录组学系列</td><td>RNA-seq、LncRNA、CircRNA、Small RNA、WGCNA、多组学整合</td></tr>
            <tr><td>Week 9-16</td><td>单细胞与空间组学系列</td><td>scRNA-seq、免疫组、空间转录组、多组学整合</td></tr>
            <tr><td>Week 17-24</td><td>表观遗传组学系列</td><td>WGBS、RRBS、ATAC-seq、ChIP-seq、CUT&Tag</td></tr>
            <tr><td>Week 25-32</td><td>基因组学系列</td><td>WES、WGS、变异解读、肿瘤基因组、CNV/SV、病毒整合</td></tr>
            <tr><td>Week 33-38</td><td>免疫组库系列</td><td>TCR/BCR分析、单细胞VDJ、临床应用</td></tr>
            <tr><td>Week 39-44</td><td>蛋白质组学系列</td><td>质谱蛋白组、Olink、磷酸化、蛋白互作、整合分析</td></tr>
            <tr><td>Week 45-48</td><td>代谢组学系列</td><td>非靶向/靶向代谢组、脂质组、代谢-转录整合</td></tr>
            <tr><td>Week 49-52</td><td>综合方法系列</td><td>CRISPR筛选、机器学习、三维基因组、年度总结</td></tr>
          </tbody>
        </table>

        <h2>🔬 分析服务</h2>
        <p>我们提供专业的生物信息学分析服务，包括但不限于：</p>
        <ul>
          <li>转录组差异表达与功能富集分析</li>
          <li>单细胞转录组全流程分析（Seurat/Scanpy）</li>
          <li>空间转录组分析与可视化</li>
          <li>表观遗传组学分析（甲基化/ATAC/ChIP）</li>
          <li>基因组变异检测与注释</li>
          <li>免疫组库 TCR/BCR 分析</li>
          <li>蛋白质组学与代谢组学分析</li>
          <li>多组学整合分析</li>
          <li>定制化分析方案与论文图表支持</li>
        </ul>

        <h2>📬 联系方式</h2>
        <p>
          如需分析服务或合作咨询，欢迎通过以下方式联系：
        </p>
        <ul>
          <li>邮箱：contact@biojing.com</li>
          <li>微信公众号：BioJING 生信科普</li>
          <li>知乎专栏：BioJING 生信工作室</li>
        </ul>
      </section>
    </div>
  );
}
