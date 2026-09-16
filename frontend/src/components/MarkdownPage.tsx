import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { useTheme } from '../context/ThemeContext';
import { markdownRehypePlugins, markdownRemarkPlugins, useMarkdownComponents } from '../hooks/useMarkdownComponents';
import SEOHelmet from './SEOHelmet';
import ErrorState from './ErrorState';
import { ArticleSkeleton } from './Skeleton';
import ArticleProse from './ArticleProse';
import { PageShell, Eyebrow, PageHeading, PageIntro, SplitLayout, SectionNav, ReadingPanel, RelatedLinks } from './Workshop';

interface MarkdownPageProps {
  title: string;
  description: string;
  contentUrl: string;
}
const pages = [
  { path: '/about', title: '关于我们', eyebrow: 'STUDIO NOTES / 关于工作台' },
  { path: '/contact', title: '联系我们', eyebrow: 'KEEP IN TOUCH / 交流与反馈' },
  { path: '/collaborate', title: '合作开发', eyebrow: 'BUILD TOGETHER / 一起做游戏' },
];

export default function MarkdownPage({ title, description, contentUrl }: MarkdownPageProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const { theme } = useTheme();
  const current = pages.find(page => contentUrl === `/content${page.path}.md`);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setFailed(false);
    setContent('');
    const load = async () => {
      try {
        const response = await fetch(contentUrl, { signal: controller.signal });
        if (!response.ok) throw new Error(`加载失败: ${response.status}`);
        const text = await response.text();
        if (!controller.signal.aborted) setContent(text);
      } catch {
        if (!controller.signal.aborted) setFailed(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    load();
    return () => controller.abort();
  }, [contentUrl, reloadKey]);

  const components = useMarkdownComponents(theme, { showCopyButton: true });
  // 页面头部已展示同名标题，正文从内容开始；独立 Markdown 文件保留完整标题。
  const body = content.replace(/^# ([^\r\n]+)\r?\n+/, (heading, text) => text.trim() === title ? '' : heading);
  return (
    <PageShell>
      <SEOHelmet title={`${title} | C++游戏开发`} description={description} />
      <Eyebrow>{current?.eyebrow || 'STUDIO NOTES / 工作台手记'}</Eyebrow>
      <PageHeading>{title}</PageHeading>
      <PageIntro>{description}</PageIntro>
      <SplitLayout>
        <SectionNav aria-label="关于本站">
          {pages.map(page => <Link key={page.path} to={page.path} aria-current={page.path === current?.path ? 'page' : undefined}>{page.title}<span aria-hidden="true">→</span></Link>)}
          <Link to="/projects">作品与实验<span aria-hidden="true">↗</span></Link>
        </SectionNav>
        <ReadingPanel>
          {loading ? <ArticleSkeleton /> : failed ? <ErrorState message="加载内容失败，请稍后再试" onRetry={() => setReloadKey(key => key + 1)} /> : (
            <ArticleProse>
              <ReactMarkdown remarkPlugins={markdownRemarkPlugins} rehypePlugins={markdownRehypePlugins} components={components}>{body}</ReactMarkdown>
            </ArticleProse>
          )}
          <RelatedLinks aria-label="继续探索"><Link to="/roadmap">查看学习路线 →</Link><Link to="/faq">常见问题 →</Link></RelatedLinks>
        </ReadingPanel>
      </SplitLayout>
    </PageShell>
  );
}
