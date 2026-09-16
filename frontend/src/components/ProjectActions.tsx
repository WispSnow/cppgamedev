import React, { useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import { Project } from '../data/projectsData';
import { useCoarsePointer } from '../hooks/useCoarsePointer';
import { trackOutboundClick } from '../utils/analytics';

type ActionKey = 'play' | 'video' | 'devlog' | 'source';

const actionLabels: Record<ActionKey, string> = {
  play: '在线试玩',
  video: '看演示',
  devlog: '开发手记',
  source: '源码',
};

interface ActionStyleProps {
  $primary?: boolean;
  $large?: boolean;
}

const actionStyles = css<ActionStyleProps>`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: ${props => (props.$large ? '0.6rem 1.2rem' : '0.45rem 0.9rem')};
  border-radius: 6px;
  border: 1px solid ${props => (props.$primary ? 'transparent' : 'var(--border-color, #eaeaea)')};
  background-color: ${props =>
    props.$primary ? 'var(--primary-color, #0066cc)' : 'var(--card-bg-color, #ffffff)'};
  color: ${props => (props.$primary ? 'var(--on-primary-color, #ffffff)' : 'var(--text-color, #333)')};
  font-size: ${props => (props.$large ? '1rem' : '0.9rem')};
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: background-color 0.2s, border-color 0.2s, transform 0.15s;

  &:hover {
    background-color: ${props =>
      props.$primary ? 'var(--primary-hover-color, #0055aa)' : 'var(--hover-bg-color, #f5f5f5)'};
    border-color: ${props => (props.$primary ? 'transparent' : 'var(--primary-color, #0066cc)')};
  }

  &:active {
    transform: scale(0.97);
  }
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`;

const Notice = styled.p`
  margin: 0;
  padding: 0.45rem 0.7rem;
  border-radius: 6px;
  background-color: var(--subtle-button-bg, #f0f0f0);
  color: var(--secondary-text-color, #666);
  font-size: 0.85rem;
  line-height: 1.5;
`;

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.6rem;
`;

const ExternalAction = styled.a<ActionStyleProps>`
  ${actionStyles}
`;

const ButtonAction = styled.button<ActionStyleProps>`
  ${actionStyles}
`;

const CopyState = styled.span`
  font-size: 0.85rem;
  color: var(--secondary-text-color, #666);
`;

const Pending = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: var(--secondary-text-color, #666);
`;

interface ProjectActionsProps {
  project: Project;
  /** 详情页用大按钮 */
  large?: boolean;
}

const ProjectActions: React.FC<ProjectActionsProps> = ({ project, large = false }) => {
  const isCoarsePointer = useCoarsePointer();
  const [copyState, setCopyState] = useState<'idle' | 'done' | 'failed'>('idle');
  const { play, video, devlog, source } = project.links;

  useEffect(() => {
    if (copyState === 'idle') return;
    const timer = setTimeout(() => setCopyState('idle'), 2500);
    return () => clearTimeout(timer);
  }, [copyState]);

  // 只支持电脑的作品，在触摸设备上先给提示：主按钮换成演示视频，试玩仍留在后面
  // （平板接了键盘照样能玩，不该直接藏掉入口）
  const needsDesktop = isCoarsePointer && !project.platforms.includes('mobile');

  const hrefs: Partial<Record<ActionKey, string>> = { play, video, devlog, source };
  const order: ActionKey[] = needsDesktop && video ? ['video', 'play', 'devlog'] : ['play', 'video', 'devlog'];
  const actions = order.filter((key): key is ActionKey => Boolean(hrefs[key]));
  if (source) actions.push('source');

  const handleCopy = async () => {
    if (!play || !navigator.clipboard) {
      setCopyState('failed');
      return;
    }
    try {
      await navigator.clipboard.writeText(play);
      setCopyState('done');
    } catch {
      setCopyState('failed');
    }
  };

  if (actions.length === 0) {
    return project.status === 'coming-soon' ? <Pending>上线后这里会补上试玩入口。</Pending> : null;
  }

  return (
    <Wrapper>
      {needsDesktop && (
        <Notice>这个作品需要电脑和键盘，手机上可以先看画面，或把链接发到电脑上打开。</Notice>
      )}
      <Row>
        {actions.map((key, index) => (
          <ExternalAction
            key={key}
            href={hrefs[key]}
            target="_blank"
            rel="noopener noreferrer"
            $primary={index === 0}
            $large={large}
            onClick={() => trackOutboundClick(`${project.id} · ${actionLabels[key]}`, hrefs[key] as string)}
          >
            {actionLabels[key]}
          </ExternalAction>
        ))}
        {needsDesktop && play && (
          <ButtonAction type="button" $large={large} onClick={handleCopy}>
            复制链接
          </ButtonAction>
        )}
        <CopyState role="status" aria-live="polite">
          {copyState === 'done' && '已复制试玩链接'}
          {copyState === 'failed' && '复制失败，请长按上面的链接'}
        </CopyState>
      </Row>
    </Wrapper>
  );
};

export default ProjectActions;
