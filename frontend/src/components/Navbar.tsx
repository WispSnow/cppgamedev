import React, { useState } from 'react';
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import SearchModal from './SearchModal';

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
  position: relative;
`;

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary-color, #0066cc);
  text-decoration: none;
  display: flex;
  align-items: center;
  z-index: 102;
  
  &:hover {
    opacity: 0.9;
  }
`;

const LogoIcon = styled.span`
  font-size: 1.8rem;
  margin-right: 0.5rem;
`;

const NavLinks = styled.nav<{ $isOpen: boolean }>`
  display: flex;
  gap: 1.5rem;
  align-items: center;

  @media (max-width: 768px) {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--card-bg-color, #ffffff);
    flex-direction: column;
    justify-content: center;
    padding: 2rem;
    gap: 2rem;
    transform: ${props => props.$isOpen ? 'translateX(0)' : 'translateX(100%)'};
    transition: transform 0.3s ease-in-out;
    z-index: 101;
  }
`;

const NavLink = styled(Link)<{ $isActive?: boolean }>`
  color: ${props => props.$isActive ? 'var(--primary-color, #0066cc)' : 'var(--text-color, #333)'};
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.2s;
  font-size: 1rem;
  
  &:hover {
    color: var(--primary-color, #0066cc);
    background-color: var(--toc-active-bg, rgba(0, 102, 204, 0.1));
  }

  @media (max-width: 768px) {
    font-size: 1.5rem;
    width: 100%;
    text-align: center;
    padding: 1rem;
  }
`;

const ActionGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 102;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-color, #333);
  font-size: 1.2rem;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  border-radius: 4px;
  
  &:hover {
    background-color: var(--toc-hover-bg, rgba(0, 0, 0, 0.05));
  }
`;

const HamburgerButton = styled(IconButton)`
  display: none;
  font-size: 1.5rem;
  margin-left: 0.5rem;
  
  @media (max-width: 768px) {
    display: flex;
  }
`;

const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (!isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    document.body.style.overflow = 'unset';
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <NavbarContainer>
      <NavbarContent>
        <Logo to="/" onClick={closeMenu}>
          <LogoIcon>📚</LogoIcon>
          首页
        </Logo>

        <NavLinks $isOpen={isMenuOpen}>
          <NavLink to="/mainline" $isActive={isActive('/mainline')} onClick={closeMenu}>主线</NavLink>
          <NavLink to="/side-quests" $isActive={isActive('/side-quests')} onClick={closeMenu}>支线</NavLink>
          <NavLink to="/roadmap" $isActive={isActive('/roadmap')} onClick={closeMenu}>路线图</NavLink>
          <NavLink to="/troubleshooting" $isActive={isActive('/troubleshooting')} onClick={closeMenu}>疑难解决</NavLink>
          <NavLink to="/faq" $isActive={isActive('/faq')} onClick={closeMenu}>FAQ</NavLink>
        </NavLinks>

        <ActionGroup>
          <IconButton onClick={() => setIsSearchOpen(true)} aria-label="搜索">
            🔍
          </IconButton>
          <IconButton onClick={toggleTheme} aria-label="切换主题">
            {theme === 'light' ? '🌙' : '☀️'}
          </IconButton>
          <HamburgerButton onClick={toggleMenu} aria-label="菜单">
            {isMenuOpen ? '✕' : '☰'}
          </HamburgerButton>
        </ActionGroup>

      </NavbarContent>
      {isSearchOpen && <SearchModal onClose={() => setIsSearchOpen(false)} />}
    </NavbarContainer>
  );
};

export default Navbar; 