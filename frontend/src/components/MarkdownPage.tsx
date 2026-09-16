import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';
import { useTheme } from '../context/ThemeContext';
import {
  markdownRehypePlugins,
  markdownRemarkPlugins,
  useMarkdownComponents,
} from '../hooks/useMarkdownComponents';
import SEOHelmet from './SEOHelmet';

const PageContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
  background-color: var(--card-bg-color, #ffffff);
  min-height: calc(100vh - 300px);
`;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 2rem;
  color: var(--text-color, #333);
  text-align: center;
`;

const MarkdownContainer = styled.div`
  line-height: 1.8;
  color: var(--text-color, #333);
  width: 100%;
  
  /* 为视频容器添加特殊样式 */
  .video-container, .youtube-video-container {
    width: 100%;
    margin: 2rem auto;
  }
  
  /* 添加视频并排显示的样式 */
  .videos-row {
    display: flex;
    flex-direction: row;
    justify-content: center;
    gap: 20px;
    margin: 2rem auto;
    width: 100%;
    max-width: 1200px;
  }
  
  /* 在视频行中的视频容器样式 */
  .videos-row > div {
    flex: 1;
    min-width: 300px;
    margin: 0;
  }
  
  @media (max-width: 768px) {
    .videos-row {
      flex-direction: column;
    }
  }
  
  h1, h2, h3, h4, h5, h6 {
    margin-top: 2rem;
    margin-bottom: 1rem;
    color: var(--text-color, #333);
  }

  /* Markdown 里的一级标题渲染成 h2（页面标题才是 h1），保留一级标题的字号 */
  h2[data-md-h1] {
    font-size: 2em;
  }
  
  p {
    margin-bottom: 1.5rem;
  }
  
  /* 正文链接带下划线，不只靠颜色和普通文字区分 */
  a {
    color: var(--primary-color, #0066cc);
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 0.2em;

    &:hover {
      text-decoration-thickness: 2px;
    }
  }
  
  img {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
    margin: 1.5rem 0;
  }
  
  ul, ol {
    margin-bottom: 1.5rem;
    padding-left: 2rem;
  }
  
  blockquote {
    margin-left: 0;
    padding-left: 1rem;
    border-left: 3px solid var(--primary-color, #0066cc);
    color: var(--secondary-text-color, #666);
  }
  
  hr {
    border: none;
    border-top: 1px solid var(--border-color, #eaeaea);
    margin: 2rem 0;
  }
  
  /* 表格样式 */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 2rem 0;
    font-size: 0.95rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    overflow: hidden;
  }
  
  thead {
    background-color: var(--primary-color, #0066cc);
    color: var(--on-primary-color);
  }
  
  th {
    padding: 1rem;
    text-align: left;
    font-weight: 600;
    border-bottom: 2px solid rgba(255, 255, 255, 0.2);
  }
  
  td {
    padding: 0.875rem 1rem;
    border-bottom: 1px solid var(--border-color, #eaeaea);
  }
  
  tbody tr {
    background-color: var(--card-bg-color, #ffffff);
    transition: background-color 0.2s ease;
    
    &:hover {
      background-color: var(--hover-bg-color, #f5f5f5);
    }
    
    &:last-child td {
      border-bottom: none;
    }
  }
  
  /* 暗色主题下的表格样式 */
  [data-theme='dark'] & {
    table {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }
    
    thead {
      background-color: var(--primary-color);
    }
    
    tbody tr {
      &:hover {
        background-color: rgba(255, 255, 255, 0.05);
      }
    }
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 3rem;
  color: var(--secondary-text-color, #666);
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 3rem;
  color: var(--error-color, #c62828);
`;

interface MarkdownPageProps {
  title: string;
  /** 页面描述，用于搜索结果和分享卡片 */
  description: string;
  contentUrl: string;
}

const MarkdownPage: React.FC<MarkdownPageProps> = ({ title, description, contentUrl }) => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const response = await fetch(contentUrl);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch content: ${response.status} ${response.statusText}`);
        }
        
        const text = await response.text();
        setContent(text);
      } catch (err) {
        console.error('Error fetching markdown content:', err);
        setError('加载内容失败，请稍后再试');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [contentUrl]);

  const components = useMarkdownComponents(theme);

  // 标题不依赖内容：加载中和出错时也渲染 SEOHelmet。三种情况下它都是 Fragment 的第一个子节点，内容加载完不会重新挂载
  const seo = <SEOHelmet title={`${title} | C++游戏开发`} description={description} />;

  if (loading) return <>{seo}<LoadingMessage>加载内容中...</LoadingMessage></>;
  if (error) return <>{seo}<ErrorMessage>{error}</ErrorMessage></>;

  return (
    <>
      {seo}
      <PageContainer>
        <PageTitle>{title}</PageTitle>
        <MarkdownContainer>
          <ReactMarkdown
            remarkPlugins={markdownRemarkPlugins}
            rehypePlugins={markdownRehypePlugins}
            components={components}
          >
            {content}
          </ReactMarkdown>
        </MarkdownContainer>
      </PageContainer>
    </>
  );
};

export default MarkdownPage; 