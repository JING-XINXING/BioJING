import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isAdminRequest } from '@/lib/auth';

export async function POST(req: NextRequest) {
  if (!(await isAdminRequest(req))) return NextResponse.json({ error: '未授权，请先登录' }, { status: 401 });
  try {
    const formData = await req.formData();
    const type = formData.get('type') as string || 'db';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${type}-${timestamp}.json`;

    if (type === 'db') {
      // Export database as JSON
      const data = await exportDatabase();
      // Save to backup log
      const size = Buffer.byteLength(JSON.stringify(data), 'utf8');
      await prisma.backupLog.create({
        data: { filename, size, type, status: 'success' },
      });
      return NextResponse.json({ message: '备份成功', filename, records: size });
    }

    if (type === 'full') {
      const data = await exportDatabase();
      const size = Buffer.byteLength(JSON.stringify(data), 'utf8');
      await prisma.backupLog.create({
        data: { filename, size, type, status: 'success' },
      });
      return NextResponse.json({ message: '完整备份成功（含上传文件需手动复制）', filename });
    }

    return NextResponse.json({ error: '未知备份类型' }, { status: 400 });
  } catch (error: any) {
    await prisma.backupLog.create({
      data: {
        filename: `backup-error-${Date.now()}`,
        size: 0,
        type: 'db',
        status: 'failed',
        error: error.message,
      },
    });
    return NextResponse.json({ error: '备份失败' }, { status: 500 });
  }
}

async function exportDatabase() {
  const [posts, series, tags, comments, files, settings, postTags] = await Promise.all([
    prisma.post.findMany(),
    prisma.series.findMany(),
    prisma.tag.findMany(),
    prisma.comment.findMany(),
    prisma.postFile.findMany(),
    prisma.siteSetting.findMany(),
    prisma.postTag.findMany(),
  ]);

  // Save to file
  const { mkdir, writeFile } = await import('fs/promises');
  const { join } = await import('path');
  // 与 scripts/backup.ts 统一：项目内 backups/（被 .gitignore 忽略）
  const backupDir = join(process.cwd(), 'backups');
  await mkdir(backupDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `backup-db-${timestamp}.json`;
  const filepath = join(backupDir, filename);

  const exportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    data: { posts, series, tags, comments, files, settings, postTags },
  };

  await writeFile(filepath, JSON.stringify(exportData, null, 2), 'utf8');

  return exportData;
}
