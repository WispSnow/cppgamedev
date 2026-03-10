import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { getCourseById } from '../services/courseService';
import { Course } from '../types';
import SEOHelmet from '../components/SEOHelmet';
import ErrorState from '../components/ErrorState';
import { PartCardSkeletonList, Skeleton } from '../components/Skeleton';
import { getReadingHistory } from '../services/storageService';

const PageContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
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

const CourseHeader = styled.div`
  display: flex;
  margin-bottom: 2rem;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background-color: var(--card-bg-color, #ffffff);
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const CourseImage = styled.img`
  width: 40%;
  object-fit: cover;
  
  @media (max-width: 768px) {
    width: 100%;
    height: 200px;
  }
`;

const CourseInfo = styled.div`
  padding: 2rem;
  flex-grow: 1;
`;

const CourseTitle = styled.h1`
  margin-top: 0;
  margin-bottom: 1rem;
  color: var(--text-color, #333);
`;

const CourseDescription = styled.p`
  margin-bottom: 2rem;
  line-height: 1.6;
  color: var(--secondary-text-color, #666);
`;

const PartsSectionTitle = styled.h2`
  margin: 2rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color, #eaeaea);
  color: var(--text-color, #333);
`;

const PartsList = styled.div`
  display: flex;
  flex-direction: column;
  background-color: var(--card-bg-color, #ffffff);
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
`;

const PartItem = styled.div<{ $isRead?: boolean }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem 1.25rem;
  cursor: pointer;
  transition: background-color 0.15s ease;
  border-bottom: 1px solid var(--border-color, #eaeaea);

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: var(--toc-active-bg, rgba(0, 102, 204, 0.05));
  }

  opacity: ${props => props.$isRead ? 0.7 : 1};
`;

const PartNumber = styled.span`
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: var(--toc-active-bg, rgba(0, 102, 204, 0.1));
  color: var(--primary-color, #0066cc);
  font-size: 0.8rem;
  font-weight: 600;
`;

const PartContent = styled.div`
  flex-grow: 1;
  min-width: 0;
`;

const PartTitle = styled.h3`
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-color, #333);
`;

const PartDescription = styled.p`
  margin: 0.25rem 0 0;
  color: var(--secondary-text-color, #666);
  font-size: 0.85rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const PartReadBadge = styled.span`
  flex-shrink: 0;
  font-size: 0.75rem;
  padding: 0.15rem 0.5rem;
  border-radius: 10px;
  background-color: rgba(76, 175, 80, 0.1);
  color: #4caf50;
  font-weight: 500;
`;

const PartArrow = styled.span`
  flex-shrink: 0;
  color: var(--secondary-text-color, #999);
  font-size: 0.9rem;
`;

const EmptyPartsMessage = styled.p`
  margin-top: 1.5rem;
  color: var(--secondary-text-color, #666);
  text-align: center;
`;

const CourseHeaderSkeleton = styled(CourseHeader)`
  min-height: 260px;
`;

const CourseImageSkeleton = styled(Skeleton)`
  width: 40%;
  height: 260px;

  @media (max-width: 768px) {
    width: 100%;
    height: 200px;
  }
`;

const CourseInfoSkeleton = styled.div`
  padding: 2rem;
  flex-grow: 1;
`;

const DownloadSection = styled.div`
  background-color: var(--card-bg-color, #ffffff);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
`;

const DownloadTitle = styled.h3`
  margin: 0;
  color: var(--text-color, #333);
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
`;

const DownloadButton = styled.a<{ $primary?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: ${props => props.$primary ? 'var(--primary-color, #0066cc)' : 'transparent'};
  color: ${props => props.$primary ? 'white' : 'var(--primary-color, #0066cc)'};
  border: 1px solid var(--primary-color, #0066cc);
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    background-color: ${props => props.$primary ? '#0055aa' : 'rgba(0, 102, 204, 0.05)'};
    text-decoration: none;
  }
`;

const CourseDetailPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const readPartIds = useMemo(() => {
    const history = getReadingHistory();
    return new Set(
      history
        .filter(item => item.courseId === courseId)
        .map(item => item.partId)
    );
  }, [courseId]);

  const fetchCourse = useCallback(async () => {
    try {
      if (!courseId) return;
      setError(null);
      setLoading(true);
      setCourse(null);
      const data = await getCourseById(courseId);
      setCourse(data);
    } catch (err) {
      setError('加载课程信息失败，请稍后再试');
      console.error('Error fetching course:', err);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  const handlePartClick = (partId: string) => {
    navigate(`/courses/${courseId}/parts/${partId}`);
  };

  return (
    <PageContainer>
      {course && (
        <SEOHelmet
          title={`${course.title} | C++游戏开发教程`}
          description={`${course.description} - 学习C++游戏开发技能，从这门课程开始。`}
          keywords={`C++,游戏开发,${course.title},编程教程,游戏编程`}
          canonical={`/courses/${courseId}`}
          ogImage={course.coverImage}
        />
      )}
      <BackLink to="/courses">← 返回全部任务</BackLink>
      {loading && (
        <>
          <CourseHeaderSkeleton>
            <CourseImageSkeleton radius="0" />
            <CourseInfoSkeleton>
              <Skeleton height="32px" />
              <Skeleton width="80%" />
              <Skeleton width="60%" />
            </CourseInfoSkeleton>
          </CourseHeaderSkeleton>
          <PartsSectionTitle>课程章节</PartsSectionTitle>
          <PartCardSkeletonList />
        </>
      )}

      {!loading && error && (
        <ErrorState message={error} onRetry={fetchCourse} />
      )}

      {!loading && !error && !course && (
        <ErrorState message="未找到课程信息" onRetry={fetchCourse} />
      )}

      {!loading && !error && course && (
        <>
          <CourseHeader>
            <CourseImage src={course.coverImage} alt={course.title} />
            <CourseInfo>
              <CourseTitle>{course.title}</CourseTitle>
              <CourseDescription>{course.description}</CourseDescription>
            </CourseInfo>
          </CourseHeader>

          {course.resources && (
            <DownloadSection>
              <DownloadTitle>
                📥 课程资源下载
              </DownloadTitle>
              <ButtonGroup>
                {course.resources.githubLink && (
                  <DownloadButton 
                    href={course.resources.githubLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    $primary
                  >
                    GitHub 仓库
                  </DownloadButton>
                )}
                {course.resources.baiduLink && (
                  <DownloadButton 
                    href={course.resources.baiduLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    网盘下载 (备用)
                  </DownloadButton>
                )}
              </ButtonGroup>
            </DownloadSection>
          )}

          <PartsSectionTitle>课程章节 ({course.parts?.length || 0})</PartsSectionTitle>
          {course.parts && course.parts.length > 0 ? (
            <PartsList>
              {course.parts.map((part, index) => {
                const isRead = readPartIds.has(part.id);
                return (
                  <PartItem key={part.id} $isRead={isRead} onClick={() => handlePartClick(part.id)}>
                    <PartNumber>{index}</PartNumber>
                    <PartContent>
                      <PartTitle>{part.title}</PartTitle>
                      {part.description && (
                        <PartDescription>{part.description}</PartDescription>
                      )}
                    </PartContent>
                    {isRead && <PartReadBadge>已读</PartReadBadge>}
                    <PartArrow>›</PartArrow>
                  </PartItem>
                );
              })}
            </PartsList>
          ) : (
            <EmptyPartsMessage>章节内容正在筹备中，敬请期待。</EmptyPartsMessage>
          )}
        </>
      )}
    </PageContainer>
  );
};

export default CourseDetailPage; 