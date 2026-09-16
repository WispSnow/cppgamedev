import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { getAllCourses } from '../services/courseService';
import { Course } from '../types';
import SEOHelmet from '../components/SEOHelmet';
import { getDifficultyInfo } from '../utils/difficultyUtils';
import { getReadingHistory, getBookmarks } from '../services/storageService';
import ProjectCard from '../components/ProjectCard';
import CourseCard from '../components/CourseCard';
import ErrorState from '../components/ErrorState';
import { CourseCardSkeletonGrid } from '../components/Skeleton';
import { PageShell, Eyebrow, CardGrid, PrimaryLink } from '../components/Workshop';
import Icon from '../components/Icon';
import { projects } from '../data/projectsData';

const Hero = styled.section`
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 3.5rem;
  padding: 1.5rem 0 3.5rem;
  @media (max-width: 900px) { gap: 2rem; }
  @media (max-width: 700px) { grid-template-columns: 1fr; padding-top: 0.5rem; }
`;
const HeroTitle = styled.h1`
  font-size: clamp(2rem, 4vw, 3.25rem);
  letter-spacing: -0.055em;
  line-height: 1.25;
  margin: 1.25rem 0;
  em { font-style: normal; color: var(--primary-color); }
`;
const HeroIntro = styled.p`
  color: var(--secondary-text-color);
  max-width: 430px;
  line-height: 1.9;
`;
const HeroActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1.25rem;
  margin: 1.8rem 0 1rem;
`;
const TextLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--primary-color);
  font-size: 0.9rem;
  &:hover { text-decoration: underline; text-underline-offset: 4px; }
`;
const HeroMeta = styled.p`
  font: 0.74rem/1.8 var(--font-mono);
  color: var(--secondary-text-color);
`;
const GameWindow = styled(Link)`
  display: block;
  min-width: 0;
  background: var(--card-bg-color);
  border: 1px solid var(--border-color);
  border-radius: var(--card-radius);
  box-shadow: 8px 8px 0 var(--toc-active-bg);
  overflow: hidden;
  margin-right: 8px;
  &:hover { border-color: var(--primary-color); }
`;
const WindowBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  font: 0.72rem/1.5 var(--font-mono);
  color: var(--secondary-text-color);
  span:first-child { color: var(--primary-color); }
`;
const HeroImage = styled.div`
  aspect-ratio: 16 / 10;
  display: grid;
  place-items: center;
  background: var(--code-block-bg);
  overflow: hidden;
  img { width: 100%; height: 100%; object-fit: contain; display: block; }
  span { font-family: var(--font-mono); color: var(--secondary-text-color); }
`;
const Loop = styled.div`
  padding: 1rem 1.25rem;
  border-top: 1px solid var(--border-color);
  font: 0.8rem/1.9 var(--font-mono);
  color: var(--secondary-text-color);
  strong { color: var(--primary-color); font-weight: 500; }
  span { margin-right: 1.2rem; opacity: 0.7; }
`;
const Stages = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 3.5rem;
  @media (max-width: 650px) { grid-template-columns: 1fr; }
`;
const Stage = styled(Link)`
  display: flex;
  align-items: center;
  gap: 1.2rem;
  padding: 1.3rem 1rem;
  border-right: 1px solid var(--border-color);
  &:last-child { border-right: none; }
  &:hover { background: var(--hover-bg-color); }
  > span { font: 0.8rem var(--font-mono); color: var(--primary-color); }
  strong { display: block; font-weight: 600; font-size: 0.95rem; }
  small { display: block; color: var(--secondary-text-color); font-size: 0.75rem; margin-top: 0.2rem; }
  @media (max-width: 650px) { border-right: 0; border-bottom: 1px solid var(--border-color); &:last-child { border-bottom: 0; } }
`;
const Section = styled.section`margin: 0 0 3.5rem;`;
const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: end;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
  h2 { font-size: 1.8rem; letter-spacing: -0.04em; }
  p { margin-bottom: 0.4rem; }
