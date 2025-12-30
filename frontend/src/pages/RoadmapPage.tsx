import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import SEOHelmet from '../components/SEOHelmet';
import { roadmapData, RoadmapItem } from '../data/roadmapData';

const PageContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 4rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: var(--text-color);
`;

const Subtitle = styled.p`
  color: var(--secondary-text-color);
  font-size: 1.1rem;
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.6;
`;

const TimelineContainer = styled.div`
  position: relative;
  max-width: 800px;
  margin: 0 auto;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 20px;
    width: 2px;
    background: var(--border-color, #e0e0e0);
    
    @media (min-width: 768px) {
      left: 50%;
      transform: translateX(-50%);
    }
  }
`;

const TimelineItem = styled.div<{ $isLeft: boolean }>`
  position: relative;
  margin-bottom: 3rem;
  width: 100%;
  
  @media (min-width: 768px) {
    width: 50%;
    margin-left: ${props => props.$isLeft ? '0' : '50%'};
    padding-right: ${props => props.$isLeft ? '40px' : '0'};
    padding-left: ${props => props.$isLeft ? '0' : '40px'};
    text-align: ${props => props.$isLeft ? 'right' : 'left'};
  }
  
  padding-left: 50px; // Mobile spacing
`;

const IndexCircle = styled.div<{ $status: string; $isLeft?: boolean }>`
  position: absolute;
  left: 6px;
  width: 30px;
  height: 30px;
  background-color: ${props => {
    switch(props.$status) {
      case 'completed': return 'var(--primary-color, #0066cc)';
      case 'in-progress': return '#ff9800';
      default: return 'var(--card-bg-color, #fff)';
    }
  }};
  border: 2px solid ${props => {
    switch(props.$status) {
      case 'completed': return 'var(--primary-color, #0066cc)';
      case 'in-progress': return '#ff9800';
      default: return '#bdc3c7';
    }
  }};
  border-radius: 50%;
  color: ${props => props.$status === 'planned' ? '#bdc3c7' : '#fff'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  z-index: 2;
  font-size: 0.9rem;
  
  @media (min-width: 768px) {
    left: ${props => props.$isLeft ? 'auto' : '-15px'};
    right: ${props => props.$isLeft ? '-15px' : 'auto'};
  }
`;

const ContentCard = styled.div<{ $status: string }>`
  background: var(--card-bg-color, #fff);
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  border-left: 4px solid ${props => {
    switch(props.$status) {
      case 'completed': return 'var(--primary-color, #0066cc)';
      case 'in-progress': return '#ff9800';
      default: return '#bdc3c7';
    }
  }};
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  }
`;

const CourseTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  color: var(--text-color);
  font-size: 1.25rem;
  
  a {
    color: inherit;
    text-decoration: none;
    &:hover {
      color: var(--primary-color, #0066cc);
    }
  }
`;

const TechStack = styled.div`
  font-size: 0.85rem;
  color: var(--primary-color, #0066cc);
  margin-bottom: 0.8rem;
  font-weight: 500;
  font-family: monospace;
`;

const Description = styled.p`
  color: var(--secondary-text-color);
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 1rem;
`;

const StatusBadge = styled.span<{ $status: string }>`
  display: inline-block;
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: bold;
  background-color: ${props => {
    switch(props.$status) {
      case 'completed': return 'rgba(0, 102, 204, 0.1)';
      case 'in-progress': return 'rgba(255, 152, 0, 0.1)';
      default: return '#f5f5f5';
    }
  }};
  color: ${props => {
    switch(props.$status) {
      case 'completed': return 'var(--primary-color, #0066cc)';
      case 'in-progress': return '#f57c00';
      default: return '#999';
    }
  }};
`;

const LearnMoreLink = styled(Link)`
  display: inline-block;
  margin-top: 0.5rem;
  color: var(--primary-color, #0066cc);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
  
  &:hover {
    text-decoration: underline;
  }
`;

const RoadmapPage: React.FC = () => {
  return (
    <PageContainer>
      <SEOHelmet
        title="课程路线图 | C++游戏开发"
        description="系统化的C++游戏开发学习路线，从SDL入门到高级引擎架构。"
        keywords="C++学习路线,游戏开发教程,编程路线图"
        canonical="/roadmap"
      />
      
      <Header>
        <Title>学习路线图</Title>
        <Subtitle>
          一份精心设计的系统化学习指南，带您从零开始，循序渐进地掌握C++游戏开发的核心技术。
        </Subtitle>
      </Header>

      <TimelineContainer>
        {roadmapData.map((item, index) => {
          const isLeft = index % 2 === 0;
          return (
            <TimelineItem key={item.id} $isLeft={isLeft}>
              <IndexCircle $status={item.status} $isLeft={isLeft}>
                {item.id}
              </IndexCircle>
              <ContentCard $status={item.status}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <StatusBadge $status={item.status}>
                    {item.status === 'completed' ? '已发布' : item.status === 'in-progress' ? '更新中' : '计划中'}
                  </StatusBadge>
                  <span style={{ fontSize: '0.8rem', color: '#999', fontWeight: 500 }}>{item.gameType}</span>
                </div>
                
                <CourseTitle>
                  {item.courseId ? (
                    <Link to={`/courses/${item.courseId}`}>{item.title}</Link>
                  ) : (
                    item.title
                  )}
                </CourseTitle>
                
                <TechStack>🛠 {item.techStack}</TechStack>
                <Description>{item.description}</Description>
                
                {item.courseId && (
                  <LearnMoreLink to={`/courses/${item.courseId}`}>
                    开始学习 →
                  </LearnMoreLink>
                )}
              </ContentCard>
            </TimelineItem>
          );
        })}
      </TimelineContainer>
    </PageContainer>
  );
};

export default RoadmapPage;