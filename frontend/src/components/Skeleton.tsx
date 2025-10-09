import React from 'react';
import styled, { keyframes } from 'styled-components';

const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: 200px 0;
  }
`;

const BaseSkeleton = styled.div<{ $width?: string; $height?: string; $radius?: string }>`
  background: linear-gradient(90deg, rgba(0,0,0,0.06) 25%, rgba(0,0,0,0.12) 37%, rgba(0,0,0,0.06) 63%);
  background-size: 400px 100%;
  animation: ${shimmer} 1.4s ease infinite;
  border-radius: ${({ $radius }) => $radius || '8px'};
  width: ${({ $width }) => $width || '100%'};
  height: ${({ $height }) => $height || '16px'};
  margin-bottom: 0.75rem;
`;

interface SkeletonProps {
  width?: string;
  height?: string;
  radius?: string;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ width, height, radius, className }) => (
  <BaseSkeleton $width={width} $height={height} $radius={radius} className={className} />
);

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const Card = styled.div`
  background-color: var(--card-bg-color, #ffffff);
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
`;

const CardMedia = styled(Skeleton)`
  height: 180px;
  margin-bottom: 0;
`;

const CardBody = styled.div`
  padding: 1.5rem;
`;

export const CourseCardSkeletonGrid: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <CardGrid>
    {Array.from({ length: count }).map((_, index) => (
      <Card key={index}>
        <CardMedia radius="0" />
        <CardBody>
          <Skeleton height="22px" />
          <Skeleton width="80%" />
          <Skeleton width="60%" />
          <Skeleton width="40%" height="18px" />
        </CardBody>
      </Card>
    ))}
  </CardGrid>
);

const PartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
`;

const PartCard = styled.div`
  background-color: var(--card-bg-color, #ffffff);
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

export const PartCardSkeletonList: React.FC<{ count?: number }> = ({ count = 4 }) => (
  <PartsGrid>
    {Array.from({ length: count }).map((_, index) => (
      <PartCard key={index}>
        <Skeleton height="20px" />
        <Skeleton width="85%" />
        <Skeleton width="55%" height="14px" />
      </PartCard>
    ))}
  </PartsGrid>
);

const ArticleSkeletonContainer = styled.div`
  padding: 2rem;
  background-color: var(--card-bg-color, #ffffff);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

export const ArticleSkeleton: React.FC<{ paragraphs?: number }> = ({ paragraphs = 6 }) => (
  <ArticleSkeletonContainer>
    <Skeleton height="32px" />
    <Skeleton width="50%" height="18px" />
    <Skeleton width="35%" height="16px" />
    {Array.from({ length: paragraphs }).map((_, index) => (
      <React.Fragment key={index}>
        <Skeleton height="16px" />
        <Skeleton width="95%" height="16px" />
        <Skeleton width="90%" height="16px" />
      </React.Fragment>
    ))}
  </ArticleSkeletonContainer>
);

export default Skeleton;
