import React from 'react';
import styled from 'styled-components';
import { CoursePart } from '../types';

const Container = styled.div`margin: 0 0 1.8rem;`;
const Label = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.6rem;
  color: var(--secondary-text-color);
  font: 0.75rem/1.6 var(--font-mono);
`;
const Track = styled.div`
  height: 4px;
  background: var(--progress-bar-bg);
  border-radius: 2px;
  overflow: hidden;
`;
const Fill = styled.div<{ $percentage: number }>`
  height: 100%;
  width: ${p => p.$percentage}%;
  background: var(--primary-color);
`;
interface Props { currentPartId: string; allParts: CoursePart[]; }
export default function ProgressIndicator({ currentPartId, allParts }: Props) {
  const position = allParts.findIndex(part => part.id === currentPartId) + 1;
  const total = allParts.length;
  if (!total || !position) return null;
  return <Container>
    <Label><span>课程位置</span><span>第 {position} / {total} 节</span></Label>
    <Track role="progressbar" aria-label="当前章节位置" aria-valuemin={0} aria-valuemax={total} aria-valuenow={position} aria-valuetext={`当前第 ${position} 节，共 ${total} 节`}><Fill $percentage={position / total * 100} /></Track>
  </Container>;
}
