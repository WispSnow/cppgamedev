import React from 'react';
import MarkdownPage from '../components/MarkdownPage';

const ContactPage: React.FC = () => {
  return (
    <MarkdownPage 
      title="联系我们"
      description="C++游戏开发教程的交流渠道：QQ 讨论群、B 站和 YouTube 视频评论区、GitHub 课程代码仓库。" 
      contentUrl="/content/contact.md" 
    />
  );
};

export default ContactPage; 