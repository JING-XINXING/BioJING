import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminPassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  // 密码必须与 .env 中的 ADMIN_PASSWORD 一致，源码不提供默认口令
  if (typeof password === 'string' && verifyAdminPassword(password)) {
    const res = NextResponse.json({ ok: true });
    res.cookies.set('biojing_token', password, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    return res;
  }

  return NextResponse.json({ error: '密码错误' }, { status: 401 });
}
