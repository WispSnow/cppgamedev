import React from 'react';
import MarkdownPage from '../components/MarkdownPage';

const RoadmapPage: React.FC = () => {
  return (
    <MarkdownPage 
      title="路线图" 
      contentUrl="/content/roadmap.md" 
    />
  );
};

export default RoadmapPage; 