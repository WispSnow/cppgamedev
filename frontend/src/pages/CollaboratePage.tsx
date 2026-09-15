import React from 'react';
import MarkdownPage from '../components/MarkdownPage';

const CollaboratePage: React.FC = () => {
  return (
    <MarkdownPage
      title="合作开发"
      description="和作者合作开发游戏或制作教程：辅助你主导的项目、加入 2D JRPG 项目，或参与教学视频制作。"
      contentUrl="/content/collaborate.md"
    />
  );
};

export default CollaboratePage;
