import React, { Suspense } from 'react';
import { Link, useParams } from 'react-router-dom';
import styled from 'styled-components';
import SEOHelmet from '../components/SEOHelmet';
import { PageShell, Eyebrow, RelatedLinks } from '../components/Workshop';
import ProjectActions from '../components/ProjectActions';
import ProjectBadges from '../components/ProjectBadges';
import NotFoundPage from './NotFoundPage';
import { getProjectById } from '../data/projectsData';

const GiscusComments = React.lazy(() => import('../components/GiscusComments'));

const Hero = styled.div`
  display: grid;
  grid-template-columns: 1.15fr 1fr;
  align-items: center;
  gap: 2.5rem;
  padding: 1.5rem 0 2.5rem;
  border-bottom: 1px solid var(--border-color);
  @media (max-width: 850px) { grid-template-columns: 1fr; gap: 1.5rem; }
`;
const HeroInfo = styled.div`min-width: 0;`;
const Body = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: 3rem;
  align-items: start;
  @media (max-width: 850px) { grid-template-columns: 1fr; gap: 0; }
`;
const Info = styled.aside`
  position: sticky;
  top: 100px;
  @media (max-width: 850px) { position: static; }
`;
const Gallery = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  @media (max-width: 600px) { grid-template-columns: 1fr; }
  a { display: block; border-radius: var(--card-radius); }
  a:hover { outline: 1px solid var(--primary-color); }
  small { display: block; margin-top: 0.5rem; color: var(--primary-color); font-size: 0.75rem; }
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
  font-size: clamp(1.8rem, 3vw, 2.5rem);
  line-height: 1.3;
  letter-spacing: -0.04em;
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
  grid-template-columns: minmax(0, 1fr);
  gap: 0.35rem;
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
    margin: 0 0 0.7rem;
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
    <PageShell>
      <SEOHelmet
        title={`${project.title} | 作品`}
        description={project.tagline}
        keywords={`${project.title},${project.techStack.join(',')},游戏作品,在线试玩`}
        ogImage={project.cover.src}
        canonical={`/projects/${project.id}`}
      />

      <BackLink to="/projects">← 返回作品列表</BackLink>

      <Eyebrow>PROJECT FILE / 作品档案</Eyebrow>
      <Hero>
        <Figure>
          <Shot src={project.cover.src} alt={project.cover.alt} $pixelated={project.cover.pixelated} fetchPriority="high" />
        </Figure>
        <HeroInfo>
          <ProjectBadges project={project} />
          <Title>{project.title}</Title>
          <Tagline>{project.tagline}</Tagline>
          <ProjectActions project={project} large />
        </HeroInfo>
      </Hero>

      <Body>
        <div>
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
              <Gallery>{project.shots.map(shot => (
                <Figure key={shot.src}>
                  <a href={shot.src} target="_blank" rel="noopener noreferrer" aria-label={`查看原图：${shot.alt}`}>
                    <Shot src={shot.src} alt={shot.alt} loading="lazy" decoding="async" $pixelated={shot.pixelated} />
                  </a>
                  <Caption>{shot.caption || shot.alt}<small>点击画面查看原图 ↗</small></Caption>
                </Figure>
              ))}</Gallery>
            </Section>
          )}

          {project.notice && <Notice>{project.notice}</Notice>}
        </div>
        <Info>
          <Section>
            <SectionTitle>项目资料</SectionTitle>
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

        </Info>
      </Body>
      <RelatedLinks aria-label="探索更多"><Link to="/projects">更多作品与实验 →</Link><Link to="/collaborate">一起做游戏 →</Link></RelatedLinks>
      <Suspense fallback={null}><GiscusComments /></Suspense>
    </PageShell>
  );
};

export default ProjectDetailPage;
