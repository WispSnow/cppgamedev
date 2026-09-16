import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import SearchModal from './SearchModal';
import Icon from './Icon';

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--card-bg-color);
  border-bottom: 1px solid var(--border-color);
`;
const Content = styled.div`
  max-width: 1240px;
  min-height: 76px;
  padding: 0.8rem 2rem;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  @media (max-width: 600px) { min-height: 68px; padding: 0.65rem 1rem; gap: 1rem; }
`;
const Logo = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
  color: var(--text-color);
  font: 750 1.15rem var(--font-mono);
  letter-spacing: -0.07em;
  flex-shrink: 0;
`;
const Badge = styled.img`
  width: 34px;
  height: 34px;
  display: block;
  border-radius: 7px;
`;
const LogoText = styled.span`@media (max-width: 440px) { display: none; }`;
const DesktopNav = styled.nav`
  display: flex;
  align-items: center;
  gap: 1.3rem;
  @media (max-width: 1000px) { display: none; }
`;
const NavItem = styled(Link)`
  color: var(--secondary-text-color);
  font-size: 0.9rem;
  padding: 0.65rem 0;
  white-space: nowrap;
  &[aria-current='page'] { color: var(--primary-color); box-shadow: 0 2px 0 var(--primary-color); }
  &:hover { color: var(--primary-color); }
`;
const Actions = styled.div`display: flex; gap: 0.3rem; align-items: center;`;
const IconButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 5px;
  color: var(--text-color);
  background: transparent;
  cursor: pointer;
  &:hover { background: var(--hover-bg-color); border-color: var(--border-color); }
`;
const MenuButton = styled(IconButton)`@media (min-width: 1001px) { display: none; }`;
const MenuDialog = styled.dialog`
  margin: 0 0 0 auto;
  width: min(360px, 100%);
  max-width: 100%;
  max-height: 100dvh;
  height: 100dvh;
  padding: 1.5rem;
  background: var(--card-bg-color);
  color: var(--text-color);
  border: none;
  border-left: 1px solid var(--border-color);
  &::backdrop { background: rgba(9, 18, 10, 0.55); }
  nav { display: flex; flex-direction: column; gap: 0.5rem; margin-top: 2rem; }
  nav a { padding: 0.8rem; font-size: 1.1rem; border-radius: 4px; }
  nav a[aria-current='page'] { box-shadow: none; background: var(--toc-active-bg); }
`;
const MenuHeading = styled.div`display: flex; align-items: center; justify-content: space-between; gap: 1rem; font-weight: 600;`;
const links = [
  ['/mainline', '主线'], ['/side-quests', '支线'], ['/roadmap', '路线图'],
  ['/troubleshooting', '疑难解决'], ['/faq', 'FAQ'], ['/projects', 'Works'],
];

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { if (dialog.current?.open) dialog.current.close(); setMenuOpen(false); }, [location.pathname]);
  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [menuOpen]);
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const query = window.matchMedia('(min-width: 1001px)');
    const closeOnDesktop = () => { if (query.matches) dialog.current?.close(); };
    query.addEventListener('change', closeOnDesktop);
    return () => query.removeEventListener('change', closeOnDesktop);
  }, []);
  const navLinks = () => links.map(([path, label]) => <NavItem key={path} to={path} aria-current={location.pathname === path || location.pathname.startsWith(`${path}/`) ? 'page' : undefined}>{label}</NavItem>);
  return <>
    <Header><Content>
      <Logo to="/" aria-label="cppgamedev 首页"><Badge src="/brand/cppgamedev-logo-64.png?v=cpp-controller-3" alt="" width={34} height={34} /><LogoText>cppgamedev</LogoText></Logo>
      <DesktopNav aria-label="主导航">{navLinks()}</DesktopNav>
      <Actions>
        <IconButton onClick={() => setIsSearchOpen(true)} aria-label="搜索"><Icon name="search" /></IconButton>
        <IconButton onClick={toggleTheme} aria-label="切换主题" title={theme === 'light' ? '切换到深色主题' : '切换到浅色主题'}><Icon name={theme === 'light' ? 'moon' : 'sun'} /></IconButton>
        <MenuButton onClick={() => { dialog.current?.showModal(); setMenuOpen(true); }} aria-label="菜单" aria-expanded={menuOpen} aria-controls="mobile-navigation"><Icon name="menu" /></MenuButton>
      </Actions>
    </Content></Header>
    <MenuDialog ref={dialog} id="mobile-navigation" aria-label="站点导航" onClose={() => setMenuOpen(false)} onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
      <MenuHeading>探索游戏开发<IconButton aria-label="关闭菜单" onClick={() => dialog.current?.close()}><Icon name="close" /></IconButton></MenuHeading>
      <nav aria-label="移动端导航">{navLinks()}</nav>
    </MenuDialog>
    {isSearchOpen && <SearchModal onClose={() => setIsSearchOpen(false)} />}
  </>;
}
