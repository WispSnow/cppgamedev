import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const NavbarContainer = styled.header`
  background-color: var(--card-bg-color, #ffffff);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
  transition: background-color 0.3s ease;
`;

const NavbarContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary-color, #0066cc);
  text-decoration: none;
  display: flex;
  align-items: center;
  
  &:hover {
    opacity: 0.9;
  }
`;

const LogoIcon = styled.span`
  font-size: 1.8rem;
  margin-right: 0.5rem;
`;

const NavLinks = styled.nav`
  display: flex;
  gap: 1.5rem;
`;

const NavLink = styled(Link)`
  color: var(--text-color, #333);
  text-decoration: none;
  font-weight: 500;
  padding: 0.3rem 0.5rem;
  border-radius: 4px;
  transition: all 0.2s;
  
  &:hover, &.active {
    color: var(--primary-color, #0066cc);
    background-color: var(--toc-active-bg, rgba(0, 102, 204, 0.1));
  }
`;

const ThemeButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-color, #333);
  font-size: 1.2rem;
  padding: 0.3rem 0.5rem;
  display: flex;
  align-items: center;
  transition: all 0.2s;
  border-radius: 4px;
  
  &:hover {
    background-color: var(--toc-hover-bg, rgba(0, 0, 0, 0.05));
  }
`;

const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <NavbarContainer>
      <NavbarContent>
        <Logo to="/">
          <LogoIcon>📚</LogoIcon>
          首页
        </Logo>
        <NavLinks>
          <NavLink to="/">主线</NavLink>
          <NavLink to="/side-quests">支线</NavLink>
          <NavLink to="/troubleshooting">疑难解决</NavLink>
          <NavLink to="/courses">全部任务</NavLink>
          <ThemeButton onClick={toggleTheme} aria-label="切换主题">
            {theme === 'light' ? '🌙' : '☀️'}
          </ThemeButton>
        </NavLinks>
      </NavbarContent>
    </NavbarContainer>
  );
};

export default Navbar; 