import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';
import { getTroubleshootingArticleById } from '../services/troubleshootingService';
import { isNotFoundError } from '../services/api';
import { TroubleshootingArticle } from '../types';
import { useTheme } from '../context/ThemeContext';
import SEOHelmet from '../components/SEOHelmet';
import ErrorState from '../components/ErrorState';
import { ArticleSkeleton } from '../components/Skeleton';
import ArticleProse from '../components/ArticleProse';
import { PageShell, Eyebrow, PageHeading, PageIntro, ReadingPanel, RelatedLinks } from '../components/Workshop';
import { markdownRehypePlugins, markdownRemarkPlugins, useMarkdownComponents } from '../hooks/useMarkdownComponents';
import NotFoundPage from './NotFoundPage';

const Container = styled(PageShell)`max-width: 980px;`;
const Back = styled(Link)`display: inline-block; margin-bottom: 2rem; color: var(--primary-color); font-size: 0.9rem; &:hover { text-decoration: underline; }`;

export default function TroubleshootingDetailPage() {
  const { articleId } = useParams<{ articleId: string }>();
  const [article, setArticle] = useState<TroubleshootingArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const { theme } = useTheme();
  useEffect(() => {
    if (!articleId) return;
    const controller = new AbortController();
    setArticle(null);
    setLoading(true);
    setFailed(false);
    setNotFound(false);
    getTroubleshootingArticleById(articleId, controller.signal)
      .then(data => { if (!controller.signal.aborted) setArticle(data); })
      .catch(error => { if (!controller.signal.aborted) { if (isNotFoundError(error)) setNotFound(true); else setFailed(true); } })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [articleId, reloadKey]);
  const components = useMarkdownComponents(theme, { showCopyButton: true, fullStyleOverrides: true });
  if (notFound) return <NotFoundPage message="这篇排障文章不存在，可能已经调整或者地址有误。" />;
  return (
    <Container>
      {article && <SEOHelmet title={`${article.title} | 疑难解决`} description={article.description} keywords={`C++,游戏开发,疑难解决,${article.title}`} canonical={`/troubleshooting/${article.id}`} />}
      <Back to="/troubleshooting">← 返回疑难解决</Back>
      {loading ? <ArticleSkeleton /> : failed ? <ErrorState message="加载文章失败，请稍后再试" onRetry={() => setReloadKey(key => key + 1)} /> : article && <>
        <Eyebrow>DEBUG NOTES / 排障笔记</Eyebrow><PageHeading>{article.title}</PageHeading><PageIntro>{article.description}</PageIntro>
        <ReadingPanel><ArticleProse><ReactMarkdown remarkPlugins={markdownRemarkPlugins} rehypePlugins={markdownRehypePlugins} components={components}>{article.content || '内容正在整理中，敬请期待。'}</ReactMarkdown></ArticleProse></ReadingPanel>
        <RelatedLinks aria-label="排障相关入口"><Link to="/troubleshooting">其他排障文章 →</Link><Link to="/contact">仍有问题？查看交流渠道 →</Link></RelatedLinks>
      </>}
    </Container>
  );
}
