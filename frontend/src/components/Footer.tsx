import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const FooterContainer = styled.footer`
  background-color: var(--card-bg-color, #ffffff);
  padding: 2rem 0;
  margin-top: 3rem;
  border-top: 1px solid var(--border-color, #eaeaea);
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const FooterLogo = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: var(--primary-color, #0066cc);
`;

const FooterLinks = styled.div`
  display: flex;
  gap: 2rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: 600px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const FooterLink = styled(Link)`
  color: var(--text-color, #333);
  text-decoration: none;
  transition: color 0.2s;
  
  &:hover {
    color: var(--primary-color, #0066cc);
  }
`;

const Copyright = styled.div`
  color: var(--secondary-text-color, #666);
  font-size: 0.9rem;
`;

const Footer: React.FC = () => {
  return (
    <FooterContainer>
      <FooterContent>
        {/* <FooterLogo>游戏开发教程</FooterLogo> */}
        <FooterLinks>
          <FooterLink to="/about">关于我们</FooterLink>
          <FooterLink to="/contact">联系我们</FooterLink>
          <FooterLink to="/roadmap">路线图</FooterLink>
          <FooterLink to="/faq">常见问题</FooterLink>
        </FooterLinks>
        <Copyright>© {new Date().getFullYear()} cppgamedev.top 保留所有权利.</Copyright>
      </FooterContent>
    </FooterContainer>
  );
};

export default Footer; 