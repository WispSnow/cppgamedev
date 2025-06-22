import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vs, vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from '../context/ThemeContext';
import VideoPlayer from './VideoPlayer';

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
  
  p {
    margin-bottom: 1.5rem;
  }
  
  a {
    color: var(--primary-color, #0066cc);
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
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
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 3rem;
  color: var(--secondary-text-color, #666);
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 3rem;
  color: #e53935;
`;

const CodeWrapper = styled.div`
  margin: 1.5rem 0;
  border-radius: 8px;
  background-color: var(--code-block-bg, #f6f8fa);
  position: relative;
  overflow: hidden;
`;

const CodeBlockWrapper = styled.div`
  position: relative;
  padding: 1rem;
  
  pre {
    margin: 0 !important;
    background-color: transparent !important;
    border-radius: 6px;
    font-size: 14px !important;
  }
  
  code {
    background-color: transparent !important;
    padding: 0 !important;
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace !important;
  }
`;

interface MarkdownPageProps {
  title: string;
  contentUrl: string;
}

const MarkdownPage: React.FC<MarkdownPageProps> = ({ title, contentUrl }) => {
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

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.style.setProperty('--code-block-bg', '#161b22');
    } else {
      root.style.setProperty('--code-block-bg', '#f6f8fa');
    }
  }, [theme]);

  const components = {
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      const codeString = String(children).replace(/\n$/, '');
      
      const codeStyle = theme === 'dark' ? vscDarkPlus : vs;
      
      return !inline && match ? (
        <CodeWrapper>
          <CodeBlockWrapper>
            <SyntaxHighlighter
              style={codeStyle}
              language={match[1]}
              PreTag="div"
              customStyle={{ backgroundColor: 'transparent', margin: 0 }}
              {...props}
            >
              {codeString}
            </SyntaxHighlighter>
          </CodeBlockWrapper>
        </CodeWrapper>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
    div({ node, children, ...props }: any) {
      if (node && node.properties && node.properties.className) {
        const className = node.properties.className;
        
        // 处理视频并排容器
        if (Array.isArray(className) && className.includes('videos-row')) {
          return <div className="videos-row">{children}</div>;
        }
        
        // 处理视频容器
        if (Array.isArray(className)) {
          const nodeChildren = node.children || [];
          
          // 处理自定义视频行容器
          if (className.includes('videos-row')) {
            return <div className="videos-row">{children}</div>;
          }
          
          // 查找iframe元素
          const iframeElement = nodeChildren.find(
            (child: any) => child.tagName === 'iframe'
          );
          
          if (iframeElement && iframeElement.properties && iframeElement.properties.src) {
            const src = iframeElement.properties.src;
            
            // 处理哔哩哔哩视频
            if (className.includes('video-container') && src.includes('player.bilibili.com')) {
              const bvidMatch = src.match(/bvid=([^&]+)/);
              const pageMatch = src.match(/page=([^&]+)/);
              
              if (bvidMatch && bvidMatch[1]) {
                const bvid = bvidMatch[1];
                const page = pageMatch && pageMatch[1] ? parseInt(pageMatch[1], 10) : 1;
                
                return <VideoPlayer videoId={bvid} platform="bilibili" page={page} title="点击播放视频" />;
              }
            }
            
            // 处理YouTube视频
            if ((className.includes('youtube-video-container') || src.includes('youtube.com/embed'))) {
              // 从URL中提取视频ID
              let videoId = '';
              
              if (src.includes('youtube.com/embed/')) {
                // 格式: https://www.youtube.com/embed/VIDEO_ID
                videoId = src.split('/embed/')[1]?.split('?')[0];
              } else if (src.includes('youtube.com/watch')) {
                // 格式: https://www.youtube.com/watch?v=VIDEO_ID
                const match = src.match(/[?&]v=([^&]+)/);
                if (match && match[1]) {
                  videoId = match[1];
                }
              }
              
              if (videoId) {
                return <VideoPlayer videoId={videoId} platform="youtube" title="点击播放YouTube视频" />;
              }
            }
          }
        }
      }
      
      // 默认渲染div
      return <div {...props}>{children}</div>;
    }
  };

  if (loading) return <LoadingMessage>加载内容中...</LoadingMessage>;
  if (error) return <ErrorMessage>{error}</ErrorMessage>;

  return (
    <PageContainer>
      <PageTitle>{title}</PageTitle>
      <MarkdownContainer>
        <ReactMarkdown rehypePlugins={[rehypeRaw]} components={components}>
          {content}
        </ReactMarkdown>
      </MarkdownContainer>
    </PageContainer>
  );
};

export default MarkdownPage; 