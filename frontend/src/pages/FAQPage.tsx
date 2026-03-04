import React, { useCallback, useState } from 'react';
import styled from 'styled-components';
import SEOHelmet from '../components/SEOHelmet';
import { faqData } from '../data/faqData';

const PageContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: var(--text-color);
`;

const Subtitle = styled.p`
  color: var(--secondary-text-color);
  font-size: 1.1rem;
`;

const CategorySection = styled.div`
  margin-bottom: 3rem;
`;

const CategoryTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: var(--primary-color, #0066cc);
  border-bottom: 2px solid var(--border-color, #eee);
  padding-bottom: 0.5rem;
`;

const AccordionItem = styled.div`
  border: 1px solid var(--border-color, #e0e0e0);
  border-radius: 8px;
  margin-bottom: 1rem;
  background-color: var(--card-bg-color, #fff);
  overflow: hidden;
`;

const AccordionHeader = styled.button<{ $isOpen: boolean }>`
  width: 100%;
  padding: 1.2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: none;
  background-color: ${props => props.$isOpen ? 'var(--hover-bg-color, #f9f9f9)' : 'transparent'};
  color: var(--text-color, #333);
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  text-align: left;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: var(--hover-bg-color, #f9f9f9);
  }
`;

const Icon = styled.span<{ $isOpen: boolean }>`
  margin-left: 1rem;
  transform: rotate(${props => props.$isOpen ? '180deg' : '0deg'});
  transition: transform 0.3s ease;
  font-size: 0.8rem;
`;

const AccordionContent = styled.div<{ $isOpen: boolean }>`
  padding: ${props => props.$isOpen ? '1.2rem' : '0 1.2rem'};
  max-height: ${props => props.$isOpen ? '500px' : '0'};
  opacity: ${props => props.$isOpen ? '1' : '0'};
  overflow: hidden;
  transition: all 0.3s ease;
  color: var(--secondary-text-color, #666);
  line-height: 1.6;
  border-top: ${props => props.$isOpen ? '1px solid var(--border-color, #eee)' : 'none'};
`;

const FeedbackSection = styled.div`
  margin-top: 4rem;
  padding: 2rem;
  background-color: var(--card-bg-color, #fff);
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
`;

const FeedbackTitle = styled.h3`
  margin-bottom: 1rem;
  color: var(--text-color);
`;

const FeedbackText = styled.p`
  color: var(--secondary-text-color);
  margin-bottom: 1.5rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.a`
  display: inline-flex;
  align-items: center;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const GithubButton = styled(ActionButton)`
  background-color: #24292e;
  color: white;
  
  &:hover {
    background-color: #000;
  }
`;

const EmailButton = styled(ActionButton)`
  background-color: var(--primary-color, #0066cc);
  color: white;
  
  &:hover {
    background-color: #0052a3;
  }
`;

const FAQPage: React.FC = () => {
  // Track open state by "categoryIndex-itemIndex"
  const [openItems, setOpenItems] = useState<Set<string>>(new Set(['0-0']));

  const toggleItem = useCallback((categoryIndex: number, itemIndex: number) => {
    const key = `${categoryIndex}-${itemIndex}`;
    setOpenItems(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  return (
    <PageContainer>
      <SEOHelmet
        title="常见问题 | FAQ"
        description="解答关于C++游戏开发课程、学习路线和技术支持的常见问题。"
        keywords="常见问题,FAQ,C++游戏开发疑问,学习帮助"
        canonical="/faq"
      />
      
      <Header>
        <Title>常见问题</Title>
        <Subtitle>
          这里汇总了学习者最常问到的问题。如果您没有找到答案，欢迎联系我们。
        </Subtitle>
      </Header>

      {faqData.map((category, catIndex) => (
        <CategorySection key={catIndex}>
          <CategoryTitle>{category.title}</CategoryTitle>
          {category.items.map((item, itemIndex) => {
            const isOpen = openItems.has(`${catIndex}-${itemIndex}`);
            return (
              <AccordionItem key={itemIndex}>
                <AccordionHeader 
                  $isOpen={isOpen} 
                  onClick={() => toggleItem(catIndex, itemIndex)}
                  aria-expanded={isOpen}
                >
                  {item.question}
                  <Icon $isOpen={isOpen}>▼</Icon>
                </AccordionHeader>
                <AccordionContent $isOpen={isOpen}>
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </CategorySection>
      ))}

      <FeedbackSection>
        <FeedbackTitle>仍然有疑问？</FeedbackTitle>
        <FeedbackText>
          您可以直接向我们提问，或者在 GitHub 上提交 Issue。
        </FeedbackText>
        <ButtonGroup>
          <GithubButton href="https://github.com/WispSnow/cppgamedev/issues" target="_blank" rel="noopener noreferrer">
            🐱 GitHub Issues
          </GithubButton>
          <EmailButton href="mailto:theorhythm@foxmail.com">
            ✉️ 发送邮件
          </EmailButton>
        </ButtonGroup>
      </FeedbackSection>
    </PageContainer>
  );
};

export default FAQPage;