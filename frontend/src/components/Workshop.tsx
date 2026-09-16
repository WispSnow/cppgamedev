import styled from 'styled-components';
import { Link } from 'react-router-dom';

export const PageShell = styled.div`
  max-width: 1240px;
  margin: 0 auto;
  padding: 3rem 2rem;
  @media (max-width: 600px) { padding: 2rem 1rem; }
`;

export const Eyebrow = styled.p`
  display: flex;
  align-items: center;
  gap: 0.65rem;
  color: var(--primary-color);
  font: 0.72rem/1.6 var(--font-mono);
  letter-spacing: 0.12em;
  margin-bottom: 0.9rem;
  &::before { content: ''; width: 6px; height: 6px; background: currentColor; flex-shrink: 0; }
`;

export const PageHeading = styled.h1`
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 1.25;
  letter-spacing: -0.04em;
  margin-bottom: 1rem;
`;

export const PageIntro = styled.p`
  max-width: 720px;
  color: var(--secondary-text-color);
  line-height: 1.85;
  margin-bottom: 2.5rem;
`;

export const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr));
  gap: 1.5rem;
`;

export const PrimaryLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  min-height: 46px;
  padding: 0.7rem 1.2rem;
  border-radius: 5px;
  background: var(--accent-fill);
  color: var(--on-accent-color);
  font-size: 0.95rem;
  font-weight: 650;
  transition: transform 0.18s ease;
  &:hover { transform: translateY(-2px); }
`;
