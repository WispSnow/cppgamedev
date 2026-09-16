import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import c from 'react-syntax-highlighter/dist/esm/languages/prism/c';
import cmake from 'react-syntax-highlighter/dist/esm/languages/prism/cmake';
import cpp from 'react-syntax-highlighter/dist/esm/languages/prism/cpp';
import diff from 'react-syntax-highlighter/dist/esm/languages/prism/diff';
import glsl from 'react-syntax-highlighter/dist/esm/languages/prism/glsl';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import { vs, vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import remarkCjkFriendly from 'remark-cjk-friendly';
import rehypeRaw from 'rehype-raw';
import CopyButton from '../components/CopyButton';
import VideoPlayer from '../components/VideoPlayer';
import MermaidDiagram from '../components/MermaidDiagram';

// 只注册教程里实际用到的语言。全量 Prism 会把 277 种语言打进包里（约 570KB）。
// 新增语言：从 react-syntax-highlighter/dist/esm/languages/prism/ 引入并在这里注册，
// 未注册的语言会按纯文本显示。
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('c', c);
SyntaxHighlighter.registerLanguage('cmake', cmake);
SyntaxHighlighter.registerLanguage('cpp', cpp);
SyntaxHighlighter.registerLanguage('diff', diff);
SyntaxHighlighter.registerLanguage('glsl', glsl);
SyntaxHighlighter.registerLanguage('json', json);

// 所有 Markdown 页面共用的插件。放在模块级，保证引用稳定。
// remark-cjk-friendly：让 `**` 紧挨全角标点时（如 **组件（component）**是）也能正确加粗。
export const markdownRemarkPlugins = [remarkGfm, remarkCjkFriendly];
export const markdownRehypePlugins = [rehypeRaw];

// --- Shared styled components for code blocks ---

export const CodeWrapper = styled.div`
  margin: 1.5rem 0;
  border-radius: 8px;
  background-color: var(--code-block-bg, #f6f8fa);
  position: relative;
  overflow: hidden;
  border: 1px solid var(--border-color);
`;

const CodeHeader = styled.div`
  position: relative;
  min-height: 42px;
  display: flex;
  align-items: center;
  padding: 0.65rem 5rem 0.65rem 1rem;
  border-bottom: 1px solid var(--border-color);
  color: var(--secondary-text-color);
  font: 0.7rem/1.5 var(--font-mono);
  letter-spacing: 0.08em;
`;

export const CodeBlockWrapper = styled.div`
  position: relative;
  padding: 1rem;
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;

  pre {
    margin: 0 !important;
    background-color: transparent !important;
    border-radius: 6px;
    font-size: 14px !important;
    border: none !important;
    width: max-content;
    min-width: 100%;
  }

  code {
    background-color: transparent !important;
    padding: 0 !important;
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace !important;
    border: none !important;
    white-space: pre;
  }

  * {
    border: none !important;
    box-shadow: none !important;
  }
`;

// --- Code style builders ---

const darkStyleOverrides = {
  'pre[class*="language-"]': {
    ...vscDarkPlus['pre[class*="language-"]'],
    backgroundColor: 'transparent',
    margin: 0,
    padding: 0,
    overflow: 'visible',
    border: 'none',
  },
  'code[class*="language-"]': {
    ...vscDarkPlus['code[class*="language-"]'],
    backgroundColor: 'transparent',
    border: 'none',
    padding: 0,
    boxShadow: 'none',
  },
};

const lightStyleOverrides = {
  'pre[class*="language-"]': {
    ...vs['pre[class*="language-"]'],
    backgroundColor: 'transparent',
    margin: 0,
    padding: 0,
    overflow: 'visible',
    border: 'none',
  },
  'code[class*="language-"]': {
    ...vs['code[class*="language-"]'],
    backgroundColor: 'transparent',
    border: 'none',
    padding: 0,
    boxShadow: 'none',
  },
  'keyword': { color: '#0033cc' },
  'function': { color: '#8250df' },
  'string': { color: '#0a7a00' },
  'number': { color: '#116644' },
  'comment': { color: '#6e7781' },
  'class-name': { color: '#953800' },
};

// Full style with custom token colors (used by CoursePartPage)
function getFullCodeStyle(theme: string) {
  return theme === 'dark'
    ? { ...vscDarkPlus, ...darkStyleOverrides }
    : { ...vs, ...lightStyleOverrides };
}

// Simple style (used by MarkdownPage, TroubleshootingDetailPage)
function getSimpleCodeStyle(theme: string) {
  return theme === 'dark' ? vscDarkPlus : vs;
}

// --- Element renderers shared by every Markdown page ---

// 页面自己渲染了标题 <h1>，Markdown 里的一级标题降为 <h2>，保证每页只有一个 h1。
// data-md-h1 用来在各页面的样式里保留原来的一级标题外观。
const MarkdownH1 = ({ node, children, ...props }: any) => (
  <h2 data-md-h1="" {...props}>{children}</h2>
);

// 正文图片懒加载；教程图片大多没写 alt，缺省时按装饰图处理，避免读屏念出文件名。
const MarkdownImage = ({ node, alt, ...props }: any) => (
  <img alt={alt ?? ''} loading="lazy" decoding="async" {...props} />
);

// 表格外面包一层横向滚动容器：列多或单元格里有长代码时只在表格内滚动，不把手机页面撑宽。
const MarkdownTable = ({ node, ...props }: any) => (
  <div style={{ overflowX: 'auto' }}>
    <table {...props} />
  </div>
);

// 站内链接走前端路由，不再整页刷新。
const MarkdownLink = ({ node, href, children, ...props }: any) => {
  if (typeof href === 'string' && href.startsWith('/') && !href.startsWith('//')) {
    return <Link to={href} {...props}>{children}</Link>;
  }
  return <a href={href} {...props}>{children}</a>;
};

// 从 class 里取代码块的语言名，比如 language-CPP → cpp；没标语言时返回 null
const getCodeLanguage = (className: unknown): string | null => {
  const names = Array.isArray(className) ? className.join(' ') : typeof className === 'string' ? className : '';
  const match = /language-(\w+)/.exec(names);
  // 语言名不区分大小写（内容里有 ```CPP 这种写法）
  return match ? match[1].toLowerCase() : null;
};

// hast 节点里的纯文本，给没标语言的代码块的复制按钮用
const getNodeText = (node: any): string => {
  if (node?.type === 'text') return node.value;
  return Array.isArray(node?.children) ? node.children.map(getNodeText).join('') : '';
};

// B 站 / YouTube 嵌入改为点击后才加载播放器，其他 iframe 延迟加载。
const MarkdownIframe = ({ node, src, title, ...props }: any) => {
  const url = typeof src === 'string' ? src : '';

  if (/(^|\/\/)player\.bilibili\.com\/player\.html/.test(url)) {
    const params = new URLSearchParams(url.split('?')[1] || '');
    const bvid = params.get('bvid');
    if (bvid) {
      const page = Number(params.get('page')) || 1;
      return <VideoPlayer videoId={bvid} platform="bilibili" page={page} title={title || '点击播放视频'} />;
    }
  }

  const youtube = url.match(/youtube(?:-nocookie)?\.com\/embed\/([\w-]+)/);
  if (youtube) {
    return <VideoPlayer videoId={youtube[1]} platform="youtube" title={title || '点击播放 YouTube 视频'} />;
  }

  return <iframe src={src} title={title} loading="lazy" {...props} />;
};

// --- Hook options ---

interface UseMarkdownComponentsOptions {
  /** Show copy button on code blocks (default: false) */
  showCopyButton?: boolean;
  /** Use full style overrides with custom token colors (default: false, uses simple style) */
  fullStyleOverrides?: boolean;
  /** Use CodeWrapper/CodeBlockWrapper around code blocks (default: true) */
  useCodeWrappers?: boolean;
}

/**
 * Returns a memoized `components` object for ReactMarkdown.
 * Code block backgrounds come from CSS variables in index.css (switched by <html data-theme>).
 */
export function useMarkdownComponents(theme: string, options: UseMarkdownComponentsOptions = {}) {
  const {
    showCopyButton = false,
    fullStyleOverrides = false,
    useCodeWrappers = true,
  } = options;

  return useMemo(() => {
    const codeStyle = fullStyleOverrides ? getFullCodeStyle(theme) : getSimpleCodeStyle(theme);

    const codeComponent = ({ node, className, children, ...props }: any) => {
      const language = getCodeLanguage(className);
      const codeString = String(children).replace(/\n$/, '');

      if (language) {
        if (language === 'mermaid') {
          return <MermaidDiagram chart={codeString} theme={theme} />;
        }
        if (useCodeWrappers) {
          return (
            <CodeWrapper>
              <CodeHeader>{language.toUpperCase()}{showCopyButton && <CopyButton code={codeString} />}</CodeHeader>
              <CodeBlockWrapper>
                <SyntaxHighlighter
                  style={codeStyle}
                  language={language}
                  PreTag="div"
                  customStyle={{ backgroundColor: 'transparent', border: 'none', margin: 0, padding: 0 }}
                  codeTagProps={{ style: { border: 'none', backgroundColor: 'transparent' } }}
                  {...props}
                >
                  {codeString}
                </SyntaxHighlighter>
              </CodeBlockWrapper>
            </CodeWrapper>
          );
        }
        return (
          <SyntaxHighlighter
            style={codeStyle as any}
            language={language}
            PreTag="div"
            {...props}
          >
            {codeString}
          </SyntaxHighlighter>
        );
      }

      return (
        <code className={className} style={{ border: 'none' }} {...props}>
          {children}
        </code>
      );
    };

    // ```mermaid 由 MermaidDiagram 渲染成图表，不需要外层的 <pre>；标了语言的代码块由上面的 code 渲染成代码框。
    // 没标语言的代码块（终端输出、目录结构等）也放进同样的代码框：有背景、能横向滚动，不会把手机页面撑宽。
    const preComponent = ({ node, children, ...props }: any) => {
      const language = getCodeLanguage(node?.children?.[0]?.properties?.className);
      if (language === 'mermaid') {
        return <>{children}</>;
      }
      // 不用代码框的页面（疑难解决页）自己给 pre 定了样式
      if (language) return <>{children}</>;
      if (!useCodeWrappers) return <pre {...props}>{children}</pre>;
      return (
        <CodeWrapper>
          <CodeHeader>TEXT{showCopyButton && <CopyButton code={getNodeText(node).replace(/\n$/, '')} />}</CodeHeader>
          <CodeBlockWrapper>
            <pre {...props}>{children}</pre>
          </CodeBlockWrapper>
        </CodeWrapper>
      );
    };

    return {
      code: codeComponent,
      pre: preComponent,
      table: MarkdownTable,
      h1: MarkdownH1,
      img: MarkdownImage,
      a: MarkdownLink,
      iframe: MarkdownIframe,
    };
  }, [theme, showCopyButton, fullStyleOverrides, useCodeWrappers]);
}
