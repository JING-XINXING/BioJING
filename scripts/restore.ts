// 备份恢复脚本（对应 scripts/backup.ts 的 JSON 导出格式）
// 用法：npx tsx scripts/restore.ts <备份文件.json> --yes
// 安全约束：必须显式 --yes；恢复前会再次备份当前库到 backups/（pre-restore-*），失败可回退。
// 恢复方式：在单个事务中清空业务表后按备份重建；VisitLog/BackupLog 不恢复（属易失日志）。

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const file = process.argv[2];
  const confirmed = process.argv.includes('--yes');
  if (!file) {
    console.error('用法：npx tsx scripts/restore.ts <备份文件.json> --yes');
    process.exit(1);
  }
  if (!confirmed) {
    console.error('恢复将覆盖当前数据库业务表，必须显式加 --yes 确认。');
    process.exit(1);
  }

  const raw = await fs.readFile(file, 'utf8');
  const parsed = JSON.parse(raw);
  const data = parsed.data as Record<string, unknown[]>;
  if (!data || !Array.isArray(data.posts)) {
    console.error('备份文件格式不正确（缺少 data.posts）。');
    process.exit(1);
  }

  // 校验和（若同目录存在 <file>.sha256 则必须匹配）
  try {
    const expected = (await fs.readFile(`${file}.sha256`, 'utf8')).trim().split(/\s+/)[0];
    const actual = crypto.createHash('sha256').update(raw).digest('hex');
    if (expected !== actual) {
      console.error('备份文件 SHA-256 校验不通过，拒绝恢复。');
      process.exit(1);
    }
    console.log('SHA-256 校验通过。');
  } catch (e: unknown) {
    if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e;
    console.log('未找到 .sha256 校验文件，跳过校验（建议用 npm run backup 生成带校验的备份）。');
  }

  // 恢复前自动备份当前库，便于回退
  const backupDir = path.join(__dirname, '..', 'backups');
  await fs.mkdir(backupDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const preFile = path.join(backupDir, `pre-restore-${stamp}.json`);
  const snapshot = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    data: {
      posts: await prisma.post.findMany(),
      series: await prisma.series.findMany(),
      tags: await prisma.tag.findMany(),
      comments: await prisma.comment.findMany(),
      files: await prisma.postFile.findMany(),
      settings: await prisma.siteSetting.findMany(),
      postTags: await prisma.postTag.findMany(),
    },
  };
  await fs.writeFile(preFile, JSON.stringify(snapshot, null, 2), 'utf8');
  console.log(`已备份当前库到 ${preFile}（恢复失败可用它回退）。`);

  // 单事务恢复：先清子表再清父表，重建顺序相反
  await prisma.$transaction([
    prisma.postTag.deleteMany(),
    prisma.comment.deleteMany(),
    prisma.postFile.deleteMany(),
    prisma.visitLog.deleteMany(),
    prisma.post.deleteMany(),
    prisma.tag.deleteMany(),
    prisma.series.deleteMany(),
    prisma.siteSetting.deleteMany(),
  ]);
  const d = data as Record<string, never[]>;
  if (d.series?.length) await prisma.series.createMany({ data: d.series });
  if (d.tags?.length) await prisma.tag.createMany({ data: d.tags });
  if (d.posts?.length) await prisma.post.createMany({ data: d.posts });
  if (d.postTags?.length) await prisma.postTag.createMany({ data: d.postTags });
  if (d.files?.length) await prisma.postFile.createMany({ data: d.files });
  if (d.comments?.length) await prisma.comment.createMany({ data: d.comments });
  if (d.settings?.length) await prisma.siteSetting.createMany({ data: d.settings });

  const counts = {
    posts: await prisma.post.count(),
    series: await prisma.series.count(),
    comments: await prisma.comment.count(),
    files: await prisma.postFile.count(),
  };
  console.log(`恢复完成：${JSON.stringify(counts)}，来源 ${path.basename(file)}`);
}

main()
  .catch((e) => {
    console.error('恢复失败：', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
