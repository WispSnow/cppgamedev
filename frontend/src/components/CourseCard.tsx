import React, { useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Course } from '../types';
import { getDifficultyInfo } from '../utils/difficultyUtils';
import Icon from './Icon';

const Card = styled(Link)`
  display: flex;
  flex-direction: column;
  min-width: 0;
  border: 1px solid var(--border-color);
  border-radius: var(--card-radius);
  background: var(--card-bg-color);
  overflow: hidden;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
  &:hover { transform: translateY(-3px); border-color: var(--primary-color); box-shadow: var(--card-shadow); }
`;
const Cover = styled.div`
  aspect-ratio: 16 / 9;
  background: var(--toc-bg-color);
  display: grid;
  place-items: center;
  overflow: hidden;
  color: var(--secondary-text-color);
  font-family: var(--font-mono);
  img { display: block; width: 100%; height: 100%; object-fit: cover; transition: transform 0.25s ease; }
  ${Card}:hover img { transform: scale(1.025); }
`;
const Content = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 1.4rem;
`;
const Meta = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.8rem;
  font: 0.73rem/1.6 var(--font-mono);
  color: var(--secondary-text-color);
`;
const Level = styled.span`
  color: var(--primary-color);
  background: var(--toc-active-bg);
  padding: 0.1rem 0.45rem;
  border-radius: 3px;
`;
const Title = styled.h3`
  font-size: 1.2rem;
  line-height: 1.5;
  letter-spacing: -0.025em;
  margin-bottom: 0.65rem;
`;
const Description = styled.p`
  color: var(--secondary-text-color);
  font-size: 0.9rem;
  line-height: 1.8;
  margin-bottom: 1.3rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;
const Bottom = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding-top: 0.9rem;
  border-top: 1px solid var(--border-color);
  margin-top: auto;
  font-size: 0.8rem;
  color: var(--secondary-text-color);
  span:last-child { display: inline-flex; align-items: center; gap: 0.5rem; color: var(--primary-color); }
`;

export default function CourseCard({ course, index, headingLevel = 'h3' }: { course: Course; index?: number; headingLevel?: 'h2' | 'h3' }) {
  const [failed, setFailed] = useState(false);
  const count = course.partCount ?? course.parts?.length;
  return <Card to={`/courses/${course.id}`}>
    <Cover>{course.coverImage && !failed ? <img src={course.coverImage} alt={`${course.title}游戏画面`} loading="lazy" decoding="async" onError={() => setFailed(true)} /> : <span>C++ / GAME DEV</span>}</Cover>
    <Content>
      <Meta><span>{index === undefined ? '' : `${String(index + 1).padStart(2, '0')} / `}{course.category === 'side' ? '支线专题' : '主线课程'}</span>{course.difficulty && <Level>{getDifficultyInfo(course.difficulty).label}</Level>}</Meta>
      <Title as={headingLevel}>{course.title}</Title>
      <Description>{course.description}</Description>
      <Bottom><span>{count !== undefined ? `${count} 个章节` : course.status || '项目式学习'}</span><span>查看课程 <Icon name="arrow" size={15} /></span></Bottom>
    </Content>
  </Card>;
}
