import React, { useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vs, vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import CopyButton from '../components/CopyButton';

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

// --- Hook options ---

interface UseMarkdownComponentsOptions {
  /** Show copy button on code blocks (default: false) */
  showCopyButton?: boolean;
  /** Use full style overrides with custom token colors (default: false, uses simple style) */
  fullStyleOverrides?: boolean;
  /** Use CodeWrapper/CodeBlockWrapper around code blocks (default: true) */
  useCodeWrappers?: boolean;
  /** Extra components to merge (e.g. div handler for video) */
  extraComponents?: Record<string, React.ComponentType<any>>;
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
    extraComponents,
  } = options;

  useCodeBlockThemeEffect(theme);

  return useMemo(() => {
    const codeStyle = fullStyleOverrides ? getFullCodeStyle(theme) : getSimpleCodeStyle(theme);

    const codeComponent = ({ node, inline, className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || '');
      const codeString = String(children).replace(/\n$/, '');

      if (!inline && match) {
        if (useCodeWrappers) {
          return (
            <CodeWrapper>
              <CodeBlockWrapper>
                {showCopyButton && <CopyButton code={codeString} />}
                <SyntaxHighlighter
                  style={codeStyle}
                  language={match[1]}
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
            language={match[1]}
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
      ...extraComponents,
    };
  }, [theme, showCopyButton, fullStyleOverrides, useCodeWrappers, extraComponents]);
}
