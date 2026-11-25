import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/** 评论长度上限（字符）。 */
const MAX_CONTENT = 1000;
const MAX_AUTHOR = 30;
/** 限频：同一来源 60 秒内最多提交次数（进程内计数，单机部署适用；多实例需换共享存储）。 */
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;
const hits = new Map<string, number[]>();

/** 滑动窗口限频检查，返回 true 表示应拒绝。 */
function rateLimited(key: string): boolean {
  const now = Date.now();
  const list = (hits.get(key) || []).filter((t) => now - t < RATE_WINDOW_MS);
  list.push(now);
  hits.set(key, list);
  return list.length > RATE_LIMIT;
}

/** 发表评论：默认待审核（approved=false），后台放行后才在前台可见。 */
export async function POST(req: NextRequest) {
  try {
    const { postId, author, content } = await req.json();
    const text = typeof content === 'string' ? content.trim() : '';
    const name = typeof author === 'string' ? author.trim() : '';
    if (!postId || !text) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }
    if (text.length > MAX_CONTENT || name.length > MAX_AUTHOR) {
      return NextResponse.json({ error: `评论过长（正文≤${MAX_CONTENT}字，昵称≤${MAX_AUTHOR}字）` }, { status: 400 });
    }
    const source = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
    if (rateLimited(source)) {
      return NextResponse.json({ error: '提交过于频繁，请稍后再试' }, { status: 429 });
    }
    // 仅允许给已发布文章评论，伪造 postId 直接拒绝
    const post = await prisma.post.findFirst({ where: { id: postId, status: 'published' }, select: { id: true } });
    if (!post) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 });
    }
    const comment = await prisma.comment.create({
      data: { postId, author: name || '匿名', content: text, approved: false },
    });
    return NextResponse.json({ ...comment, pending: true });
  } catch {
    return NextResponse.json({ error: '提交失败' }, { status: 500 });
  }
}
