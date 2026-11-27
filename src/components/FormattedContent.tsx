"use client";

import ReactMarkdown, { type Components } from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

interface FormattedContentProps {
  content: string;
  variant?: "default" | "compact";
}

function buildComponents(variant: "default" | "compact"): Components {
  const isCompact = variant === "compact";
  const bodyTextClass = isCompact
    ? "text-[13.5px] leading-relaxed text-indigo-900/90 break-words"
    : "text-base leading-relaxed text-slate-700 break-words";
  const strongClass = isCompact
    ? "font-semibold text-indigo-950"
    : "font-semibold text-slate-900";
  const inlineCodeClass = isCompact
    ? "font-mono text-[12px] bg-indigo-100/80 text-indigo-950 px-1.5 py-0.5 rounded"
    : "font-mono text-[13px] bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded";

  return {
    p: ({ children }) => (
      <p className={`${bodyTextClass} [&:not(:first-child)]:mt-2`}>{children}</p>
    ),
    ul: ({ children }) => (
      <ul
        className={`list-disc pl-5 space-y-1.5 my-2 ${bodyTextClass}`}
      >
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol
        className={`list-decimal pl-5 space-y-1.5 my-2 ${bodyTextClass}`}
      >
        {children}
      </ol>
    ),
    li: ({ children }) => <li className={bodyTextClass}>{children}</li>,
    strong: ({ children }) => <strong className={strongClass}>{children}</strong>,
    code: ({ children, className }) => (
      <code className={`${inlineCodeClass}${className ? ` ${className}` : ""}`}>
        {children}
      </code>
    ),
    pre: ({ children }) => (
      <pre className="bg-slate-900 text-slate-100 rounded-xl p-3 my-2.5 overflow-x-auto text-[13px] font-mono [&_code]:bg-transparent [&_code]:p-0 [&_code]:text-inherit [&_code]:text-[13px]">
        {children}
      </pre>
    ),
    table: ({ children }) => (
      <div className="overflow-x-auto my-2.5">
        <table className="w-full border-collapse border border-slate-200 text-sm text-left">
          {children}
        </table>
      </div>
    ),
    th: ({ children }) => (
      <th className="border border-slate-200 bg-slate-100/80 px-2.5 py-1.5 font-semibold text-slate-800">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="border border-slate-200 px-2.5 py-1.5 text-slate-700 align-top">
        {children}
      </td>
    ),
  };
}

const DEFAULT_COMPONENTS = buildComponents("default");
const COMPACT_COMPONENTS = buildComponents("compact");

/** Renders Markdown + GFM tables + LaTeX math (KaTeX) safely for mobile viewports. */
export default function FormattedContent({
  content,
  variant = "default",
}: FormattedContentProps) {
  const components =
    variant === "compact" ? COMPACT_COMPONENTS : DEFAULT_COMPONENTS;

  return (
    <div className="min-w-0 max-w-full">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
