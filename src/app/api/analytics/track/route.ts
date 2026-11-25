import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * 访问埋点：IP/UA/来源一律以服务端请求头为准，不信任客户端上报字段（防伪造污染统计）。
 * 仅接受站内路径与可选文章 ID，超长字段截断。
 */
export async function POST(req: NextRequest) {
  try {
    const { path, postId } = await req.json();
    if (typeof path !== 'string' || !path.startsWith('/') || path.length > 512) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    // postId 须真实存在才关联，避免伪造 ID 触发外键错误
    const validPostId =
      typeof postId === 'string'
        ? (await prisma.post.findUnique({ where: { id: postId }, select: { id: true } }))?.id ?? null
        : null;
    await prisma.visitLog.create({
      data: {
        path,
        ip: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown',
        userAgent: req.headers.get('user-agent')?.slice(0, 512),
        referer: req.headers.get('referer')?.slice(0, 512),
        postId: validPostId,
      },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
