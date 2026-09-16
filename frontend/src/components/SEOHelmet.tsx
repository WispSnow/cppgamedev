import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../utils/analytics';

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
  const location = useLocation();
  // 始终指向主域名，并去掉查询参数和锚点，避免 www 或带参数的地址被当成重复页面
  const url = `${SITE_URL}${canonical ?? location.pathname}`;
  const image = toAbsoluteUrl(ogImage);

  // 每个页面都会渲染 SEOHelmet，而且渲染时标题已经确定（需要数据的页面等数据到了才渲染它），
  // 所以页面浏览在这里上报，统计里记下的标题就是当前页的
  useEffect(() => {
    trackPageView(location.key, location.pathname + location.search, title);
  }, [location.key, location.pathname, location.search, title]);

  // React 19 会把这些标签放进 <head>，组件卸载时移除，不需要 react-helmet。
  // index.html 里的默认 description / keywords 在 index.tsx 启动时已移除，head 里不会出现两份
  return (
    <>
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
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </>
  );
};

export default SEOHelmet;
