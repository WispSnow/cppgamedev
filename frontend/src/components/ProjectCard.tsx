import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Project } from '../data/projectsData';
import ProjectActions from './ProjectActions';
import ProjectBadges from './ProjectBadges';

type CardVariant = 'row' | 'grid';

const Card = styled.article<{ $variant: CardVariant }>`
  position: relative;
  display: grid;
  grid-template-columns: ${props => (props.$variant === 'row' ? 'minmax(0, 300px) minmax(0, 1fr)' : '1fr')};
  background-color: var(--card-bg-color, #ffffff);
  border: 1px solid var(--border-color, #eaeaea);
  border-radius: 10px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  }

  &:focus-within {
    border-color: var(--primary-color, #0066cc);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

// 横向卡片里封面按 16:9 显示并垂直居中，不跟着卡片高度拉伸：
// 拉伸会把标题画面这类两侧有内容的封面裁掉一大块
const CoverFrame = styled.div<{ $variant: CardVariant }>`
  align-self: ${props => (props.$variant === 'row' ? 'center' : 'stretch')};
  padding: ${props => (props.$variant === 'row' ? '1.25rem 0 1.25rem 1.25rem' : '0')};

  @media (max-width: 768px) {
    align-self: stretch;
    padding: 0;
  }
`;

const CoverClip = styled.div<{ $variant: CardVariant }>`
  overflow: hidden;
  aspect-ratio: 16 / 9;
  border-radius: ${props => (props.$variant === 'row' ? '8px' : '0')};
  background-color: var(--code-block-bg, #f6f8fa);

  @media (max-width: 768px) {
    border-radius: 0;
  }
`;

const Cover = styled.img<{ $pixelated?: boolean }>`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  image-rendering: ${props => (props.$pixelated ? 'pixelated' : 'auto')};
  transition: transform 0.3s ease;

  ${Card}:hover & {
    transform: scale(1.04);
  }
`;

const Content = styled.div`
  padding: 1.25rem 1.4rem 1.4rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  min-width: 0;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 1.3rem;
  color: var(--text-color, #333);

  @media (max-width: 480px) {
    font-size: 1.15rem;
  }
`;

// 整张卡片都能点进详情页：链接铺满卡片，按钮层用 z-index 盖在上面
const TitleLink = styled(Link)`
  color: inherit;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
  }

  ${Card}:hover & {
    color: var(--primary-color, #0066cc);
  }
`;

const Tagline = styled.p`
  margin: 0;
  color: var(--secondary-text-color, #666);
  font-size: 0.95rem;
  line-height: 1.7;
`;

const TechRow = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin: 0;
  padding: 0;
  list-style: none;
`;

const Tech = styled.li`
  padding: 0.15rem 0.55rem;
  border-radius: 4px;
  background-color: var(--subtle-button-bg, #f0f0f0);
  color: var(--secondary-text-color, #666);
  font-size: 0.75rem;
`;

const ActionArea = styled.div`
  position: relative;
  z-index: 1;
  margin-top: 0.2rem;
`;

const Notice = styled.p`
  margin: 0;
  font-size: 0.75rem;
  line-height: 1.6;
  color: var(--secondary-text-color, #666);
  opacity: 0.85;
`;

interface ProjectCardProps {
  project: Project;
  variant?: CardVariant;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, variant = 'row' }) => (
  <Card $variant={variant}>
    <CoverFrame $variant={variant}>
      <CoverClip $variant={variant}>
        <Cover
          src={project.cover.src}
          alt={project.cover.alt}
          loading="lazy"
          $pixelated={project.cover.pixelated}
        />
      </CoverClip>
    </CoverFrame>
    <Content>
      <ProjectBadges project={project} />
      <Title>
        <TitleLink to={`/projects/${project.id}`}>{project.title}</TitleLink>
      </Title>
      <Tagline>{project.tagline}</Tagline>
      <TechRow>
        {project.techStack.map(tech => (
          <Tech key={tech}>{tech}</Tech>
        ))}
      </TechRow>
      <ActionArea>
        <ProjectActions project={project} />
      </ActionArea>
      {variant === 'row' && project.notice && <Notice>{project.notice}</Notice>}
    </Content>
  </Card>
);

export default ProjectCard;
