import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminPassword, createSessionToken, SESSION_COOKIE } from '@/lib/auth';

/** 管理员登录：口令校验通过后签发签名令牌（7 天），Cookie 只存令牌不存口令。 */
export async function POST(req: NextRequest) {
  const { password } = await req.json();

  if (typeof password === 'string' && verifyAdminPassword(password)) {
    const token = await createSessionToken();
    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });
    return res;
  }

  return NextResponse.json({ error: '密码错误' }, { status: 401 });
}
