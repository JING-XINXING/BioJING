import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import path from 'path';
import { readFile } from 'fs/promises';

// 与上传接口统一：项目内 uploads/（被 .gitignore 忽略）
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const file = await prisma.postFile.findUnique({ where: { id: params.id } });
  if (!file) return NextResponse.json({ error: '文件未找到' }, { status: 404 });

  // Increment download count
  await prisma.postFile.update({
    where: { id: file.id },
    data: { downloadCount: { increment: 1 } },
  });

  const filePath = path.join(UPLOAD_DIR, file.storagePath);
  const buffer = await readFile(filePath);

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': file.mimeType,
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(file.originalName)}`,
      'Content-Length': String(file.size),
    },
  });
}
