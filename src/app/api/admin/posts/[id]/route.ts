import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.post.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
