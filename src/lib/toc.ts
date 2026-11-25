/** 从 Markdown 正文提取二级/三级标题生成目录（锚点规则与 rehype-slug 的 github-slugger 对齐近似）。 */

export interface TocItem {
  level: 2 | 3;
  text: string;
  slug: string;
}

/** 把标题文本转锚点：小写、去掉标点（保留中文与字母数字）、空格转连字符。 */
export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[`*_~]/g, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-');
}

/** 提取 TOC；跳过代码块内的伪标题，重复标题追加序号后缀与 github-slugger 行为一致。 */
export function extractToc(content: string): TocItem[] {
  const items: TocItem[] = [];
  const seen = new Map<string, number>();
  let inFence = false;
  for (const line of content.split('\n')) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const m = /^(#{2,3})\s+(.+?)\s*$/.exec(line);
    if (!m) continue;
    const text = m[2].replace(/\[(.+?)\]\(.+?\)/g, '$1');
    let slug = slugifyHeading(text);
    const count = seen.get(slug) || 0;
    seen.set(slug, count + 1);
    if (count > 0) slug = `${slug}-${count}`;
    items.push({ level: m[1].length as 2 | 3, text, slug });
  }
  return items;
}
