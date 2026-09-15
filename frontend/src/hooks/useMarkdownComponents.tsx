import React, { useEffect, useMemo } from 'react';
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
  overflow: auto;
  border: none;
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

// --- Theme CSS variable effect (call once per page that renders code) ---

export function useCodeBlockThemeEffect(theme: string) {
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.style.setProperty('--code-block-bg', '#161b22');
    } else {
      root.style.setProperty('--code-block-bg', '#f6f8fa');
    }
  }, [theme]);
}

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

// 站内链接走前端路由，不再整页刷新。
const MarkdownLink = ({ node, href, children, ...props }: any) => {
  if (typeof href === 'string' && href.startsWith('/') && !href.startsWith('//')) {
    return <Link to={href} {...props}>{children}</Link>;
  }
  return <a href={href} {...props}>{children}</a>;
};

// ```mermaid 代码块由 MermaidDiagram 渲染成图表，不需要外层的 <pre>；其他代码块保持原样。
const isMermaidCodeNode = (node: any) => {
  const className = node?.children?.[0]?.properties?.className;
  const classes = Array.isArray(className) ? className : typeof className === 'string' ? [className] : [];
  return classes.includes('language-mermaid');
};

const MarkdownPre = ({ node, children, ...props }: any) => {
  if (isMermaidCodeNode(node)) {
    return <>{children}</>;
  }
  return <pre {...props}>{children}</pre>;
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
 * Also applies the code-block theme CSS variable effect.
 */
export function useMarkdownComponents(theme: string, options: UseMarkdownComponentsOptions = {}) {
  const {
    showCopyButton = false,
    fullStyleOverrides = false,
    useCodeWrappers = true,
  } = options;

  useCodeBlockThemeEffect(theme);

  return useMemo(() => {
    const codeStyle = fullStyleOverrides ? getFullCodeStyle(theme) : getSimpleCodeStyle(theme);

    const codeComponent = ({ node, inline, className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || '');
      const codeString = String(children).replace(/\n$/, '');

      if (!inline && match) {
        // 语言名不区分大小写（内容里有 ```CPP 这种写法）
        const language = match[1].toLowerCase();
        if (language === 'mermaid') {
          return <MermaidDiagram chart={codeString} theme={theme} />;
        }
        if (useCodeWrappers) {
          return (
            <CodeWrapper>
              <CodeBlockWrapper>
                {showCopyButton && <CopyButton code={codeString} />}
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

    return {
      code: codeComponent,
      pre: MarkdownPre,
      h1: MarkdownH1,
      img: MarkdownImage,
      a: MarkdownLink,
      iframe: MarkdownIframe,
    };
  }, [theme, showCopyButton, fullStyleOverrides, useCodeWrappers]);
}
