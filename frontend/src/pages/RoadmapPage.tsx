import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import SEOHelmet from '../components/SEOHelmet';
import { roadmapData } from '../data/roadmapData';
import { PageShell, Eyebrow, PageHeading, PageIntro } from '../components/Workshop';
import Icon from '../components/Icon';

const Phase = styled.section`
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 2.5rem;
  padding: 2rem 0;
  border-top: 1px solid var(--border-color);
  @media (max-width: 700px) { grid-template-columns: 1fr; gap: 1.5rem; }
`;
const PhaseTitle = styled.div`
  h2 { font-size: 1.35rem; margin: 0.4rem 0 0.7rem; }
  p { font-size: 0.85rem; line-height: 1.8; color: var(--secondary-text-color); }
`;
const StepList = styled.ol`
  list-style: none;
  padding-left: 2.5rem;
  position: relative;
  &::before { content: ''; position: absolute; left: 12px; top: 20px; bottom: 20px; width: 1px; background: var(--border-color); }
`;
const Step = styled.li`
  position: relative;
  background: var(--card-bg-color);
  border: 1px solid var(--border-color);
  border-radius: var(--card-radius);
  padding: 1.4rem;
  & + & { margin-top: 1rem; }
  h3 { font-size: 1.15rem; margin: 0.7rem 0 0.5rem; }
  h3 a:hover { color: var(--primary-color); }
  p { font-size: 0.9rem; color: var(--secondary-text-color); line-height: 1.85; }
  @media (max-width: 500px) { padding: 1rem; }
`;
const Number = styled.span`
  position: absolute;
  left: -2.5rem;
  top: 1.3rem;
  width: 24px;
  height: 28px;
  display: grid;
  place-items: center;
  background: var(--background-color);
  color: var(--primary-color);
  font: 0.8rem var(--font-mono);
`;
const Meta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.6rem;
  font-size: 0.75rem;
  color: var(--secondary-text-color);
`;
const Badge = styled.span<{ $status: string }>`
  padding: 0.15rem 0.5rem;
  border-radius: 3px;
  background: ${p => p.$status === 'completed' ? 'var(--toc-active-bg)' : p.$status === 'in-progress' ? 'var(--warning-bg)' : 'var(--hover-bg-color)'};
  color: ${p => p.$status === 'completed' ? 'var(--primary-color)' : p.$status === 'in-progress' ? 'var(--warning-color)' : 'var(--secondary-text-color)'};
`;
const Tech = styled.div`font: 0.75rem/1.8 var(--font-mono); color: var(--primary-color); margin-bottom: 0.7rem; overflow-wrap: anywhere;`;
const LearnLink = styled(Link)`display: inline-flex; align-items: center; gap: 0.7rem; margin-top: 1rem; color: var(--primary-color); font-size: 0.85rem; &:hover { text-decoration: underline; }`;
const phases = [
  { title: '让游戏跑起来', description: '从输入、画面到声音，完成第一款游戏。', start: 1, end: 1 },
  { title: '把项目组织好', description: '随着项目变大，学习模块化、分层与 ECS 架构。', start: 2, end: 4 },
  { title: '探索更大的世界', description: '从图形渲染走向复杂玩法，继续拓展游戏的边界。', start: 5, end: 8 },
];
export default function RoadmapPage() {
  return <PageShell>
    <SEOHelmet title="课程路线图 | C++游戏开发" description="系统化的C++游戏开发学习路线，从SDL入门到高级引擎架构。" keywords="C++学习路线,游戏开发教程,编程路线图" canonical="/roadmap" />
    <Eyebrow>LEARNING MAP / 开发者的成长路线</Eyebrow><PageHeading>每做完一款游戏，向前一步。</PageHeading><PageIntro>从第一帧画面到完整的游戏系统，按阶段找到下一步。下面的标记表示课程发布状态，你可以自由进入任何已上线课程。</PageIntro>
    {phases.map((phase, index) => <Phase key={phase.start} aria-labelledby={`phase-${phase.start}`}>
      <PhaseTitle><Eyebrow>STAGE {String(index + 1).padStart(2, '0')}</Eyebrow><h2 id={`phase-${phase.start}`}>{phase.title}</h2><p>{phase.description}</p></PhaseTitle>
      <StepList>{roadmapData.filter(item => item.id >= phase.start && item.id <= phase.end).map(item => <Step key={item.id}>
        <Number>{String(item.id).padStart(2, '0')}</Number><Meta><Badge $status={item.status}>{item.status === 'completed' ? '已发布' : item.status === 'in-progress' ? '制作中' : '计划中'}</Badge><span>{item.gameType}</span></Meta>
        <h3>{item.courseId ? <Link to={`/courses/${item.courseId}`}>{item.title}</Link> : item.title}</h3><Tech>{item.techStack}</Tech><p>{item.description}</p>
        {item.courseId && <LearnLink to={`/courses/${item.courseId}`}>查看课程 <Icon name="arrow" size={16} /></LearnLink>}
      </Step>)}</StepList>
    </Phase>)}
  </PageShell>;
}
