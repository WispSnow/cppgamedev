import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { getTroubleshootingArticles } from '../services/troubleshootingService';
import { TroubleshootingArticleSummary } from '../types';
import ErrorState from '../components/ErrorState';
import SEOHelmet from '../components/SEOHelmet';
import { CourseCardSkeletonGrid } from '../components/Skeleton';

const PageContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
`;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: var(--text-color);
  text-align: center;
`;

const PageDescription = styled.p`
  text-align: center;
  color: var(--secondary-text-color);
  margin-bottom: 2rem;
`;

const ArticleList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
`;

const ArticleCard = styled(Link)`
  display: block;
  background-color: var(--card-bg-color);
  border-radius: 8px;
  padding: 1.5rem;
  text-decoration: none;
  color: var(--text-color);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 18px rgba(0, 0, 0, 0.12);
  }
`;

const ArticleTitle = styled.h2`
  font-size: 1.4rem;
  margin-bottom: 0.75rem;
  color: var(--text-color);
`;

const ArticleDescription = styled.p`
  color: var(--secondary-text-color);
  line-height: 1.6;
`;

const PlaceholderMessage = styled.div`
  text-align: center;
  margin-top: 3rem;
  color: var(--secondary-text-color);
`;

const TroubleshootingPage: React.FC = () => {
  const [articles, setArticles] = useState<TroubleshootingArticleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArticles = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await getTroubleshootingArticles();
      setArticles(data);
    } catch (err) {
      console.error('Error fetching troubleshooting articles:', err);
      setError('获取疑难解决列表失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  return (
    <PageContainer>
      <SEOHelmet
        title="疑难解决 | C++游戏开发常见问题"
        description="针对C++游戏开发过程中的疑难问题提供排查思路和解决方案。"
        keywords="C++,游戏开发,疑难排查,故障诊断"
        canonical="/troubleshooting"
      />
      <PageTitle>疑难解决</PageTitle>
      <PageDescription>针对常见问题的排查笔记将陆续整理在这里，目前内容为占位示例。</PageDescription>

      {loading && <CourseCardSkeletonGrid />}

      {!loading && error && <ErrorState message={error} onRetry={fetchArticles} />}

      {!loading && !error && articles.length === 0 && (
        <PlaceholderMessage>目前还没有疑难解决文章，敬请期待。</PlaceholderMessage>
      )}

      {!loading && !error && articles.length > 0 && (
        <ArticleList>
          {articles.map(article => (
            <ArticleCard key={article.id} to={`/troubleshooting/${article.id}`}>
              <ArticleTitle>{article.title}</ArticleTitle>
              <ArticleDescription>{article.description}</ArticleDescription>
            </ArticleCard>
          ))}
        </ArticleList>
      )}
    </PageContainer>
  );
};

export default TroubleshootingPage;
