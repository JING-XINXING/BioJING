import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const posts = await prisma.post.findMany({
    orderBy: { weekNumber: 'desc' },
  });
  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { title, slug, content, excerpt, seriesId, weekNumber, status, charCount, tags: tagNames } = data;

    if (!title || !slug) {
      return NextResponse.json({ error: '标题和 slug 为必填项' }, { status: 400 });
    }

    // Upsert tags
    const tagRecords = await Promise.all(
      (tagNames || []).map(async (name: string) => {
        const tagSlug = name.toLowerCase().replace(/\s+/g, '-');
        return prisma.tag.upsert({
          where: { name },
          update: {},
          create: { name, slug: tagSlug },
        });
      })
    );

    const post = await prisma.post.create({
      data: {
        title,
        slug,
        content: content || '',
        excerpt,
        seriesId: seriesId || null,
        weekNumber: weekNumber || null,
        status: status || 'draft',
        charCount: charCount || content?.length || 0,
        tags: {
          create: tagRecords.map((tag) => ({ tagId: tag.id })),
        },
      },
      include: { tags: true },
    });

    return NextResponse.json(post);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'slug 已存在' }, { status: 400 });
    }
    return NextResponse.json({ error: '创建失败' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    const { id, title, slug, content, excerpt, seriesId, weekNumber, status, charCount, tags: tagNames } = data;

    // Update tags
    if (tagNames) {
      await prisma.postTag.deleteMany({ where: { postId: id } });
      const tagRecords = await Promise.all(
        tagNames.map(async (name: string) => {
          const tagSlug = name.toLowerCase().replace(/\s+/g, '-');
          return prisma.tag.upsert({
            where: { name },
            update: {},
            create: { name, slug: tagSlug },
          });
        })
      );
      await prisma.postTag.createMany({
        data: tagRecords.map((tag) => ({ postId: id, tagId: tag.id })),
      });
    }

    const post = await prisma.post.update({
      where: { id },
      data: {
        title, slug, content: content || '', excerpt,
        seriesId: seriesId || null, weekNumber: weekNumber || null,
        status: status || 'draft', charCount: charCount || content?.length || 0,
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json({ error: '更新失败' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await prisma.post.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
