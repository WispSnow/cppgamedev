import React from 'react';
import MarkdownPage from '../components/MarkdownPage';

const AboutPage: React.FC = () => {
  return (
    <MarkdownPage 
      title="关于我们"
      description="cppgamedev 由作者个人兼职维护，这里介绍网站的愿景、合作方式和赞助渠道。" 
      contentUrl="/content/about.md" 
    />
  );
};

export default AboutPage; 