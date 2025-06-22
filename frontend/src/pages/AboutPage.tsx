import React from 'react';
import MarkdownPage from '../components/MarkdownPage';

const AboutPage: React.FC = () => {
  return (
    <MarkdownPage 
      title="关于我们" 
      contentUrl="/content/about.md" 
    />
  );
};

export default AboutPage; 