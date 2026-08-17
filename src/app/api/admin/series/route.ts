import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const series = await prisma.series.findMany({ orderBy: { sortOrder: 'asc' } });
  return NextResponse.json(series);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const series = await prisma.series.create({
    data: { name: data.name, slug: data.slug, description: data.description, tagline: data.tagline, sortOrder: data.sortOrder || 0 },
  });
  return NextResponse.json(series);
}
