import React from 'react';
import { Helmet } from 'react-helmet';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogUrl?: string;
  canonical?: string;
}

const SEOHelmet: React.FC<SEOProps> = ({
  title = 'C++游戏开发 | 从入门到精通',
  description = 'C++游戏开发教程 - 从基础到高级，全面学习C++游戏开发技能，构建自己的游戏作品',
  keywords = 'C++,游戏开发,编程教程,游戏编程,C++教程,SDL3',
  ogImage = '/logo512.png',
  ogUrl,
  canonical,
}) => {
  const siteUrl = 'https://cppgamedev.top';
  const url = ogUrl || window.location.href;
  const canonicalUrl = canonical ? `${siteUrl}${canonical}` : url;

  return (
    <Helmet>
      {/* 基础元标签 */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* 规范链接 */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${siteUrl}${ogImage}`} />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={`${siteUrl}${ogImage}`} />
    </Helmet>
  );
};

export default SEOHelmet; 