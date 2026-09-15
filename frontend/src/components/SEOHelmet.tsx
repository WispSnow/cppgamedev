import React from 'react';
import { Helmet } from 'react-helmet';

const SITE_URL = 'https://cppgamedev.top';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  /** 站内路径或完整 URL */
  ogImage?: string;
  /** 页面路径（如 /courses/xxx），用于 canonical 和 og:url，默认取当前路径 */
  canonical?: string;
  /** 不希望被搜索引擎收录的页面，比如 404 */
  noindex?: boolean;
}

const toAbsoluteUrl = (value: string) => (/^https?:\/\//.test(value) ? value : `${SITE_URL}${value}`);

const SEOHelmet: React.FC<SEOProps> = ({
  title = 'C++游戏开发 | 从入门到精通',
  description = 'C++游戏开发教程 - 从基础到高级，全面学习C++游戏开发技能，构建自己的游戏作品',
  keywords = 'C++,游戏开发,编程教程,游戏编程,C++教程,SDL3',
  ogImage = '/logo512.png',
  canonical,
  noindex = false,
}) => {
  // 始终指向主域名，并去掉查询参数和锚点，避免 www 或带参数的地址被当成重复页面
  const url = `${SITE_URL}${canonical ?? window.location.pathname}`;
  const image = toAbsoluteUrl(ogImage);

  return (
    <Helmet>
      {/* 基础元标签 */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      {noindex && <meta name="robots" content="noindex" />}

      {/* 规范链接 */}
      {!noindex && <link rel="canonical" href={url} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
    </Helmet>
  );
};

export default SEOHelmet;
