import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { path, ip, userAgent, referer, postId } = await req.json();

    await prisma.visitLog.create({
      data: {
        path: path || '/',
        ip: ip || 'unknown',
        userAgent,
        referer,
        postId: postId || null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
