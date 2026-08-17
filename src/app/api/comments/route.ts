import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { postId, author, content } = await req.json();
    if (!content || !postId) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    const comment = await prisma.comment.create({
      data: {
        postId,
        author: author || '匿名',
        content: content.trim(),
      },
    });

    return NextResponse.json(comment);
  } catch (error) {
    return NextResponse.json({ error: '提交失败' }, { status: 500 });
  }
}
