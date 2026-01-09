import "katex/dist/katex.min.css";
import React, { cloneElement, isValidElement, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  vscDarkPlus,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import gfm from "remark-gfm";
import remarkMermaid from "../remark/remarkMermaid";
import { remarkAlert } from "remark-github-blockquote-alert";
import remarkMath from "remark-math";
import Lightbox, { SlideImage } from "yet-another-react-lightbox";
import Counter from "yet-another-react-lightbox/plugins/counter";
import Download from "yet-another-react-lightbox/plugins/download";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";

const codeBlockStyle = {
  fontFamily: '"Fira Code", "JetBrains Mono", monospace',
  fontSize: "14px",
  fontVariantLigatures: "normal",
  WebkitFontFeatureSettings: '"liga" 1',
  fontFeatureSettings: '"liga" 1',
};

const inlineCodeStyle = {
  ...codeBlockStyle,
  fontSize: "13px",
};

/** 代码块组件 - 提取为独立组件以正确使用 hooks */
function CodeBlock({ children, language }: { children: string; language: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="relative group my-6">
      {/* Terminal风格头部 */}
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 dark:bg-slate-900 rounded-t-xl border-b border-slate-700">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
          <span className="w-3 h-3 rounded-full bg-yellow-500/80"></span>
          <span className="w-3 h-3 rounded-full bg-green-500/80"></span>
        </div>
        {language && (
          <span className="ml-auto text-xs text-slate-400 font-mono uppercase tracking-wider">
            {language}
          </span>
        )}
      </div>
      {/* 代码内容区域 */}
      <div className="relative">
        <SyntaxHighlighter
          PreTag="div"
          className="!rounded-t-none !rounded-b-xl !py-5 !px-5 !mt-0 !bg-slate-900 dark:!bg-[#1a1a2e]"
          language={language}
          style={vscDarkPlus}
          wrapLongLines={true}
          codeTagProps={{ style: codeBlockStyle }}
          showLineNumbers={children.split('\n').length > 3}
          lineNumberStyle={{
            color: '#4a5568',
            paddingRight: '1em',
            borderRight: '1px solid #2d3748',
            marginRight: '1em',
            minWidth: '2.5em',
          }}
        >
          {children.replace(/\n$/, "")}
        </SyntaxHighlighter>
        {/* 复制按钮 */}
        <button
          className={`absolute top-2 right-2 px-3 py-1.5 rounded-lg text-xs font-medium
            transition-all duration-200 cursor-pointer
            ${copied
              ? 'bg-cyber-green/20 text-cyber-green border border-cyber-green/30'
              : 'bg-slate-700/80 text-slate-300 border border-slate-600 hover:bg-slate-600 hover:text-white'
            }
            invisible group-hover:visible`}
          onClick={() => {
            navigator.clipboard.writeText(children);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
        >
          {copied ? (
            <span className="flex items-center gap-1">
              <i className="ri-check-line"></i> Copied!
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <i className="ri-file-copy-line"></i> Copy
            </span>
          )}
        </button>
      </div>
    </div>
  );
}


const countNewlinesBeforeNode = (text: string, offset: number) => {
  let newlinesBefore = 0;
  for (let i = offset - 1; i >= 0; i--) {
    if (text[i] === "\n") {
      newlinesBefore++;
    } else {
      break;
    }
  }
  return newlinesBefore;
};

const isMarkdownImageLinkAtEnd = (text: string) => {
  const trimmed = text.trim();

  const match = trimmed.match(/(.*)(!\\[.*?\\]\\(.*?\\))$/s);

  if (match) {
    const [, beforeImage] = match;

    return beforeImage.trim().length === 0 || beforeImage.endsWith("\n");
  }

  return false;
};

export function Markdown({ content }: { content: string }) {
  const [index, setIndex] = React.useState(-1);
  const slides = useRef<SlideImage[]>();

  useEffect(() => {
    slides.current = undefined;
  }, [content]);

  const Content = useMemo(() => (
    <ReactMarkdown
      className="toc-content dark:text-neutral-300"
      remarkPlugins={[gfm, remarkMermaid, remarkMath, remarkAlert]}
      children={content}
      rehypePlugins={[rehypeKatex, rehypeRaw]}
      components={{
        img({ node, src, ...props }) {
          const offset = node!.position!.start.offset!;
          const previousContent = content.slice(0, offset);
          const newlinesBefore = countNewlinesBeforeNode(
            previousContent,
            offset
          );
          const Image = ({
            rounded,
            scale,
          }: {
            rounded: boolean;
            scale: string;
          }) => (
            <img
              src={src}
              {...props}
              onClick={() => {
                show(src)
              }}
              className={`mx-auto ${rounded ? "rounded-xl" : ""}`}
              style={{ zoom: scale }}
              loading="lazy"
              decoding="async"
            />
          );
          if (
            newlinesBefore >= 1 ||
            previousContent.trim().length === 0 ||
            isMarkdownImageLinkAtEnd(previousContent)
          ) {
            return (
              <span className="block w-full text-center my-4">
                <Image scale="0.75" rounded={true} />
              </span>
            );
          } else {
            return (
              <span className="inline-block align-middle mx-1 ">
                <Image scale="0.5" rounded={false} />
              </span>
            );
          }
        },
        code(props) {
          const { children, className, node, ...rest } = props;
          const match = /language-(\w+)/.exec(className || "");

          const curContent = content.slice(node?.position?.start.offset || 0);
          const isCodeBlock = curContent.trimStart().startsWith("```");

          const language = match ? match[1] : "";

          if (isCodeBlock) {
            return <CodeBlock language={language}>{String(children)}</CodeBlock>;
          } else {
            return (
              <code
                {...rest}
                className={`bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md mx-0.5 text-sm text-slate-800 dark:text-slate-200 font-mono ${className || ""}`}
                style={inlineCodeStyle}
              >
                {children}
              </code>
            );
          }
        },
        blockquote({ children, ...props }) {
          return (
            <blockquote
              className="border-l-4 border-slate-300 dark:border-slate-600 pl-6 py-2 my-6 italic text-slate-600 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/30 rounded-r-lg"
              {...props}
            >
              {children}
            </blockquote>
          );
        },
        em({ children, ...props }) {
          return (
            <em className="ml-[1px] mr-[4px]" {...props}>
              {children}
            </em>
          );
        },
        strong({ children, ...props }) {
          return (
            <strong className="mx-[1px]" {...props}>
              {children}
            </strong>
          );
        },
        ul({ children, className, ...props }) {
          const listClass = className?.includes("contains-task-list")
            ? "list-none pl-6 my-5 space-y-2"
            : "list-disc pl-6 my-5 space-y-2";
          return (
            <ul className={listClass} {...props}>
              {children}
            </ul>
          );
        },
        ol({ children, ...props }) {
          return (
            <ol className="list-decimal pl-6 my-5 space-y-2" {...props}>
              {children}
            </ol>
          );
        },
        li({ children, ...props }) {
          return (
            <li className="pl-2 py-1 leading-relaxed" {...props}>
              {children}
            </li>
          );
        },
        a({ children, ...props }) {
          return (
            <a
              className="text-[#0686c8] dark:text-[#2590f1] hover:underline"
              {...props}
            >
              {children}
            </a>
          );
        },
        h1({ children, ...props }) {
          return (
            <h1
              id={children?.toString()}
              className="text-3xl font-bold mt-10 mb-6 pb-3 border-b border-slate-200 dark:border-slate-700"
              {...props}
            >
              {children}
            </h1>
          );
        },
        h2({ children, ...props }) {
          return (
            <h2
              id={children?.toString()}
              className="text-2xl font-bold mt-10 mb-5 pb-2 border-b border-slate-200/60 dark:border-slate-700/60"
              {...props}
            >
              {children}
            </h2>
          );
        },
        h3({ children, ...props }) {
          return (
            <h3
              id={children?.toString()}
              className="text-xl font-bold mt-8 mb-4"
              {...props}
            >
              {children}
            </h3>
          );
        },
        h4({ children, ...props }) {
          return (
            <h4
              id={children?.toString()}
              className="text-lg font-bold mt-6 mb-3"
              {...props}
            >
              {children}
            </h4>
          );
        },
        h5({ children, ...props }) {
          return (
            <h5
              id={children?.toString()}
              className="text-base font-bold mt-5 mb-2"
              {...props}
            >
              {children}
            </h5>
          );
        },
        h6({ children, ...props }) {
          return (
            <h6
              id={children?.toString()}
              className="text-sm font-bold mt-4 mb-2"
              {...props}
            >
              {children}
            </h6>
          );
        },
        p({ children, ...props }) {
          return (
            <p className="my-5 leading-relaxed" {...props}>
              {children}
            </p>
          );
        },
        hr({ ...props }) {
          return <hr className="my-10 border-slate-200 dark:border-slate-700" {...props} />;
        },
        table: ({ ...props }) => (
          <div className="my-6 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
            <table className="w-full border-collapse" {...props} />
          </div>
        ),
        th: ({ ...props }) => (
          <th className="px-4 py-3 text-left font-semibold bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700" {...props} />
        ),
        td: ({ ...props }) => (
          <td className="px-4 py-3 border-b border-slate-100 dark:border-slate-800" {...props} />
        ),
        sup: ({ children, ...props }) => (
          <sup className="text-xs mr-[4px]" {...props}>
            {children}
          </sup>
        ),
        sub: ({ children, ...props }) => (
          <sub className="text-xs mr-[4px]" {...props}>
            {children}
          </sub>
        ),
        section({ children, ...props }) {
          if (Object.prototype.hasOwnProperty.call(props, "data-footnotes")) {
            props.className = `${props.className || ""} mt-8`.trim();
          }
          const modifiedChildren = React.Children.map(children, (child) => {
            if (isValidElement(child) && child.props.node.tagName === "ol") {
              return cloneElement(child, {
                ...child.props,
                className: "list-decimal px-10 text-sm text-[#6B7280]",
              } as React.HTMLAttributes<HTMLParagraphElement>);
            }
            return child;
          });
          return <section {...props}>{modifiedChildren}</section>;
        },
        div({ children, ...props }) {
          return <div {...props}>{children}</div>;
        },
      }}
    />), [content])

  const show = (src: string | undefined) => {
    let slidesLocal = slides.current;
    if (!slidesLocal) {
      const parent = document.getElementsByClassName("toc-content")[0];
      if (!parent) return;
      const images = parent.querySelectorAll("img");
      slidesLocal = Array.from(images)
        .map((image) => {
          const url = image.getAttribute("src") || "";
          const filename = url.split("/").pop() || "";
          const alt = image.getAttribute("alt") || "";
          return {
            src: url,
            alt: alt,
            imageFit: "contain" as const,
            download: {
              url: url,
              filename: filename,
            },
          };
        })
        .filter((slide) => slide.src !== "");
      slides.current = (slidesLocal);
    }
    const index = slidesLocal?.findIndex((slide) => slide.src === src) ?? -1;
    setIndex(index);
  };

  return (
    <>
      {Content}
      <Lightbox
        plugins={[Download, Zoom, Counter]}
        index={index}
        slides={slides.current}
        open={index >= 0}
        close={() => setIndex(-1)}
      />
    </>
  );
}
