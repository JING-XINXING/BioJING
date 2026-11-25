// TOC 提取单测（对应计划 v1.2 R3）
import { describe, it, expect } from 'vitest';
import { extractToc, slugifyHeading } from '../../src/lib/toc';

describe('extractToc', () => {
  it('提取二三级标题并跳过代码块内伪标题', () => {
    const md = ['# 一级不入目录', '## 数据清洗', '正文', '```bash', '## 不是标题', '```', '### 质控指标'].join('\n');
    expect(extractToc(md)).toEqual([
      { level: 2, text: '数据清洗', slug: '数据清洗' },
      { level: 3, text: '质控指标', slug: '质控指标' },
    ]);
  });

  it('重复标题追加序号后缀', () => {
    const md = '## 方法\n## 方法';
    expect(extractToc(md).map((i) => i.slug)).toEqual(['方法', '方法-1']);
  });
});

describe('slugifyHeading', () => {
  it('英文标题小写连字符化，中文保留', () => {
    expect(slugifyHeading('RNA-seq Analysis 流程')).toBe('rna-seq-analysis-流程');
  });
});
