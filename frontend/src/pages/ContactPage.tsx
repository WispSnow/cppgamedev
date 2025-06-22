import React from 'react';
import MarkdownPage from '../components/MarkdownPage';

const ContactPage: React.FC = () => {
  return (
    <MarkdownPage 
      title="联系我们" 
      contentUrl="/content/contact.md" 
    />
  );
};

export default ContactPage; 