import React from 'react';
import MarkdownPage from '../components/MarkdownPage';

const FAQPage: React.FC = () => {
  return (
    <MarkdownPage 
      title="常见问题" 
      contentUrl="/content/faq.md" 
    />
  );
};

export default FAQPage; 