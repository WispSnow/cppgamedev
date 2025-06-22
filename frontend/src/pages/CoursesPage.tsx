import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { getAllCourses } from '../services/courseService';
import { Course } from '../types';

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

const LoadingMessage = styled.div`
  text-align: center;
  margin-top: 2rem;
  font-size: 1.2rem;
  color: var(--secondary-text-color);
`;

const ErrorMessage = styled.div`
  text-align: center;
  margin-top: 2rem;
  padding: 1rem;
  background-color: #ffebee;
  color: #c62828;
  border-radius: 4px;
`;

interface CourseWithPartCount extends Course {
  partCount?: number;
}

const CoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<CourseWithPartCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const coursesData = await getAllCourses();
        setCourses(coursesData);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('获取任务列表失败，请稍后再试');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) return <LoadingMessage>加载任务中...</LoadingMessage>;
  if (error) return <ErrorMessage>{error}</ErrorMessage>;

  return (
    <PageContainer>
      <PageTitle>全部任务</PageTitle>
      
      <CourseGrid>
        {courses.map(course => (
          <CourseCard key={course.id} to={`/courses/${course.id}`}>
            <CourseImage $backgroundUrl={course.coverImage || 'https://via.placeholder.com/300x180?text=No+Image'} />
            <CourseContent>
              <CourseTitle>{course.title}</CourseTitle>
              <CourseDescription>{course.description}</CourseDescription>
              <PartCount>{course.partCount || 0} 个章节</PartCount>
            </CourseContent>
          </CourseCard>
        ))}
      </CourseGrid>
    </PageContainer>
  );
};

export default CoursesPage; 