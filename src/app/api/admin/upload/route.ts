import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import prisma from '@/lib/prisma';

const UPLOAD_DIR = path.join(process.cwd(), '..', 'uploads');
const MAX_SIZE = 100 * 1024 * 1024; // 100MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const fileType = formData.get('fileType') as string || 'attachment';
    const postId = formData.get('postId') as string | null;

    if (!file) {
      return NextResponse.json({ error: '没有文件' }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: '文件超过 100MB 限制' }, { status: 400 });
    }

    // Ensure upload dir exists
    const typeDir = path.join(UPLOAD_DIR, fileType + 's');
    await mkdir(typeDir, { recursive: true });

    // Unique filename
    const timestamp = Date.now();
    const ext = path.extname(file.name);
    const safeName = `${timestamp}_${path.basename(file.name, ext).replace(/[^a-zA-Z0-9一-龥_-]/g, '_')}${ext}`;
    const filePath = path.join(typeDir, safeName);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    // Save to database
    const record = await prisma.postFile.create({
      data: {
        postId: postId || null,
        filename: safeName,
        originalName: file.name,
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
        fileType,
        storagePath: `${fileType}s/${safeName}`,
      },
    });

    return NextResponse.json(record);
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: '上传失败' }, { status: 500 });
  }
}
