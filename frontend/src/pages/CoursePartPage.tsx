import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vs, vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { getCourseById, getCoursePart } from '../services/courseService';
import { Course, CoursePart } from '../types';
import CopyButton from '../components/CopyButton';
import ChapterNavigation from '../components/ChapterNavigation';
import TableOfContents from '../components/TableOfContents';
import ProgressIndicator from '../components/ProgressIndicator';
import { useTheme } from '../context/ThemeContext';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

const PageContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
  background-color: var(--card-bg-color, #ffffff);
  transition: background-color 0.3s ease;
`;

const BackLink = styled(Link)`
  display: inline-block;
  margin-bottom: 2rem;
  color: var(--primary-color, #0066cc);
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const ContentHeader = styled.div`
  margin-bottom: 2rem;
`;

const PartTitle = styled.h1`
  margin-bottom: 0.5rem;
  color: var(--text-color, #333);
`;

const CourseName = styled.h3`
  margin-top: 0;
  color: var(--secondary-text-color, #666);
  font-weight: normal;
`;

const MarkdownContainer = styled.div`
  line-height: 1.8;
  color: var(--text-color, #333);
  
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
    color: white;
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
      background-color: #1a73e8;
    }
    
    tbody tr {
      &:hover {
        background-color: rgba(255, 255, 255, 0.05);
      }
    }
  }
`;

const ErrorMessage = styled.div`
  padding: 2rem;
  text-align: center;
  color: #e53935;
  font-size: 1.2rem;
`;

const CodeWrapper = styled.div`
  margin: 1.5rem 0;
  border-radius: 8px;
  background-color: var(--code-block-bg, #f6f8fa);
  position: relative;
  overflow: hidden;
  border: none;
`;

const CodeBlockWrapper = styled.div`
  position: relative;
  padding: 1rem;
  
  pre {
    margin: 0 !important;
    background-color: transparent !important;
    border-radius: 6px;
    font-size: 14px !important;
    border: none !important;
  }
  
  code {
    background-color: transparent !important;
    padding: 0 !important;
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace !important;
    border: none !important;
  }
  
  /* 覆盖SyntaxHighlighter中所有元素的边框 */
  * {
    border: none !important;
    box-shadow: none !important;
  }
`;

const CoursePartPage: React.FC = () => {
  const { courseId, partId } = useParams<{ courseId: string; partId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [part, setPart] = useState<CoursePart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const fetchCourseAndPart = async () => {
      try {
        setLoading(true);
        if (courseId) {
          const courseData = await getCourseById(courseId);
          setCourse(courseData);
          
          if (partId) {
            try {
              const partData = await getCoursePart(courseId, partId);
              setPart(partData);
            } catch (partError) {
              console.error('获取章节内容失败:', partError);
              const foundPart = courseData.parts.find(p => p.id === partId);
              if (foundPart) {
                setPart(foundPart);
                setError('无法加载章节内容，请稍后再试');
              } else {
                setError('未找到章节内容');
              }
            }
          }
        }
      } catch (err) {
        setError('加载内容时出错');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourseAndPart();
  }, [courseId, partId]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.style.setProperty('--code-block-bg', '#161b22');
    } else {
      root.style.setProperty('--code-block-bg', '#f6f8fa');
    }
  }, [theme]);
  
  if (loading) return <div>正在加载章节内容...</div>;
  if (error || !course || !part) return <ErrorMessage>{error || '未找到内容'}</ErrorMessage>;
  
  const components = {
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      const codeString = String(children).replace(/\n$/, '');
      
      const codeStyle = theme === 'dark' ? {
        ...vscDarkPlus,
        'pre[class*="language-"]': {
          ...vscDarkPlus['pre[class*="language-"]'],
          backgroundColor: 'transparent',
          margin: 0,
          padding: 0,
          overflow: 'visible',
          border: 'none',
        },
        'code[class*="language-"]': {
          ...vscDarkPlus['code[class*="language-"]'],
          backgroundColor: 'transparent',
          border: 'none',
          padding: 0,
          boxShadow: 'none',
        },
      } : {
        ...vs,
        'pre[class*="language-"]': {
          ...vs['pre[class*="language-"]'],
          backgroundColor: 'transparent',
          margin: 0,
          padding: 0,
          overflow: 'visible',
          border: 'none',
        },
        'code[class*="language-"]': {
          ...vs['code[class*="language-"]'],
          backgroundColor: 'transparent',
          border: 'none',
          padding: 0,
          boxShadow: 'none',
        },
        'keyword': { color: '#0033cc' },
        'function': { color: '#8250df' },
        'string': { color: '#0a7a00' },
        'number': { color: '#116644' },
        'comment': { color: '#6e7781' },
        'class-name': { color: '#953800' },
      };
      
      return !inline && match ? (
        <CodeWrapper>
          <CodeBlockWrapper>
            <CopyButton code={codeString} />
            <SyntaxHighlighter
              style={codeStyle}
              language={match[1]}
              PreTag="div"
              customStyle={{ backgroundColor: 'transparent', border: 'none', margin: 0, padding: 0 }}
              codeTagProps={{ style: { border: 'none', backgroundColor: 'transparent' } }}
              {...props}
            >
              {codeString}
            </SyntaxHighlighter>
          </CodeBlockWrapper>
        </CodeWrapper>
      ) : (
        <code className={className} style={{ border: 'none' }} {...props}>
          {children}
        </code>
      );
    }
  };

  return (
    <>
      <TableOfContents 
        courseId={courseId || ''} 
        parts={course.parts} 
        currentPartId={partId}
      />
      
      <PageContainer>
        <BackLink to={`/courses/${courseId}`}>← 返回课程页面</BackLink>
        
        <ProgressIndicator 
          currentPartId={partId || ''} 
          allParts={course.parts} 
        />
        
        <ContentHeader>
          <PartTitle>{part.title}</PartTitle>
          <CourseName>{course.title}</CourseName>
        </ContentHeader>
        
        {part.content ? (
          <MarkdownContainer>
            <ReactMarkdown 
              components={components}
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
            >
              {part.content}
            </ReactMarkdown>
          </MarkdownContainer>
        ) : (
          <ErrorMessage>此章节暂无内容</ErrorMessage>
        )}
        
        <ChapterNavigation
          courseId={courseId || ''}
          currentPartId={partId || ''}
          allParts={course.parts}
        />
      </PageContainer>
    </>
  );
};

export default CoursePartPage; 