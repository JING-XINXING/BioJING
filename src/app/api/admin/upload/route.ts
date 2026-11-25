import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import prisma from '@/lib/prisma';
import { isAdminRequest } from '@/lib/auth';

// 上传目录与备份口径统一：项目内 uploads/（被 .gitignore 忽略），不再写到仓库上级目录
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const MAX_SIZE = 100 * 1024 * 1024; // 100MB

/** 允许的扩展名白名单（按 fileType 分组）；不在表内的类型一律拒绝，杜绝 .html/.svg/.js 等可脚本化文件。 */
const ALLOWED_EXTENSIONS: Record<string, string[]> = {
  image: ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
  video: ['.mp4', '.webm'],
  attachment: ['.pdf', '.md', '.txt', '.zip', '.png', '.jpg', '.jpeg'],
  data: ['.csv', '.tsv', '.txt', '.json', '.zip', '.pdf', '.md', '.fa', '.fasta', '.fq', '.fastq', '.gz'],
  software: ['.zip', '.tar', '.gz', '.pdf', '.txt'],
};
const KNOWN_TYPES = Object.keys(ALLOWED_EXTENSIONS);

export async function POST(req: NextRequest) {
  if (!(await isAdminRequest(req))) return NextResponse.json({ error: '未授权，请先登录' }, { status: 401 });
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const fileType = (formData.get('fileType') as string) || 'attachment';
    const postId = formData.get('postId') as string | null;

    if (!file) return NextResponse.json({ error: '没有文件' }, { status: 400 });
    if (file.size > MAX_SIZE) return NextResponse.json({ error: '文件超过 100MB 限制' }, { status: 400 });
    if (!KNOWN_TYPES.includes(fileType)) return NextResponse.json({ error: '未知文件类型' }, { status: 400 });

    // 扩展名白名单校验（取最后一个点之后，兼容 .tar.gz）
    const lower = file.name.toLowerCase();
    const ext = lower.endsWith('.tar.gz') ? '.gz' : path.extname(lower);
    if (!ALLOWED_EXTENSIONS[fileType].includes(ext)) {
      return NextResponse.json({ error: `该类型不允许上传 ${ext || '无扩展名'} 文件` }, { status: 400 });
    }

    const typeDir = path.join(UPLOAD_DIR, fileType + 's');
    await mkdir(typeDir, { recursive: true });

    // 文件名由服务端生成（时间戳+随机后缀），不拼接用户原名，防路径穿越与同名覆盖
    const safeName = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}${ext}`;
    const filePath = path.join(typeDir, safeName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

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
