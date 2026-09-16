import React from 'react';
import { Link, useParams } from 'react-router-dom';
import styled from 'styled-components';
import SEOHelmet from '../components/SEOHelmet';
import GiscusComments from '../components/GiscusComments';
import ProjectActions from '../components/ProjectActions';
import ProjectBadges from '../components/ProjectBadges';
import NotFoundPage from './NotFoundPage';
import { getProjectById } from '../data/projectsData';

const PageContainer = styled.div`
  max-width: 820px;
  margin: 0 auto;
  padding: 2rem 1rem 3rem;
`;

const BackLink = styled(Link)`
  display: inline-block;
  margin-bottom: 1.5rem;
  color: var(--secondary-text-color, #666);
  font-size: 0.9rem;

  &:hover {
    color: var(--primary-color, #0066cc);
  }
`;

const Title = styled.h1`
  margin: 0.75rem 0 0.5rem;
  font-size: 2.2rem;
  color: var(--text-color);

  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`;

const Tagline = styled.p`
  margin: 0 0 1.5rem;
  color: var(--secondary-text-color, #666);
  font-size: 1.05rem;
  line-height: 1.7;
`;

const Figure = styled.figure`
  margin: 0 0 1.5rem;
`;

const Shot = styled.img<{ $pixelated?: boolean }>`
  width: 100%;
  max-height: 440px;
  object-fit: contain;
  display: block;
  border: 1px solid var(--border-color, #eaeaea);
  border-radius: 10px;
  background-color: var(--code-block-bg, #f6f8fa);
  image-rendering: ${props => (props.$pixelated ? 'pixelated' : 'auto')};
`;

const Caption = styled.figcaption`
  margin-top: 0.5rem;
  text-align: center;
  font-size: 0.85rem;
  color: var(--secondary-text-color, #666);
`;

const Section = styled.section`
  margin-top: 2.5rem;
`;

const SectionTitle = styled.h2`
  margin: 0 0 1rem;
  font-size: 1.35rem;
  color: var(--text-color);
`;

const Highlights = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`;

const Highlight = styled.li`
  position: relative;
  padding-left: 1.5rem;
  color: var(--text-color);
  line-height: 1.7;

  &::before {
    content: '▸';
    position: absolute;
    left: 0;
    color: var(--primary-color, #0066cc);
  }
`;

const Paragraph = styled.p`
  margin: 0 0 1rem;
  line-height: 1.85;
  color: var(--text-color);
`;

const MetaList = styled.dl`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 0.6rem 1.25rem;
  margin: 0;
  padding: 1.25rem;
  border: 1px solid var(--border-color, #eaeaea);
  border-radius: 10px;
  background-color: var(--card-bg-color, #fff);
  font-size: 0.95rem;

  dt {
    color: var(--secondary-text-color, #666);
  }

  dd {
    margin: 0;
    color: var(--text-color);
  }
`;

const Notice = styled.p`
  margin: 2.5rem 0 0;
  padding: 1rem 1.25rem;
  border-left: 3px solid var(--border-color, #eaeaea);
  background-color: var(--toc-bg-color, #f8f9fa);
  color: var(--secondary-text-color, #666);
  font-size: 0.9rem;
  line-height: 1.8;
`;

const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const project = getProjectById(projectId);

  if (!project) {
    return <NotFoundPage message="这个作品不存在，可能已经调整或者地址有误。" />;
  }

  const devices = project.platforms.includes('mobile') ? '电脑、手机浏览器' : '电脑浏览器，需要键盘';

  return (
    <PageContainer>
      <SEOHelmet
        title={`${project.title} | 作品`}
        description={project.tagline}
        keywords={`${project.title},${project.techStack.join(',')},游戏作品,在线试玩`}
        ogImage={project.cover.src}
        canonical={`/projects/${project.id}`}
      />

      <BackLink to="/projects">← 返回作品列表</BackLink>

      <ProjectBadges project={project} />
      <Title>{project.title}</Title>
      <Tagline>{project.tagline}</Tagline>

      <Figure>
        <Shot
          src={project.cover.src}
          alt={project.cover.alt}
          $pixelated={project.cover.pixelated}
        />
      </Figure>

      <ProjectActions project={project} large />

      <Section>
        <SectionTitle>亮点</SectionTitle>
        <Highlights>
          {project.highlights.map(item => (
            <Highlight key={item}>{item}</Highlight>
          ))}
        </Highlights>
      </Section>

      <Section>
        <SectionTitle>项目介绍</SectionTitle>
        {project.body.map(paragraph => (
          <Paragraph key={paragraph}>{paragraph}</Paragraph>
        ))}
      </Section>

      {project.shots && project.shots.length > 0 && (
        <Section>
          <SectionTitle>画面</SectionTitle>
          {project.shots.map(shot => (
            <Figure key={shot.src}>
              <Shot src={shot.src} alt={shot.alt} loading="lazy" $pixelated={shot.pixelated} />
              {shot.caption && <Caption>{shot.caption}</Caption>}
            </Figure>
          ))}
        </Section>
      )}

      <Section>
        <SectionTitle>信息</SectionTitle>
        <MetaList>
          <dt>技术栈</dt>
          <dd>{project.techStack.join(' · ')}</dd>
          <dt>运行环境</dt>
          <dd>{devices}</dd>
          {project.author && (
            <>
              <dt>作者</dt>
              <dd>{project.author}</dd>
            </>
          )}
          <dt>更新于</dt>
          <dd>{project.updatedAt}</dd>
        </MetaList>
      </Section>

      {project.notice && <Notice>{project.notice}</Notice>}

      <GiscusComments />
    </PageContainer>
  );
};

export default ProjectDetailPage;
