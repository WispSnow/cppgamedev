import React from 'react';
import styled from 'styled-components';
import { CoursePart } from '../types';

const ProgressContainer = styled.div`
  margin: 2rem 0;
  padding: 1rem;
  background-color: var(--progress-bg-color, #f5f7fa);
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const ProgressTitle = styled.h4`
  margin-top: 0;
  margin-bottom: 0.75rem;
  color: var(--text-color, #333);
`;

const ProgressBar = styled.div`
  height: 8px;
  width: 100%;
  background-color: var(--progress-bar-bg, #e0e0e0);
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ percentage: number }>`
  height: 100%;
  width: ${props => props.percentage}%;
  background-color: var(--primary-color, #0066cc);
  border-radius: 4px;
  transition: width 0.5s ease;
`;

const ProgressDetails = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: var(--secondary-text-color, #666);
`;

const CompletionPercentage = styled.span`
  font-weight: bold;
`;

interface ProgressIndicatorProps {
  currentPartId: string;
  allParts: CoursePart[];
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ currentPartId, allParts }) => {
  // 获取当前章节的索引
  const currentIndex = allParts.findIndex(part => part.id === currentPartId);
  
  // 计算完成百分比
  const completedCount = currentIndex + 1;
  const totalCount = allParts.length;
  const completionPercentage = Math.round((completedCount / totalCount) * 100);
  
  return (
    <ProgressContainer>
      <ProgressTitle>学习进度</ProgressTitle>
      <ProgressBar>
        <ProgressFill percentage={completionPercentage} />
      </ProgressBar>
      <ProgressDetails>
        <span>已完成 {completedCount}/{totalCount} 章</span>
        <CompletionPercentage>{completionPercentage}%</CompletionPercentage>
      </ProgressDetails>
    </ProgressContainer>
  );
};

export default ProgressIndicator; 