`;
const Filters = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin: 0 0 1.5rem;
`;
const Filter = styled.button<{ $active: boolean }>`
  padding: 0.45rem 0.85rem;
  min-height: 40px;
  border: 1px solid ${p => p.$active ? 'var(--primary-color)' : 'var(--border-color)'};
  border-radius: 4px;
  background: ${p => p.$active ? 'var(--primary-color)' : 'var(--card-bg-color)'};
  color: ${p => p.$active ? 'var(--on-primary-color)' : 'var(--secondary-text-color)'};
  font-size: 0.85rem;
  cursor: pointer;
  &:hover { border-color: var(--primary-color); }
`;
const HistoryCard = styled(Link)`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.2rem;
  border: 1px solid var(--border-color);
  background: var(--card-bg-color);
  border-radius: var(--card-radius);
  h3 { font-size: 1rem; margin-bottom: 0.3rem; }
  p { color: var(--secondary-text-color); font-size: 0.78rem; }
  > svg { color: var(--primary-color); }
  &:hover { border-color: var(--primary-color); }
`;
const Empty = styled.div`
  padding: 2rem;
  border: 1px dashed var(--border-color);
  border-radius: var(--card-radius);
  color: var(--secondary-text-color);
  button { margin-top: 1rem; }
`;
const SectionIntro = styled.p`color: var(--secondary-text-color); margin: -0.6rem 0 1.5rem;`;

