import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminPassword } from '@/lib/auth';

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith('/admin')) {
    const token = req.cookies.get('biojing_token')?.value;
    // 未登录或密码不匹配时，仅放行登录页
    if (!token || !verifyAdminPassword(token)) {
      if (req.nextUrl.pathname === '/admin/login') return NextResponse.next();
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
