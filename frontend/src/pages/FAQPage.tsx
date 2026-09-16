import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import SEOHelmet from '../components/SEOHelmet';
import { faqData } from '../data/faqData';
import { PageShell, Eyebrow, PageHeading, PageIntro, SplitLayout, SectionNav, RelatedLinks } from '../components/Workshop';

const Category = styled.section`
  margin-bottom: 2.5rem;
  h2 { font-size: 1.25rem; margin: 0 0 1rem; }
`;
const Question = styled.details`
  border: 1px solid var(--border-color);
  border-radius: var(--card-radius);
  background: var(--card-bg-color);
  margin-bottom: 0.7rem;
  &[open] { border-color: var(--primary-color); }
  summary { display: flex; align-items: baseline; justify-content: space-between; gap: 1rem; padding: 1.1rem 1.2rem; cursor: pointer; font-weight: 600; list-style: none; }
  summary::-webkit-details-marker { display: none; }
  summary::after { content: '+'; flex-shrink: 0; color: var(--primary-color); font: 1.2rem var(--font-mono); }
  &[open] summary::after { content: '−'; }
  summary:hover { color: var(--primary-color); }
`;
const Answer = styled.div`
  padding: 0 1.2rem 1.2rem;
  color: var(--secondary-text-color);
  line-height: 1.9;
  a { color: var(--primary-color); text-decoration: underline; text-underline-offset: 3px; }
`;
const Help = styled.section`
  margin-top: 1rem;
  padding: 1.5rem;
  border: 1px solid var(--border-color);
  border-radius: var(--card-radius);
  background: var(--toc-active-bg);
  h2 { font-size: 1.25rem; margin-bottom: 0.5rem; }
  p { color: var(--secondary-text-color); }
`;

export default function FAQPage() {
  return (
    <PageShell>
      <SEOHelmet title="常见问题 | FAQ" description="解答关于C++游戏开发课程、学习路线和技术支持的常见问题。" keywords="常见问题,FAQ,C++游戏开发疑问,学习帮助" canonical="/faq" />
      <Eyebrow>FIELD GUIDE / 开始之前</Eyebrow>
      <PageHeading>常见问题</PageHeading>
      <PageIntro>关于学习、技术和交流，先在这里找到答案。遇到具体的编译或运行问题，也可以前往疑难解决。</PageIntro>
      <SplitLayout>
        <SectionNav aria-label="问题分类">
          {faqData.map((category, index) => <a key={category.title} href={`#faq-category-${index}`}>{category.title}<span>{String(category.items.length).padStart(2, '0')}</span></a>)}
          <Link to="/troubleshooting">疑难解决 →</Link>
        </SectionNav>
        <div>
          {faqData.map((category, categoryIndex) => (
            <Category key={category.title} id={`faq-category-${categoryIndex}`} aria-labelledby={`faq-title-${categoryIndex}`}>
              <h2 id={`faq-title-${categoryIndex}`}>{category.title}</h2>
              {category.items.map((item, index) => (
                <Question key={item.question} open={categoryIndex === 0 && index === 0}>
                  <summary>{item.question}</summary>
                  <Answer>{item.answer}</Answer>
                </Question>
              ))}
            </Category>
          ))}
          <Help>
            <Eyebrow>KEEP IN TOUCH</Eyebrow><h2>还没找到答案？</h2>
            <p>提交问题时，附上开发环境、错误信息和复现步骤，会更容易定位原因。</p>
            <RelatedLinks aria-label="获取帮助">
              <a href="https://github.com/WispSnow/cppgamedev/issues" target="_blank" rel="noopener noreferrer">前往 GitHub Issues ↗</a>
              <Link to="/contact">查看交流渠道 →</Link>
            </RelatedLinks>
          </Help>
        </div>
      </SplitLayout>
    </PageShell>
  );
}
