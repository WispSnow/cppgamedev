import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import SEOHelmet from '../components/SEOHelmet';

const Container = styled.div`
  max-width: 640px;
  margin: 4rem auto;
  padding: 0 1.5rem;
  text-align: center;
`;

const StatusCode = styled.p`
  margin: 0;
  font-size: 4rem;
  font-weight: 700;
  line-height: 1.2;
  color: var(--primary-color, #0066cc);
`;

const Title = styled.h1`
  margin: 0.5rem 0 1rem;
  color: var(--text-color, #333);
`;

const Description = styled.p`
  margin: 0 0 2rem;
  color: var(--secondary-text-color, #666);
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
`;

const ActionLink = styled(Link)<{ $primary?: boolean }>`
  padding: 0.6rem 1.25rem;
  border-radius: 6px;
  border: 1px solid var(--primary-color, #0066cc);
  background-color: ${props => (props.$primary ? 'var(--primary-color, #0066cc)' : 'transparent')};
  color: ${props => (props.$primary ? 'var(--on-primary-color, #ffffff)' : 'var(--primary-color, #0066cc)')};
  font-weight: 500;

  &:hover {
    opacity: 0.9;
  }
`;

interface NotFoundPageProps {
  message?: string;
}

const NotFoundPage: React.FC<NotFoundPageProps> = ({
  message = '你访问的页面不存在，可能已经被移动或删除。',
}) => (
  <Container>
    <SEOHelmet title="页面未找到 | C++游戏开发" description={message} noindex />
    <StatusCode>404</StatusCode>
    <Title>页面未找到</Title>
    <Description>{message}</Description>
    <Actions>
      <ActionLink to="/" $primary>返回首页</ActionLink>
      <ActionLink to="/courses">浏览全部课程</ActionLink>
    </Actions>
  </Container>
);

export default NotFoundPage;
