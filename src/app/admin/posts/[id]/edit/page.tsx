import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import PostEditor from '@/components/PostEditor';

export const dynamic = 'force-dynamic';

export default async function EditPostPage({ params }: { params: { id: string } }) {
  const post = await prisma.post.findUnique({
    where: { id: params.id },
    include: { tags: { include: { tag: true } } },
  });

  if (!post) notFound();

  return <PostEditor post={post} />;
}
