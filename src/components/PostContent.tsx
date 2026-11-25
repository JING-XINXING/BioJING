'use client';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import { useEffect } from 'react';
import CodeBlock from './CodeBlock';

/**
 * 净化策略：在默认白名单基础上放行代码高亮与 Mermaid 所需的 class，
 * 其余原始 HTML（脚本、事件属性、javascript: 链接等）在rehype-raw 之后一律剥离，防存储型 XSS。
 */
const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    div: [...(defaultSchema.attributes?.div || []), 'className'],
    pre: [...(defaultSchema.attributes?.pre || []), 'className'],
    code: [...(defaultSchema.attributes?.code || []), 'className'],
    span: [...(defaultSchema.attributes?.span || []), 'className'],
  },
};

/** 文章 Markdown 渲染：GFM + 原始 HTML 净化 + 代码高亮 + 标题锚点 + Mermaid 按需渲染。 */
export default function PostContent({ content }: { content: string }) {
  useEffect(() => {
    // 仅当文章含 Mermaid 代码块时才动态加载 mermaid（体积大，不阻塞无图文章首屏）
    if (!content.includes('```mermaid')) return;
    let cancelled = false;
    import('mermaid').then(async (m) => {
      if (cancelled) return;
      m.default.initialize({ startOnLoad: false, theme: 'default' });
      await m.default.run({ querySelector: '.mermaid' });
    }).catch(() => {
      // 加载/渲染失败时图表降级为原始代码文本，不影响正文阅读
    });
    return () => { cancelled = true; };
  }, [content]);

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema], rehypeHighlight, rehypeSlug]}
      components={{
        pre({ children }) {
          // Mermaid 代码块不包深色 pre/复制按钮，交给下方 code 组件渲染为图表容器
          const child = Array.isArray(children) ? children[0] : children;
          if (child?.props?.className?.includes('language-mermaid')) return <>{children}</>;
          return <CodeBlock><pre>{children}</pre></CodeBlock>;
        },
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          if (match && match[1] === 'mermaid') {
            return (
              <div className="mermaid-container">
                <pre className="mermaid">{String(children).replace(/\n$/, '')}</pre>
              </div>
            );
          }
          return (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
        table({ children }) {
          return (
            <div className="overflow-x-auto my-6">
              <table>{children}</table>
            </div>
          );
        },
        img({ src, alt }) {
          return (
            // 文章图片为外链/本地混合来源，沿用原生 img 懒加载（未使用 next/image）
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt={alt || ''}
              className="max-w-full rounded-lg my-4"
              loading="lazy"
            />
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
