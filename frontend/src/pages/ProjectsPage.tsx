import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import SEOHelmet from '../components/SEOHelmet';
import ProjectCard from '../components/ProjectCard';
import { projects } from '../data/projectsData';

const PageContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 1rem 3rem;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2.5rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: var(--text-color);

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  color: var(--secondary-text-color);
  font-size: 1.05rem;
  max-width: 620px;
  margin: 0 auto;
  line-height: 1.7;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const FooterNote = styled.p`
  margin: 3rem 0 0;
  text-align: center;
  color: var(--secondary-text-color);
  font-size: 0.95rem;

  a {
    color: var(--primary-color, #0066cc);
    text-decoration: underline;
  }
`;

const ProjectsPage: React.FC = () => (
  <PageContainer>
    <SEOHelmet
      title="作品 | C++游戏开发"
      description="课程之外做的小游戏与开发实验：《天使帝国 II》Web 复刻、AI 协作开发的 3D 小游戏，大多可以直接在浏览器里打开。"
      keywords="游戏作品,在线试玩,独立游戏,天使帝国,Phaser,Three.js,游戏开发"
      canonical="/projects"
    />
    <Header>
      <Title>作品</Title>
      <Subtitle>
        课程之外做的小游戏和实验，技术栈不限于 C++，大多可以直接在浏览器里打开。
      </Subtitle>
    </Header>

    <List>
      {projects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </List>

    <FooterNote>
      想一起做点什么？欢迎看看 <Link to="/collaborate">合作开发</Link>。
    </FooterNote>
  </PageContainer>
);

export default ProjectsPage;
