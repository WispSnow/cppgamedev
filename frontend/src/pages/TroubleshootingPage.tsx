import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { getTroubleshootingArticles } from '../services/troubleshootingService';
import { TroubleshootingArticleSummary } from '../types';
import ErrorState from '../components/ErrorState';
import SEOHelmet from '../components/SEOHelmet';
import { PartCardSkeletonList } from '../components/Skeleton';
import { PageShell, Eyebrow, PageHeading, PageIntro, SplitLayout, RelatedLinks } from '../components/Workshop';
import Icon from '../components/Icon';

const Guide = styled.aside`
  padding-top: 1.2rem;
  border-top: 1px solid var(--border-color);
  h2 { font-size: 1rem; margin-bottom: 0.8rem; }
  ol { padding-left: 1.2rem; color: var(--secondary-text-color); font-size: 0.85rem; line-height: 1.9; }
  li + li { margin-top: 0.6rem; }
`;
const ArticleList = styled.div`display: flex; flex-direction: column; gap: 0.9rem;`;
const ArticleCard = styled(Link)`
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr) 20px;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--card-bg-color);
  border: 1px solid var(--border-color);
  border-radius: var(--card-radius);
  transition: border-color 0.2s, transform 0.2s;
  &:hover { border-color: var(--primary-color); transform: translateX(3px); }
  > span { font: 0.9rem var(--font-mono); color: var(--primary-color); }
  > svg { color: var(--primary-color); }
  h2 { font-size: 1.2rem; margin-bottom: 0.6rem; }
  p { color: var(--secondary-text-color); line-height: 1.8; font-size: 0.9rem; }
  @media (max-width: 500px) { padding: 1.1rem; grid-template-columns: minmax(0, 1fr) 20px; > span { grid-column: 1 / -1; } }
`;

export default function TroubleshootingPage() {
  const [articles, setArticles] = useState<TroubleshootingArticleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setFailed(false);
    getTroubleshootingArticles(controller.signal)
      .then(data => { if (!controller.signal.aborted) setArticles(data); })
      .catch(() => { if (!controller.signal.aborted) setFailed(true); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [reloadKey]);

  return (
    <PageShell>
      <SEOHelmet title="疑难解决 | C++游戏开发常见问题" description="针对C++游戏开发过程中的疑难问题提供排查思路和解决方案。" keywords="C++,游戏开发,疑难排查,故障诊断" canonical="/troubleshooting" />
      <Eyebrow>DEBUG DESK / 开发排障手册</Eyebrow><PageHeading>遇到问题，逐步拆解。</PageHeading>
      <PageIntro>从开发环境到编译运行，找到问题的原因，让你的游戏继续向前。</PageIntro>
      <SplitLayout>
        <Guide><h2>开始排查之前</h2><ol><li>记录完整错误信息和出现位置。</li><li>确认系统、编译器与依赖版本。</li><li>缩小复现范围，逐项检查差异。</li></ol><RelatedLinks aria-label="排障帮助"><Link to="/faq">学习常见问题 →</Link><Link to="/contact">寻求帮助 →</Link></RelatedLinks></Guide>
        <div>
          {loading ? <PartCardSkeletonList /> : failed ? <ErrorState message="获取疑难解决列表失败，请稍后再试" onRetry={() => setReloadKey(key => key + 1)} /> : articles.length ? (
            <ArticleList>{articles.map((article, index) => <ArticleCard key={article.id} to={`/troubleshooting/${article.id}`}><span>{String(index + 1).padStart(2, '0')}</span><div><h2>{article.title}</h2><p>{article.description}</p></div><Icon name="arrow" size={18} /></ArticleCard>)}</ArticleList>
          ) : <PageIntro>目前还没有疑难解决文章，敬请期待。</PageIntro>}
        </div>
      </SplitLayout>
    </PageShell>
  );
}