const HomePage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [difficulty, setDifficulty] = useState<number | null>(null);
  const [history] = useState(getReadingHistory);
  const [bookmarks] = useState(getBookmarks);
  const [heroFailed, setHeroFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    getAllCourses(controller.signal)
      .then(data => { if (!controller.signal.aborted) setCourses(data); })
      .catch(() => { if (!controller.signal.aborted) setError('加载课程失败，请稍后再试'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [reloadKey]);

  const featured = courses.find(course => course.id === 'sdl-space-shooter');
  const allMainline = courses.filter(course => (course.category ?? 'mainline') === 'mainline');
  const filtered = courses.filter(course => !difficulty || course.difficulty === difficulty);
  const mainline = filtered.filter(course => (course.category ?? 'mainline') === 'mainline');
  const side = filtered.filter(course => course.category === 'side');
  // 课程接口确认历史记录仍存在后才提供继续阅读入口。
  const latest = history.find(item => courses.some(course => course.id === item.courseId));
  const resumePath = latest ? `/courses/${latest.courseId}/parts/${latest.partId}` : '/courses/sdl-space-shooter';

  return <PageShell>
    <SEOHelmet title="C++游戏开发 | 从入门到精通的学习之旅" description="项目式中文 C++ 游戏开发教程：从太空战机到迷你农场，在完整项目中学习 SDL、游戏架构与 OpenGL。" keywords="C++,游戏开发,编程教程,SDL,OpenGL" canonical="/" />
    <Hero>
      <div>
        <Eyebrow>THE GAME DEV WORKSHOP / 游戏开发工作台</Eyebrow>
        <HeroTitle>从第一行代码开始，<br /><em>做出自己的游戏。</em></HeroTitle>
        <HeroIntro>从太空战机到迷你农场，在一个个完整项目里，学会 C++ 与游戏开发。</HeroIntro>
        <HeroActions>
          <PrimaryLink to={resumePath}>{latest ? '继续上次阅读' : '从太空战机开始'}<Icon name="arrow" size={18} /></PrimaryLink>
          <TextLink to="/roadmap">查看学习路线 <span aria-hidden="true">↗</span></TextLink>
        </HeroActions>
        <HeroMeta>{latest ? `上次读到 · ${latest.title}` : 'C++ / SDL / OpenGL · 项目驱动 · 中文教程'}</HeroMeta>
      </div>
      <GameWindow to="/courses/sdl-space-shooter" aria-label="了解 SDL与太空战机课程">
        <WindowBar><span>01 / SDL与太空战机</span><span>课程实机画面 ↗</span></WindowBar>
        <HeroImage>{featured?.coverImage && !heroFailed ? <img src={featured.coverImage} alt="SDL与太空战机：玩家飞机、敌机与星空战场" fetchPriority="high" onError={() => setHeroFailed(true)} /> : <span>{loading ? 'LOADING / 课程画面' : 'SDL / SPACE SHOOTER'}</span>}</HeroImage>
        <Loop aria-label="游戏循环示例"><div><span>01</span><strong>while</strong> (running) {'{'}</div><div><span>02</span>　input(); update(dt); render();</div><div><span>03</span>{'}'}</div></Loop>
      </GameWindow>
    </Hero>
    <Stages aria-label="学习阶段">
      <Stage to="/courses/sdl-space-shooter"><span>01</span><div><strong>让游戏跑起来</strong><small>游戏循环 · 输入 · 渲染</small></div></Stage>
      <Stage to="/courses/modular-ghost-escape"><span>02</span><div><strong>把项目组织好</strong><small>模块拆分 · 场景管理 · 架构</small></div></Stage>
      <Stage to="/roadmap"><span>03</span><div><strong>探索更大的世界</strong><small>ECS · OpenGL · RPG</small></div></Stage>
    </Stages>
    {history.length > 0 && <Section aria-labelledby="reading-title">
      <SectionHeader><div><Eyebrow>CONTINUE / 阅读记录</Eyebrow><h2 id="reading-title">接着上次，继续探索</h2></div></SectionHeader>
      <CardGrid>{history.slice(0, 3).map(item => <HistoryCard key={`${item.courseId}-${item.partId}`} to={`/courses/${item.courseId}/parts/${item.partId}`}><Icon name="book" /><div><h3>{item.title}</h3><p>上次阅读于 {new Date(item.timestamp).toLocaleDateString()}</p></div></HistoryCard>)}</CardGrid>
    </Section>}
    <Section aria-labelledby="mainline-title">
      <SectionHeader><div><Eyebrow>MAIN QUESTS / 主线课程</Eyebrow><h2 id="mainline-title">选择你的起点</h2></div><TextLink to="/mainline">全部主线 <Icon name="arrow" size={16} /></TextLink></SectionHeader>
      <Filters aria-label="按难度筛选课程">{[null, 1, 2, 3, 4, 5].map(level => <Filter key={level ?? 'all'} $active={difficulty === level} aria-pressed={difficulty === level} onClick={() => setDifficulty(level)}>{level === null ? '全部难度' : getDifficultyInfo(level).label}</Filter>)}</Filters>
      {loading ? <CourseCardSkeletonGrid /> : error ? <ErrorState message={error} onRetry={() => setReloadKey(key => key + 1)} /> : mainline.length ? <CardGrid>{mainline.map(course => <CourseCard key={course.id} course={course} index={allMainline.findIndex(c => c.id === course.id)} />)}</CardGrid> : <Empty role="status">{difficulty ? `暂无「${getDifficultyInfo(difficulty).label}」难度的主线课程。` : '主线课程正在准备中。'}{difficulty && <div><Filter $active={false} onClick={() => setDifficulty(null)}>查看全部课程</Filter></div>}</Empty>}
    </Section>
    {!loading && !error && <Section aria-labelledby="side-title"><SectionHeader><div><Eyebrow>SIDE QUESTS / 支线专题</Eyebrow><h2 id="side-title">给技能树添一条分支</h2></div><TextLink to="/side-quests">全部支线 <Icon name="arrow" size={16} /></TextLink></SectionHeader><SectionIntro>围绕具体问题，补齐工具、优化与设计方法。</SectionIntro>{side.length ? <CardGrid>{side.map(course => <CourseCard key={course.id} course={course} />)}</CardGrid> : <Empty role="status">当前难度下暂无支线专题。{difficulty && <div><Filter $active={false} onClick={() => setDifficulty(null)}>查看全部课程</Filter></div>}</Empty>}</Section>}
    {bookmarks.length > 0 && <Section aria-labelledby="bookmarks-title"><SectionHeader><div><Eyebrow>BOOKMARKS / 收藏</Eyebrow><h2 id="bookmarks-title">留给下一次的灵感</h2></div></SectionHeader><CardGrid>{bookmarks.map(item => <HistoryCard key={`${item.courseId}-${item.partId}`} to={`/courses/${item.courseId}/parts/${item.partId}`}><Icon name="bookmark" /><div><h3>{item.title}</h3><p>收藏于 {new Date(item.timestamp).toLocaleDateString()}</p></div></HistoryCard>)}</CardGrid></Section>}
    <Section aria-labelledby="projects-title"><SectionHeader><div><Eyebrow>PLAYGROUND / 作品与实验</Eyebrow><h2 id="projects-title">代码之外，游戏之中</h2></div><TextLink to="/projects">全部作品 <Icon name="arrow" size={16} /></TextLink></SectionHeader><SectionIntro>课程之外做的小游戏和实验，技术栈不限于 C++。</SectionIntro><CardGrid>{projects.slice(0, 3).map(project => <ProjectCard key={project.id} project={project} variant="grid" />)}</CardGrid></Section>
  </PageShell>;
};
export default HomePage;
