import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { getAllCourses } from '../services/courseService';
import { Course } from '../types';
import ErrorState from '../components/ErrorState';
import { CourseCardSkeletonGrid } from '../components/Skeleton';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 2rem;
  color: var(--text-color);
  text-align: center;
`;

const CourseGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const CourseCard = styled(Link)`
  display: block;
  background-color: var(--card-bg-color);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  text-decoration: none;
  color: var(--text-color);
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  }
`;

const CourseImageWrapper = styled.div`
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
`;

const CourseImage = styled.div<{ $backgroundUrl: string }>`
  width: 100%;
  height: 100%;
  background-image: url(${props => props.$backgroundUrl});
  background-size: cover;
  background-position: center;
  transition: transform 0.3s ease;

  ${CourseCard}:hover & {
    transform: scale(1.05);
  }
`;

const ImageOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.5), transparent);
  pointer-events: none;
`;

const CourseContent = styled.div`
  padding: 1.5rem;
`;

const CourseTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: var(--text-color);
`;

const CourseDescription = styled.p`
  color: var(--secondary-text-color);
  font-size: 0.9rem;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const PartCount = styled.div`
  display: inline-block;
  margin-top: 1rem;
  padding: 0.4rem 0.8rem;
  background-color: var(--primary-color-light);
  color: var(--primary-color);
  border-radius: 16px;
  font-size: 0.8rem;
  font-weight: 500;
`;

const CourseCategoryTag = styled.span`
  display: inline-block;
  margin-top: 0.75rem;
  margin-right: 0.5rem;
  padding: 0.2rem 0.6rem;
  background-color: var(--toc-active-bg, rgba(0, 102, 204, 0.1));
  color: var(--primary-color, #0066cc);
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
`;

const EmptyMessage = styled.div`
  text-align: center;
  margin-top: 2rem;
  color: var(--secondary-text-color);
`;

interface CourseWithPartCount extends Course {
  partCount?: number;
}

const CoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<CourseWithPartCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const coursesData = await getAllCourses();
      setCourses(coursesData);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('获取任务列表失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return (
    <PageContainer>
      <PageTitle>全部任务</PageTitle>
      {loading && <CourseCardSkeletonGrid />}

      {!loading && error && (
        <ErrorState message={error} onRetry={fetchCourses} />
      )}

      {!loading && !error && (
        (() => {
          const filteredCourses = courses.filter(course => {
            const category = course.category ?? 'mainline';
            return category === 'mainline' || category === 'side';
          });

          if (filteredCourses.length === 0) {
            return <EmptyMessage>暂无可展示的任务，稍后再来探索吧。</EmptyMessage>;
          }

          return (
            <CourseGrid>
              {filteredCourses.map(course => (
                <CourseCard key={course.id} to={`/courses/${course.id}`}>
                  <CourseImageWrapper>
                    <CourseImage $backgroundUrl={course.coverImage || 'https://via.placeholder.com/300x180?text=No+Image'} />
                    <ImageOverlay />
                  </CourseImageWrapper>
                  <CourseContent>
                    <CourseTitle>{course.title}</CourseTitle>
                    <CourseDescription>{course.description}</CourseDescription>
                    <CourseCategoryTag>
                      {(course.category ?? 'mainline') === 'mainline' ? '主线任务' : '支线任务'}
                    </CourseCategoryTag>
                    <PartCount>{course.partCount || 0} 个章节</PartCount>
                  </CourseContent>
                </CourseCard>
              ))}
            </CourseGrid>
          );
        })()
      )}
    </PageContainer>
  );
};

export default CoursesPage; 