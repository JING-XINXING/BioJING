import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { unlink } from 'fs/promises';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), '..', 'uploads');

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const file = await prisma.postFile.findUnique({ where: { id: params.id } });
    if (file) {
      // Delete physical file
      const filePath = path.join(UPLOAD_DIR, file.storagePath);
      await unlink(filePath).catch(() => {});
      await prisma.postFile.delete({ where: { id: params.id } });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: '删除失败' }, { status: 500 });
  }
}
