import React, { useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { CoursePart } from '../types';

interface TOCContainerProps {
  $isVisible: boolean;
}

const TOCContainer = styled.div<TOCContainerProps>`
  position: fixed;
  right: ${props => props.$isVisible ? '2rem' : '-280px'};
  top: 10rem;
  width: 250px;
  max-height: 70vh;
  overflow-y: auto;
  background-color: var(--toc-bg-color, #f8f9fa);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 1rem;
  /* 收起后设为 hidden，里面的链接就不会再被 Tab 键聚焦；等滑出动画结束再隐藏 */
  visibility: ${props => props.$isVisible ? 'visible' : 'hidden'};
  transition: right 0.3s ease, visibility 0s linear ${props => props.$isVisible ? '0s' : '0.3s'};
  z-index: 100;

  @media (max-width: 1200px) {
    top: 80px;
    height: calc(100vh - 100px);
    right: ${props => props.$isVisible ? '0' : '-100%'};
    width: 280px;
    /* 回顶按钮浮在面板右下角，底部留白让最后几项能滚到它上方 */
    padding-bottom: 6rem;
    border-radius: 8px 0 0 8px;
  }
`;

const TOCTitle = styled.h3`
  margin-top: 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color, #eaeaea);
  color: var(--text-color, #333);
`;

const TOCList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
`;

const TOCItem = styled.li`
  margin: 0.5rem 0;
`;

const TOCLink = styled(Link)<{ $active: boolean }>`
  display: block;
  padding: 0.5rem;
  color: ${props => props.$active ? 'var(--primary-color, #0066cc)' : 'var(--text-color, #333)'};
  text-decoration: none;
  border-radius: 4px;
  font-weight: ${props => props.$active ? 'bold' : 'normal'};
  background-color: ${props => props.$active ? 'var(--toc-active-bg, rgba(0, 102, 204, 0.1))' : 'transparent'};
  transition: all 0.2s;

  &:hover {
    background-color: var(--toc-hover-bg, rgba(0, 0, 0, 0.05));
  }
`;

const ToggleButton = styled.button<{ $isVisible: boolean }>`
  position: fixed;
  right: ${props => props.$isVisible ? '260px' : '1rem'};
  top: 10rem;
  width: 40px;
  height: 40px;
  background-color: var(--primary-color, #0066cc);
  color: white;
  border: none;
  border-radius: 8px 0 0 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 99;
  transition: right 0.3s ease;
  box-shadow: -2px 2px 5px rgba(0, 0, 0, 0.1);
  font-size: 1.2rem;

  &:hover {
    background-color: #0055aa;
  }

  @media (max-width: 1200px) {
    top: auto;
    /* 放在回顶按钮（ScrollToTopButton：bottom 2rem、right 2rem、44px）正上方，两者不再重叠；
       right 比它少 2px，让这个 48px 的按钮和回顶按钮中心对齐 */
    bottom: calc(2rem + 44px + 0.75rem);
    right: ${props => props.$isVisible ? '280px' : 'calc(2rem - 2px)'};
    border-radius: 50%;
    width: 48px;
    height: 48px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  }
`;

interface TableOfContentsProps {
  courseId: string;
  parts: CoursePart[];
  currentPartId?: string;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ courseId, parts, currentPartId }) => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <>
      <ToggleButton
        onClick={toggleVisibility}
        $isVisible={isVisible}
        aria-label={isVisible ? "隐藏目录" : "显示目录"}
        aria-expanded={isVisible}
        aria-controls="course-toc"
      >
        {isVisible ? "≫" : "≪"}
      </ToggleButton>

      <TOCContainer id="course-toc" $isVisible={isVisible}>
        <TOCTitle>目录</TOCTitle>
        <TOCList>
          {parts.map(part => (
            <TOCItem key={part.id}>
              <TOCLink
                to={`/courses/${courseId}/parts/${part.id}`}
                $active={currentPartId === part.id}
              >
                {part.title}
              </TOCLink>
            </TOCItem>
          ))}
        </TOCList>
      </TOCContainer>
    </>
  );
};

export default TableOfContents;
