import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vs, vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { getTroubleshootingArticleById } from '../services/troubleshootingService';
import { TroubleshootingArticle } from '../types';
import { useTheme } from '../context/ThemeContext';
import SEOHelmet from '../components/SEOHelmet';
import ErrorState from '../components/ErrorState';
import { ArticleSkeleton } from '../components/Skeleton';

const PageContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
  background-color: var(--card-bg-color, #ffffff);
  border-radius: 12px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
`;

const BackLink = styled(Link)`
  display: inline-block;
  margin-bottom: 2rem;
  color: var(--primary-color, #0066cc);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const Title = styled.h1`
  margin-bottom: 0.5rem;
  color: var(--text-color, #333);
`;

const Subtitle = styled.p`
  margin-top: 0;
  color: var(--secondary-text-color, #666);
`;

const MarkdownContainer = styled.div`
  line-height: 1.8;
  color: var(--text-color, #333);

  h1, h2, h3, h4, h5, h6 {
    margin-top: 2rem;
    margin-bottom: 1rem;
    color: var(--text-color, #333);
  }

  p {
    margin-bottom: 1.5rem;
  }

  ul, ol {
    margin-bottom: 1.5rem;
    padding-left: 2rem;
  }

  pre, .react-syntax-highlighter {
    margin: 1.5rem 0;
    border-radius: 8px;
    overflow-x: auto;
    overflow-y: hidden;
    background-color: var(--code-block-bg, #f6f8fa);
    padding: 1rem;
    -webkit-overflow-scrolling: touch;
  }

  code, .react-syntax-highlighter code {
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    white-space: pre;
    display: block;
    width: max-content;
    min-width: 100%;
  }
`;

const TroubleshootingDetailPage: React.FC = () => {
  const { articleId } = useParams<{ articleId: string }>();
  const [article, setArticle] = useState<TroubleshootingArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();

  const fetchArticle = useCallback(async () => {
    try {
      if (!articleId) return;
      setError(null);
      setLoading(true);
      const data = await getTroubleshootingArticleById(articleId);
      setArticle(data);
    } catch (err) {
      console.error('Error fetching troubleshooting article:', err);
      setError('加载文章失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  }, [articleId]);

  useEffect(() => {
    fetchArticle();
  }, [fetchArticle]);

  const markdownComponents = {
    code({ inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      const code = String(children).replace(/\n$/, '');

      return !inline && match ? (
        <SyntaxHighlighter
          style={theme === 'dark' ? (vscDarkPlus as any) : (vs as any)}
          language={match[1]}
          PreTag="div"
          {...props}
        >
          {code}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
  };

  return (
    <PageContainer>
      {article && (
        <SEOHelmet
          title={`${article.title} | 疑难解决`}
          description={article.description}
          keywords={`C++,游戏开发,疑难解决,${article.title}`}
          canonical={`/troubleshooting/${article.id}`}
        />
      )}
      <BackLink to="/troubleshooting">← 返回疑难解决</BackLink>

      {loading && <ArticleSkeleton />}

      {!loading && error && <ErrorState message={error} onRetry={fetchArticle} />}

      {!loading && !error && article && (
        <>
          <Title>{article.title}</Title>
          <Subtitle>{article.description}</Subtitle>
          <MarkdownContainer>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={markdownComponents}
            >
              {article.content || '内容正在整理中，敬请期待。'}
            </ReactMarkdown>
          </MarkdownContainer>
        </>
      )}
    </PageContainer>
  );
};

export default TroubleshootingDetailPage;
