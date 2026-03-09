import React, { useCallback, useEffect, useState, Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';
import { getCourseById, getCoursePart } from '../services/courseService';
import { Course, CoursePart } from '../types';
import ChapterNavigation from '../components/ChapterNavigation';
import TableOfContents from '../components/TableOfContents';
import ProgressIndicator from '../components/ProgressIndicator';
import { useTheme } from '../context/ThemeContext';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import ErrorState from '../components/ErrorState';
import { ArticleSkeleton, Skeleton } from '../components/Skeleton';
import { saveReadingProgress, toggleBookmark, isBookmarked } from '../services/storageService';
import { useMarkdownComponents } from '../hooks/useMarkdownComponents';
import ScrollToTopButton from '../components/ScrollToTopButton';

const GiscusComments = React.lazy(() => import('../components/GiscusComments'));

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
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
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

const BookmarkButton = styled.button<{ $active: boolean }>`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.5rem;
  color: ${props => props.$active ? '#ffc107' : 'var(--border-color, #ccc)'};
  transition: all 0.2s;
  padding: 0.5rem;
  margin-left: 1rem;
  
  &:hover {
    transform: scale(1.1);
  }
`;

const HeaderLeft = styled.div`
  flex: 1;
`;

const MarkdownContainer = styled.div`
  max-width: 720px;
  margin: 0 auto;
  line-height: 1.85;
  color: var(--text-color, #333);
  font-size: 1rem;

  h1 {
    margin-top: 2.5rem;
    margin-bottom: 1rem;
    font-size: 1.75rem;
    color: var(--text-color, #333);
  }

  h2 {
    margin-top: 2.5rem;
    margin-bottom: 0.75rem;
    padding-bottom: 0.4rem;
    font-size: 1.4rem;
    border-bottom: 1px solid var(--border-color, #eaeaea);
    color: var(--text-color, #333);
  }

  h3 {
    margin-top: 2rem;
    margin-bottom: 0.6rem;
    font-size: 1.2rem;
    color: var(--text-color, #333);
  }

  h4, h5, h6 {
    margin-top: 1.5rem;
    margin-bottom: 0.5rem;
    color: var(--text-color, #333);
  }

  p {
    margin-bottom: 1.25rem;
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
    border-radius: 6px;
    margin: 1.5rem 0;
  }

  ul, ol {
    margin-bottom: 1.25rem;
    padding-left: 1.75rem;
  }

  li {
    margin-bottom: 0.35rem;
  }

  blockquote {
    margin: 1.5rem 0;
    margin-left: 0;
    padding: 0.75rem 1rem;
    border-left: 3px solid var(--primary-color, #0066cc);
    color: var(--secondary-text-color, #666);
    background-color: var(--toc-active-bg, rgba(0, 102, 204, 0.03));
    border-radius: 0 6px 6px 0;
  }

  hr {
    border: none;
    border-top: 1px solid var(--border-color, #eaeaea);
    margin: 2.5rem 0;
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

const ProgressSkeleton = styled.div`
  margin-bottom: 1.5rem;
`;

const SkeletonRow = styled(Skeleton)`
  margin-bottom: 0.5rem;
`;

const CoursePartPage: React.FC = () => {
  const { courseId, partId } = useParams<{ courseId: string; partId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [part, setPart] = useState<CoursePart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookmarked, setBookmarked] = useState(false);
  const { theme } = useTheme();

  const fetchCourseAndPart = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      setCourse(null);
      setPart(null);
      if (courseId && partId) {
        // Fetch course metadata and part content in parallel
        const [courseData, partData] = await Promise.allSettled([
          getCourseById(courseId),
          getCoursePart(courseId, partId),
        ]);

        if (courseData.status === 'rejected') {
          throw courseData.reason;
        }
        setCourse(courseData.value);

        if (partData.status === 'fulfilled') {
          setPart(partData.value);
          saveReadingProgress(courseData.value.id, partData.value.id, partData.value.title);
        } else {
          console.error('获取章节内容失败:', partData.reason);
          const foundPart = courseData.value.parts?.find(p => p.id === partId);
          if (foundPart) {
            setPart(foundPart);
            setError('无法加载章节内容，请稍后再试');
            saveReadingProgress(courseData.value.id, foundPart.id, foundPart.title);
          } else {
            setPart(null);
            setError('未找到章节内容');
          }
        }
      } else if (courseId) {
        const courseData = await getCourseById(courseId);
        setCourse(courseData);
      }
    } catch (err) {
      setError('加载内容时出错');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [courseId, partId]);

  useEffect(() => {
    fetchCourseAndPart();
    window.scrollTo(0, 0);
  }, [fetchCourseAndPart]);

  useEffect(() => {
    if (courseId && partId) {
      setBookmarked(isBookmarked(courseId, partId));
    }
  }, [courseId, partId]);

  const handleBookmarkToggle = () => {
    if (courseId && partId && part) {
      const isAdded = toggleBookmark(courseId, partId, part.title);
      setBookmarked(isAdded);
    }
  };

  const components = useMarkdownComponents(theme, {
    showCopyButton: true,
    fullStyleOverrides: true,
  });

  const hasContent = !loading && !error && course && part;

  return (
    <>
      {course && (
        <TableOfContents
          courseId={courseId || ''}
          parts={course.parts || []}
          currentPartId={partId}
        />
      )}

      <PageContainer>
        <BackLink to={`/courses/${courseId}`}>← 返回课程页面</BackLink>

        {loading && (
          <>
            <ProgressSkeleton>
              <SkeletonRow width="45%" height="14px" />
              <SkeletonRow width="60%" height="10px" />
            </ProgressSkeleton>
            <ArticleSkeleton />
          </>
        )}

        {!loading && error && (
          <ErrorState message={error} onRetry={fetchCourseAndPart} />
        )}

        {!loading && !error && (!course || !part) && (
          <ErrorState message="未找到章节内容" onRetry={fetchCourseAndPart} />
        )}

        {hasContent && (
          <>
            <ProgressIndicator
              currentPartId={partId || ''}
              allParts={course.parts || []}
            />

            <ContentHeader>
              <HeaderLeft>
                <PartTitle>{part.title}</PartTitle>
                <CourseName>{course.title}</CourseName>
              </HeaderLeft>
              <BookmarkButton 
                onClick={handleBookmarkToggle}
                $active={bookmarked}
                title={bookmarked ? "取消收藏" : "收藏章节"}
              >
                {bookmarked ? '★' : '☆'}
              </BookmarkButton>
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
              <ErrorState message="此章节暂无内容" />
            )}


            <ChapterNavigation
              courseId={courseId || ''}
              currentPartId={partId || ''}
              allParts={course.parts || []}
            />
            
            <Suspense fallback={null}>
              <GiscusComments />
            </Suspense>
          </>
        )}
      </PageContainer>

      <ScrollToTopButton />
    </>
  );
};

export default CoursePartPage; 