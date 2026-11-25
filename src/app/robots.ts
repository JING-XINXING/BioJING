import type { MetadataRoute } from 'next';

/** robots：放行公开页、禁后台与 API，后附 sitemap 地址（v1.2 R2）。 */
export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:30001';
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api'] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
