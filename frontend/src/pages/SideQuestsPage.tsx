import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { getAllCourses } from '../services/courseService';
import { Course } from '../types';
import ErrorState from '../components/ErrorState';
import { CourseCardSkeletonGrid } from '../components/Skeleton';
import SEOHelmet from '../components/SEOHelmet';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: var(--text-color);
  text-align: center;
`;

const PageDescription = styled.p`
  text-align: center;
  color: var(--secondary-text-color);
  margin-bottom: 2rem;
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

const CourseImage = styled.div<{ $backgroundUrl: string }>`
  height: 180px;
  background-image: url(${props => props.$backgroundUrl});
  background-size: cover;
  background-position: center;
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
`;

const PlaceholderMessage = styled.div`
  text-align: center;
  margin-top: 3rem;
  color: var(--secondary-text-color);
`;

const Tag = styled.span`
  display: inline-block;
  margin-top: 0.75rem;
  padding: 0.2rem 0.6rem;
  background-color: var(--toc-active-bg, rgba(0, 102, 204, 0.1));
  color: var(--primary-color, #0066cc);
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
`;

interface CourseWithPartCount extends Course {
  partCount?: number;
}

const SideQuestsPage: React.FC = () => {
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
      setError('获取支线任务失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const sideCourses = courses.filter(course => (course.category ?? 'mainline') === 'side');

  return (
    <PageContainer>
      <SEOHelmet
        title="支线任务 | C++游戏开发拓展课程"
        description="探索更多C++游戏开发支线任务，了解即将上线的拓展课程。"
        keywords="C++,游戏开发,支线课程,拓展教程"
        canonical="/side-quests"
      />
      <PageTitle>支线任务</PageTitle>
      <PageDescription>更多有趣的专题课程将在这里陆续上线，目前为占位内容。</PageDescription>

      {loading && <CourseCardSkeletonGrid />}

      {!loading && error && <ErrorState message={error} onRetry={fetchCourses} />}

      {!loading && !error && sideCourses.length === 0 && (
        <PlaceholderMessage>支线任务正在筹备中，敬请期待！</PlaceholderMessage>
      )}

      {!loading && !error && sideCourses.length > 0 && (
        <CourseGrid>
          {sideCourses.map(course => (
            <CourseCard key={course.id} to={`/courses/${course.id}`}>
              <CourseImage $backgroundUrl={course.coverImage || 'https://via.placeholder.com/300x180?text=Side+Quest'} />
              <CourseContent>
                <CourseTitle>{course.title}</CourseTitle>
                <CourseDescription>{course.description}</CourseDescription>
                <Tag>支线任务</Tag>
              </CourseContent>
            </CourseCard>
          ))}
        </CourseGrid>
      )}
    </PageContainer>
  );
};

export default SideQuestsPage;
