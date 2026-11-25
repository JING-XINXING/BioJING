'use client';
import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

/** 代码块包装：右上角一键复制（对应计划 v1.2 R3）。 */
export default function CodeBlock({ children }: { children: React.ReactNode }) {
  const [copied, setCopied] = useState(false);

  function handleCopy(e: React.MouseEvent<HTMLButtonElement>) {
    // 从按钮向上找到代码块容器再取 code 文本，仅点击按钮时触发（不拦截选文本）
    const code = e.currentTarget.closest('div')?.parentElement?.querySelector('code')?.innerText || '';
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  }

  return (
    <div className="relative group">
      <button
        type="button"
        onClick={handleCopy}
        aria-label="复制代码"
        className="absolute right-2 top-2 z-10 p-1.5 rounded bg-white/10 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
      </button>
      {children}
    </div>
  );
}
