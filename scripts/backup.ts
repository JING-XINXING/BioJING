// 周期性备份脚本
// 用法：npx tsx scripts/backup.ts [db|full]
// 配合 cron 或系统定时任务使用

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

async function backup(type: 'db' | 'full' = 'db') {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  // 备份目录固定在项目内 backups/，避免写到仓库上级目录
  const backupDir = path.join(__dirname, '..', 'backups');
  await fs.mkdir(backupDir, { recursive: true });

  console.log(`[${new Date().toISOString()}] 开始备份 (type=${type})...`);

  try {
    // Export database
    const [posts, series, tags, comments, files, settings, postTags, backupLogs, visitLogs] = await Promise.all([
      prisma.post.findMany(),
      prisma.series.findMany(),
      prisma.tag.findMany(),
      prisma.comment.findMany(),
      prisma.postFile.findMany(),
      prisma.siteSetting.findMany(),
      prisma.postTag.findMany(),
      prisma.backupLog.findMany(),
      prisma.visitLog.findMany(),
    ]);

    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      data: { posts, series, tags, comments, files, settings, postTags, backupLogs, visitLogs },
    };

    const filename = `backup-${type}-${timestamp}.json`;
    const filepath = path.join(backupDir, filename);
    const payload = JSON.stringify(exportData, null, 2);
    await fs.writeFile(filepath, payload, 'utf8');

    // SHA-256 校验文件 + 记录计数清单，供恢复时核对（v1.1 E4）
    const sha256 = crypto.createHash('sha256').update(payload).digest('hex');
    await fs.writeFile(`${filepath}.sha256`, `${sha256}  ${filename}\n`, 'utf8');
    const counts = {
      posts: posts.length, series: series.length, tags: tags.length,
      comments: comments.length, files: files.length, settings: settings.length,
    };
    console.log(`  记录计数: ${JSON.stringify(counts)}，SHA-256: ${sha256.slice(0, 12)}…`);

    // 完整备份：同时复制 uploads/ 到同名目录（旧实现只导出 JSON，恢复不了文件）
    if (type === 'full') {
      const uploadsDir = path.join(__dirname, '..', 'uploads');
      const target = path.join(backupDir, `backup-full-${timestamp}-uploads`);
      try {
        await fs.cp(uploadsDir, target, { recursive: true });
        console.log(`  已打包 uploads/ → ${path.basename(target)}`);
      } catch {
        console.log('  uploads/ 不存在，跳过文件打包');
      }
    }

    const stats = await fs.stat(filepath);

    await prisma.backupLog.create({
      data: { filename, size: stats.size, type, status: 'success' },
    });

    console.log(`✅ 备份成功: ${filename} (${(stats.size / 1024).toFixed(1)} KB)`);

    // Clean old backups (keep last 10)
    const allBackups = await fs.readdir(backupDir);
    const backupFiles = allBackups
      .filter((f) => f.startsWith('backup-') && f.endsWith('.json'))
      .sort()
      .reverse();

    for (const oldFile of backupFiles.slice(10)) {
      await fs.unlink(path.join(backupDir, oldFile));
      console.log(`  🗑️  清理旧备份: ${oldFile}`);
    }
  } catch (error: any) {
    console.error(`❌ 备份失败: ${error.message}`);
    await prisma.backupLog.create({
      data: {
        filename: `backup-error-${timestamp}`,
        size: 0,
        type,
        status: 'failed',
        error: error.message,
      },
    });
  } finally {
    await prisma.$disconnect();
  }
}

const type = (process.argv[2] as 'db' | 'full') || 'db';
backup(type);
