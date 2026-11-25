// BioJING 网站主配置
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 文章图片走原生 img 懒加载（见 PostContent），未使用 next/image，故不配置 remotePatterns，
  // 避免 `https + **` 通配带来的任意远程图代理风险；如改用 next/image 须按实际图床域名逐个放行。
  // 已移除原 raw-loader（未安装）与 sharp external（未安装）两处未触发的构建隐患配置。
};

module.exports = nextConfig;
