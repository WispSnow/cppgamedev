import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { CoursePart } from '../types';

const NavContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 3rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
`;

const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  color: #0066cc;
  text-decoration: none;
  padding: 0.7rem 1rem;
  border-radius: 4px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #f0f5ff;
  }
`;

const PrevLink = styled(NavLink)`
  justify-content: flex-start;
`;

const NextLink = styled(NavLink)`
  justify-content: flex-end;
`;

const NavIcon = styled.span`
  margin: 0 0.5rem;
`;

const NavText = styled.span`
  display: flex;
  flex-direction: column;
`;

const NavDirection = styled.span`
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 0.2rem;
`;

const NavTitle = styled.span`
  font-weight: 500;
`;

const Spacer = styled.div`
  width: 1rem;
`;

interface ChapterNavigationProps {
  courseId: string;
  currentPartId: string;
  allParts: CoursePart[];
}

const ChapterNavigation: React.FC<ChapterNavigationProps> = ({ 
  courseId, 
  currentPartId, 
  allParts 
}) => {
  // 找出当前章节的索引
  const currentIndex = allParts.findIndex(part => part.id === currentPartId);
  
  // 确定上一章和下一章
  const prevPart = currentIndex > 0 ? allParts[currentIndex - 1] : null;
  const nextPart = currentIndex < allParts.length - 1 ? allParts[currentIndex + 1] : null;
  
  return (
    <NavContainer>
      {prevPart ? (
        <PrevLink to={`/courses/${courseId}/parts/${prevPart.id}`}>
          <NavIcon>←</NavIcon>
          <NavText>
            <NavDirection>上一章</NavDirection>
            <NavTitle>{prevPart.title}</NavTitle>
          </NavText>
        </PrevLink>
      ) : (
        <Spacer />
      )}
      
      {nextPart ? (
        <NextLink to={`/courses/${courseId}/parts/${nextPart.id}`}>
          <NavText>
            <NavDirection>下一章</NavDirection>
            <NavTitle>{nextPart.title}</NavTitle>
          </NavText>
          <NavIcon>→</NavIcon>
        </NextLink>
      ) : (
        <Spacer />
      )}
    </NavContainer>
  );
};

export default ChapterNavigation; 