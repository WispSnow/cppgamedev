import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const Button = styled.button<{ $visible: boolean }>`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid var(--border-color, #ddd);
  background-color: var(--card-bg-color, #fff);
  color: var(--text-color, #333);
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  opacity: ${props => (props.$visible ? 1 : 0)};
  pointer-events: ${props => (props.$visible ? 'auto' : 'none')};
  transform: translateY(${props => (props.$visible ? '0' : '10px')});
  transition: opacity 0.3s, transform 0.3s, background-color 0.2s;
  z-index: 100;

  &:hover {
    background-color: var(--primary-color, #0066cc);
    color: #fff;
    border-color: var(--primary-color, #0066cc);
  }
`;

const ScrollToTopButton: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Button $visible={visible} onClick={scrollToTop} title="回到顶部" aria-label="回到顶部">
      ↑
    </Button>
  );
};

export default ScrollToTopButton;
