import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, SESSION_COOKIE } from '@/lib/auth';

/**
 * 统一保护后台页面与管理 API：
 * - 页面 /admin/* 未登录跳登录页；
 * - API /api/admin/* 未登录返回 401 JSON（登录接口本身放行）。
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isApi = pathname.startsWith('/api/admin');
  const isPage = pathname.startsWith('/admin');
  if (!isApi && !isPage) return NextResponse.next();

  // 登录接口必须放行，否则无法获取令牌
  if (pathname === '/api/admin/auth') return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (await verifySessionToken(token)) return NextResponse.next();

  if (isApi) return NextResponse.json({ error: '未授权，请先登录' }, { status: 401 });
  if (pathname === '/admin/login') return NextResponse.next();
  return NextResponse.redirect(new URL('/admin/login', req.url));
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
