import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { getCourseById } from '../services/courseService';
import { Course } from '../types';
import SEOHelmet from '../components/SEOHelmet';

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
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const PartCard = styled.div`
  background-color: var(--card-bg-color, #ffffff);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const PartTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 0.75rem;
  color: var(--text-color, #333);
`;

const PartDescription = styled.p`
  color: var(--secondary-text-color, #666);
  margin-bottom: 1rem;
  font-size: 0.95rem;
`;

const ViewContentButton = styled.div`
  display: inline-block;
  padding: 0.5rem 1rem;
  background-color: var(--primary-color, #0066cc);
  color: white;
  border-radius: 4px;
  font-size: 0.9rem;
  text-align: center;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 3rem;
  color: var(--secondary-text-color, #666);
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #e53935;
  background-color: rgba(229, 57, 53, 0.1);
  border-radius: 8px;
  margin: 1rem 0;
`;

const CourseDetailPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        if (!courseId) return;
        const data = await getCourseById(courseId);
        setCourse(data);
        setLoading(false);
      } catch (err) {
        setError('加载课程信息失败，请稍后再试');
        setLoading(false);
        console.error('Error fetching course:', err);
      }
    };

    fetchCourse();
  }, [courseId]);

  const handlePartClick = (partId: string) => {
    navigate(`/courses/${courseId}/parts/${partId}`);
  };

  if (loading) {
    return <LoadingMessage>加载课程信息中...</LoadingMessage>;
  }

  if (error || !course) {
    return <ErrorMessage>{error || '课程不存在'}</ErrorMessage>;
  }

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
      
      <CourseHeader>
        <CourseImage src={course.coverImage} alt={course.title} />
        <CourseInfo>
          <CourseTitle>{course.title}</CourseTitle>
          <CourseDescription>{course.description}</CourseDescription>
        </CourseInfo>
      </CourseHeader>

      <PartsSectionTitle>课程章节</PartsSectionTitle>
      <PartsList>
        {course.parts.map((part) => (
          <PartCard key={part.id} onClick={() => handlePartClick(part.id)}>
            <PartTitle>{part.title}</PartTitle>
            <PartDescription>{part.description}</PartDescription>
            <ViewContentButton>查看内容</ViewContentButton>
          </PartCard>
        ))}
      </PartsList>
    </PageContainer>
  );
};

export default CourseDetailPage; 