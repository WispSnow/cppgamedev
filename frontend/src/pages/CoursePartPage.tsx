import React, { useCallback, useEffect, useState, Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';
import { getCourseById, getCoursePart, isNotFoundError } from '../services/courseService';
import { Course, CoursePart } from '../types';
import ChapterNavigation from '../components/ChapterNavigation';
import TableOfContents from '../components/TableOfContents';
import ProgressIndicator from '../components/ProgressIndicator';
import { useTheme } from '../context/ThemeContext';
import ErrorState from '../components/ErrorState';
import { ArticleSkeleton, Skeleton } from '../components/Skeleton';
import { saveReadingProgress, toggleBookmark, isBookmarked } from '../services/storageService';
import {
  markdownRehypePlugins,
  markdownRemarkPlugins,
  useMarkdownComponents,
} from '../hooks/useMarkdownComponents';
import ScrollToTopButton from '../components/ScrollToTopButton';
import SEOHelmet from '../components/SEOHelmet';
import NotFoundPage from './NotFoundPage';
import Icon from '../components/Icon';
import ArticleProse from '../components/ArticleProse';

const GiscusComments = React.lazy(() => import('../components/GiscusComments'));

const ReaderLayout = styled.div`
  display: grid;
  grid-template-columns: 250px minmax(0, 1fr);
  gap: 2rem;
  max-width: 1240px;
  margin: 0 auto;
  padding: 2rem;
  align-items: start;
  @media (max-width: 1100px) { display: block; max-width: 880px; }
  @media (max-width: 600px) { padding: 1.25rem 1rem; }
`;
const PageContainer = styled.div`
  grid-column: 2;
  min-width: 0;
  max-width: 840px;
  padding: 2rem;
  background: var(--card-bg-color);
  border: 1px solid var(--border-color);
  border-radius: var(--card-radius);
  @media (max-width: 600px) { padding: 1.25rem 1rem; }
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
  font-size: clamp(1.7rem, 3vw, 2.25rem);
  line-height: 1.4;
  letter-spacing: -0.035em;
  margin-bottom: 0.5rem;
  color: var(--text-color, #333);
`;

const CourseName = styled.p`
  margin-top: 0;
  color: var(--secondary-text-color, #666);
  font-weight: normal;
`;

const BookmarkButton = styled.button<{ $active: boolean }>`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.5rem;
  color: ${props => props.$active ? 'var(--primary-color)' : 'var(--secondary-text-color)'};
  border: 1px solid var(--border-color);
  border-radius: 5px;
  min-width: 44px;
  min-height: 44px;
  display: grid;
  place-items: center;
  svg { fill: ${props => props.$active ? 'var(--toc-active-bg)' : 'none'}; }
  transition: all 0.2s;
  padding: 0.5rem;
  margin-left: 1rem;
  
  &:hover {
    transform: scale(1.1);
  }
`;

const HeaderLeft = styled.div`
  flex: 1;
  min-width: 0;
`;

const ChapterIntro = styled.p`
  padding: 1rem 1.2rem;
  margin-bottom: 2rem;
  border-left: 3px solid var(--primary-color);
  background: var(--toc-active-bg);
  color: var(--text-color);
  font-size: 0.95rem;
  line-height: 1.8;
  strong { display: block; color: var(--primary-color); font-size: 0.8rem; margin-bottom: 0.3rem; }
`;

const ProgressSkeleton = styled.div`
  margin-bottom: 1.5rem;
`;

const SkeletonRow = styled(Skeleton)`
  margin-bottom: 0.5rem;
`;

interface ChapterContentProps {
  content: string;
  components: React.ComponentProps<typeof ReactMarkdown>['components'];
}

// 正文单独 memo：点收藏这类页面状态变化时，不会整章重新解析 Markdown、重新高亮代码
const ChapterContent = React.memo(function ChapterContent({ content, components }: ChapterContentProps) {
  return (
    <ReactMarkdown
      components={components}
      remarkPlugins={markdownRemarkPlugins}
      rehypePlugins={markdownRehypePlugins}
    >
      {content}
    </ReactMarkdown>
  );
});

const CoursePartPage: React.FC = () => {
  const { courseId, partId } = useParams<{ courseId: string; partId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [part, setPart] = useState<CoursePart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const { theme } = useTheme();

  // 点「重试」时加一，重新发起请求
  const [reloadKey, setReloadKey] = useState(0);
  const retry = useCallback(() => setReloadKey(key => key + 1), []);

  useEffect(() => {
    if (!courseId || !partId) return;

    // 切换章节或离开页面时取消还没返回的请求：没加载完就离开的章节不会被记进「继续阅读」
    const controller = new AbortController();
    const { signal } = controller;

    const load = async () => {
      setError(null);
      setNotFound(false);
      setLoading(true);
      setCourse(null);
      setPart(null);

      // 课程信息和章节内容并行请求
      const [courseData, partData] = await Promise.allSettled([
        getCourseById(courseId, signal),
        getCoursePart(courseId, partId, signal),
      ]);
      if (signal.aborted) return;

      if (courseData.status === 'rejected') {
        if (isNotFoundError(courseData.reason)) {
          setNotFound(true);
          return;
        }
        throw courseData.reason;
      }
      setCourse(courseData.value);

      if (partData.status === 'fulfilled') {
        setPart(partData.value);
        saveReadingProgress(courseData.value.id, partData.value.id, partData.value.title);
      } else if (isNotFoundError(partData.reason)) {
        setNotFound(true);
      } else {
        console.error('获取章节内容失败:', partData.reason);
        const foundPart = courseData.value.parts?.find(p => p.id === partId);
        if (foundPart) {
          setPart(foundPart);
          setError('无法加载章节内容，请稍后再试');
          saveReadingProgress(courseData.value.id, foundPart.id, foundPart.title);
        } else {
          setError('未找到章节内容');
        }
      }
    };

    load()
      .catch(err => {
        if (signal.aborted) return;
        setError('加载内容时出错');
        console.error(err);
      })
      .finally(() => {
        if (!signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [courseId, partId, reloadKey]);

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

  if (notFound) {
    return <NotFoundPage message="这个章节不存在，可能已经调整或者地址有误。" />;
  }

  return (
    <ReaderLayout>
      {course && (
        <TableOfContents
          courseId={courseId || ''}
          courseTitle={course.title}
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
          <ErrorState message={error} onRetry={retry} />
        )}

        {!loading && !error && (!course || !part) && (
          <ErrorState message="未找到章节内容" onRetry={retry} />
        )}

        {hasContent && (
          <>
            <SEOHelmet
              title={`${part.title} - ${course.title} | C++游戏开发教程`}
              description={part.description || course.description}
              keywords={`C++,游戏开发,${course.title},${part.title}`}
              canonical={`/courses/${course.id}/parts/${part.id}`}
              ogImage={course.coverImage}
            />
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
                aria-pressed={bookmarked}
                aria-label="收藏章节"
                title={bookmarked ? "取消收藏" : "收藏章节"}
              >
                <Icon name="bookmark" />
              </BookmarkButton>
            </ContentHeader>

            {part.description && <ChapterIntro><strong>本节内容</strong>{part.description}</ChapterIntro>}

            {part.content ? (
              <ArticleProse>
                <ChapterContent content={part.content} components={components} />
              </ArticleProse>
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
    </ReaderLayout>
  );
};

export default CoursePartPage; 