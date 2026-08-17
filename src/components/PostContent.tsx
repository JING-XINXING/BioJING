'use client';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import { useEffect } from 'react';

export default function PostContent({ content }: { content: string }) {
  useEffect(() => {
    // Render Mermaid diagrams
    if ((window as any).mermaid) {
      (window as any).mermaid.run({
        querySelector: '.mermaid',
      });
    }
  }, [content]);

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight, rehypeSlug, rehypeRaw]}
      components={{
        pre({ children }) {
          return <pre>{children}</pre>;
        },
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          if (match && match[1] === 'mermaid') {
            return (
              <div className="mermaid-container">
                <pre className="mermaid">{children}</pre>
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
