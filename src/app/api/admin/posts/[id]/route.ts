import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isAdminRequest } from '@/lib/auth';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await isAdminRequest(req))) return NextResponse.json({ error: '未授权，请先登录' }, { status: 401 });
  try {
    await prisma.post.delete({ where: { id: params.id } });
  } catch {
    return NextResponse.json({ error: '文章不存在或删除失败' }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
