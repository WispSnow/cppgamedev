import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const FooterContainer = styled.footer`
  background-color: var(--card-bg-color, #ffffff);
  padding: 3rem 0 2rem;
  margin-top: 3rem;
  border-top: 1px solid var(--border-color, #eaeaea);
`;

const FooterContent = styled.div`
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 2rem;
`;

const FooterGrid = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr;
    gap: 2rem 1.5rem;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const FooterBrand = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const BrandName = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--text-color, #333);
  text-decoration: none;
  font-family: 'SFMono-Regular', Consolas, monospace;
  letter-spacing: -0.03em;
`;

const BrandBadge = styled.img`
  display: block;
  width: 32px;
  height: 32px;
  border-radius: 5px;
`;

const BrandDescription = styled.p`
  font-size: 0.85rem;
  color: var(--secondary-text-color, #666);
  line-height: 1.6;
  margin: 0;
  max-width: 280px;
`;

const FooterColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`;

const ColumnTitle = styled.h4`
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-color, #333);
  margin: 0 0 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const FooterLink = styled(Link)`
  color: var(--secondary-text-color, #666);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s;

  &:hover {
    color: var(--primary-color, #0066cc);
  }
`;

const ExternalLink = styled.a`
  color: var(--secondary-text-color, #666);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;

  &:hover {
    color: var(--primary-color, #0066cc);
  }
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid var(--border-color, #eaeaea);
  margin: 0 0 1.5rem;
`;

const FooterBottom = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: var(--secondary-text-color, #666);

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
`;

const BeianLink = styled.a`
  color: inherit;
  text-decoration: none;

  &:hover {
    color: var(--primary-color, #0066cc);
    text-decoration: underline;
  }
`;

const Footer: React.FC = () => {
  return (
    <FooterContainer>
      <FooterContent>
        <FooterGrid>
          <FooterBrand>
            <BrandName to="/">
              <BrandBadge src="/brand/cppgamedev-logo-64.png?v=cpp-controller-3" alt="" width={32} height={32} />
              cppgamedev
            </BrandName>
            <BrandDescription>
              项目式 C++ 游戏开发教程，从入门到精通，循序渐进掌握游戏编程技能。
            </BrandDescription>
          </FooterBrand>

          <FooterColumn>
            <ColumnTitle>站点导航</ColumnTitle>
            <FooterLink to="/mainline">主线任务</FooterLink>
            <FooterLink to="/side-quests">支线任务</FooterLink>
            <FooterLink to="/roadmap">路线图</FooterLink>
            <FooterLink to="/faq">常见问题</FooterLink>
            <FooterLink to="/troubleshooting">疑难解决</FooterLink>
            <FooterLink to="/projects">作品</FooterLink>
          </FooterColumn>

          <FooterColumn>
            <ColumnTitle>关于</ColumnTitle>
            <FooterLink to="/about">关于我们</FooterLink>
            <FooterLink to="/contact">联系我们</FooterLink>
          </FooterColumn>

          <FooterColumn>
            <ColumnTitle>社区</ColumnTitle>
            <ExternalLink href="https://github.com/WispSnow" target="_blank" rel="noopener noreferrer">
              GitHub
            </ExternalLink>
            <ExternalLink href="https://space.bilibili.com/3546810402474894" target="_blank" rel="noopener noreferrer">
              Bilibili
            </ExternalLink>
          </FooterColumn>
        </FooterGrid>

        <Divider />
        <FooterBottom>
          <span>&copy; {new Date().getFullYear()} cppgamedev.top</span>
          {/* 按备案管理规定，首页底部展示备案号并链接到工信部备案系统 */}
          <BeianLink href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">
            鄂ICP备2025098393号-1
          </BeianLink>
          <span>LEARN. BUILD. PLAY.</span>
        </FooterBottom>
      </FooterContent>
    </FooterContainer>
  );
};

export default Footer;
