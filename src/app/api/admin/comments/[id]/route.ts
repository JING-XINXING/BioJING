import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isAdminRequest } from '@/lib/auth';

/** 评论审核：放行/撤下（PATCH {approved}）与删除（DELETE），均需管理员令牌。 */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await isAdminRequest(req))) return NextResponse.json({ error: '未授权，请先登录' }, { status: 401 });
  const { approved } = await req.json();
  if (typeof approved !== 'boolean') return NextResponse.json({ error: 'approved 必须为布尔值' }, { status: 400 });
  try {
    const comment = await prisma.comment.update({ where: { id: params.id }, data: { approved } });
    return NextResponse.json(comment);
  } catch {
    return NextResponse.json({ error: '评论不存在' }, { status: 404 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await isAdminRequest(req))) return NextResponse.json({ error: '未授权，请先登录' }, { status: 401 });
  try {
    await prisma.comment.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: '评论不存在' }, { status: 404 });
  }
}
