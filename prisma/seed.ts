// 数据导入脚本：将 52 篇 Markdown 博文导入到数据库
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// 博文 Markdown 根目录由环境变量提供，避免把本机绝对路径写进仓库
const BLOG_DIR = process.env.BIOJING_BLOG_DIR || '';

interface WeekSpec {
  num: number;
  folder: string;
  series: string;
  series_tagline: string;
  title: string;
  filename: string;
}

const weekSpecs: WeekSpec[] = JSON.parse(
  fs.readFileSync(path.join(BLOG_DIR, 'test/week_specs.json'), 'utf8')
);

async function importPosts() {
  if (!BLOG_DIR) {
    console.error('请设置环境变量 BIOJING_BLOG_DIR 指向博文 Markdown 根目录后再导入。');
    process.exit(1);
  }
  console.log('开始导入 52 篇博文...\n');

  // 1. Create all series
  const seriesNames = [...new Set(weekSpecs.map((w) => w.series))];
  const seriesMap: Record<string, string> = {};

  const seriesSlugMap: Record<string, string> = {
    '转录组学系列': 'transcriptomics',
    '单细胞与空间组学系列': 'single-cell-spatial',
    '表观遗传组学系列': 'epigenomics',
    '基因组学系列': 'genomics',
    '免疫组库系列': 'immunomics',
    '蛋白质组学系列': 'proteomics',
    '代谢组学系列': 'metabolomics',
    '综合方法系列': 'advanced-methods',
    '年度总结': 'year-review',
  };
  for (const name of seriesNames) {
    const slug = seriesSlugMap[name] || name.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').toLowerCase();
    const series = await prisma.series.upsert({
      where: { name },
      update: { slug },
      create: { name, slug, description: `${name} – BioJING 生信硬核科普`, sortOrder: seriesNames.indexOf(name) },
    });
    seriesMap[name] = series.id;
    console.log(`  ✓ Series: ${name} → ${slug}`);
  }

  // 2. Import each post
  for (const spec of weekSpecs) {
    const mdPath = path.join(BLOG_DIR, spec.folder, spec.filename);
    if (!fs.existsSync(mdPath)) {
      console.log(`  ✗ Not found: ${mdPath}`);
      continue;
    }

    const content = fs.readFileSync(mdPath, 'utf8');
    // Generate a clean ASCII slug using the series slug mapping
    const mappedSeriesSlug = seriesSlugMap[spec.series] || spec.series
      .replace(/[^a-zA-Z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase();
    const slug = `${mappedSeriesSlug}-week-${spec.num}`;

    // Extract excerpt (first paragraph after title/header)
    const lines = content.split('\n');
    let excerpt = '';
    for (const line of lines) {
      const clean = line.trim();
      if (clean && !clean.startsWith('#') && !clean.startsWith('>') && !clean.startsWith('-') && !clean.startsWith('`') && clean.length > 20) {
        excerpt = clean.slice(0, 200);
        break;
      }
    }

    // Extract tags from content
    const tagPattern = /#[一-龥\w]+/g;
    const tagMatches = content.match(tagPattern) || [];
    const tagNames = [...new Set(tagMatches.slice(0, 10).map((t) => t.slice(1)))];

    // Upsert tags
    const tagRecords: { id: string }[] = [];
    for (const name of tagNames) {
      let tagSlug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      if (!tagSlug) tagSlug = `tag-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

      // Handle slug collision: try to find existing tag by name, or create with unique slug
      const existingByName = await prisma.tag.findUnique({ where: { name } });
      if (existingByName) {
        tagRecords.push(existingByName);
        continue;
      }

      const existingBySlug = await prisma.tag.findUnique({ where: { slug: tagSlug } });
      if (existingBySlug) {
        // Different name, same slug — append a random suffix to make it unique
        tagSlug = `${tagSlug}-${Math.random().toString(36).slice(2, 6)}`;
      }

      const created = await prisma.tag.create({ data: { name, slug: tagSlug } });
      tagRecords.push(created);
    }

    // Upsert post
    const post = await prisma.post.upsert({
      where: { slug },
      update: {
        title: spec.title,
        content,
        excerpt,
        weekNumber: spec.num,
        seriesId: seriesMap[spec.series],
        charCount: content.length,
        status: 'published',
        publishedAt: new Date(2025, 0, spec.num * 7),
      },
      create: {
        title: spec.title,
        slug,
        content,
        excerpt,
        weekNumber: spec.num,
        seriesId: seriesMap[spec.series],
        charCount: content.length,
        status: 'published',
        publishedAt: new Date(2025, 0, spec.num * 7),
      },
    });

    // Update tags
    await prisma.postTag.deleteMany({ where: { postId: post.id } });
    if (tagRecords.length > 0) {
      await prisma.postTag.createMany({
        data: tagRecords.map((t) => ({ postId: post.id, tagId: t.id })),
      });
    }

    console.log(`  ✓ Week ${spec.num}: ${spec.title.slice(0, 60)}...`);
  }

  console.log(`\n🎉 导入完成！`);
}

importPosts()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
