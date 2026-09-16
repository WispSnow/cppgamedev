import React, { useEffect, useRef, useState } from 'react';
import styled, { css } from 'styled-components';
import { Link } from 'react-router-dom';
import { CoursePart } from '../types';
import Icon from './Icon';

const panel = css`
  background: var(--card-bg-color);
  color: var(--text-color);
  border: 1px solid var(--border-color);
  border-radius: var(--card-radius);
  padding: 1.2rem 0.8rem;
`;
const Sidebar = styled.aside`
  ${panel}
  position: sticky;
  top: 100px;
  align-self: start;
  max-height: calc(100dvh - 124px);
  overflow-y: auto;
  overscroll-behavior: contain;
  @media (max-width: 1100px) { display: none; }
`;
const Title = styled.h2`
  padding: 0 0.6rem 1rem;
  font-size: 0.95rem;
  line-height: 1.6;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 0.8rem;
  small { display: block; font: 0.65rem/1.8 var(--font-mono); letter-spacing: 0.1em; color: var(--primary-color); margin-bottom: 0.35rem; }
`;
const List = styled.ol`list-style: none; margin: 0; padding: 0;`;
const Chapter = styled(Link)`
  display: flex;
  align-items: baseline;
  gap: 0.7rem;
  border-left: 2px solid transparent;
  padding: 0.6rem;
  border-radius: 3px;
  margin: 0.2rem 0;
  font-size: 0.8rem;
  color: var(--secondary-text-color);
  span:first-child { font: 0.7rem var(--font-mono); flex-shrink: 0; }
  &[aria-current='page'] { border-left-color: var(--primary-color); background: var(--toc-active-bg); color: var(--primary-color); font-weight: 600; }
  &:hover { background: var(--toc-hover-bg); color: var(--text-color); }
`;
const Toggle = styled.button`
  display: none;
  @media (max-width: 1100px) {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    position: fixed;
    bottom: calc(2rem + 44px + 0.75rem);
    right: 1.8rem;
    min-height: 46px;
    padding: 0.7rem 0.9rem;
    z-index: 90;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    background: var(--primary-color);
    color: var(--on-primary-color);
    box-shadow: var(--card-shadow);
    cursor: pointer;
    font-size: 0.85rem;
  }
`;
const Drawer = styled.dialog`
  ${panel}
  margin: 0 0 0 auto;
  width: min(360px, 100%);
  max-width: 100%;
  height: 100dvh;
  max-height: 100dvh;
  border-radius: 0;
  padding: 1rem;
  &::backdrop { background: rgba(9, 18, 10, 0.55); }
`;
const Close = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin: 0 0 1rem auto;
  padding: 0.65rem;
  min-height: 44px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--hover-bg-color);
  color: var(--text-color);
  cursor: pointer;
`;
interface Props { courseId: string; courseTitle?: string; parts: CoursePart[]; currentPartId?: string; }

export default function TableOfContents({ courseId, courseTitle, parts, currentPartId }: Props) {
  const sidebar = useRef<HTMLElement>(null);
  const drawer = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (drawer.current?.open) drawer.current.close();
    setOpen(false);
    const container = sidebar.current;
    const active = container?.querySelector('[aria-current="page"]');
    if (container && active) {
      const panel = container.getBoundingClientRect();
      const chapter = active.getBoundingClientRect();
      if (chapter.top < panel.top || chapter.bottom > panel.bottom) {
        container.scrollTop += chapter.top - panel.top - container.clientHeight / 2;
      }
    }
  }, [currentPartId]);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [open]);
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const query = window.matchMedia('(min-width: 1101px)');
    const closeOnDesktop = () => { if (query.matches) drawer.current?.close(); };
    query.addEventListener('change', closeOnDesktop);
    return () => query.removeEventListener('change', closeOnDesktop);
  }, []);
  const chapters = <List>{parts.map((part, index) => <li key={part.id}><Chapter to={`/courses/${courseId}/parts/${part.id}`} aria-current={part.id === currentPartId ? 'page' : undefined} onClick={() => drawer.current?.close()}><span>{String(index).padStart(2, '0')}</span><span>{part.title}</span></Chapter></li>)}</List>;
  return <>
    <Sidebar ref={sidebar} aria-label="课程目录"><Title><small>COURSE EXPLORER</small>{courseTitle || '课程目录'}</Title><nav aria-label="章节">{chapters}</nav></Sidebar>
    <Toggle onClick={() => { drawer.current?.showModal(); setOpen(true); }} aria-label="显示目录" aria-expanded={open} aria-controls="course-toc"><Icon name="book" size={18} />目录</Toggle>
    <Drawer ref={drawer} id="course-toc" aria-label="课程目录" onClose={() => setOpen(false)} onClick={event => { if (event.target === event.currentTarget) drawer.current?.close(); }}><Close onClick={() => drawer.current?.close()} aria-label="关闭目录"><Icon name="close" size={18} />关闭目录</Close><Title>{courseTitle || '课程目录'}</Title><nav aria-label="章节">{chapters}</nav></Drawer>
  </>;
}
