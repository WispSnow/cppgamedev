import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { getAllCourses } from '../services/courseService';
import { Course } from '../types';
import SEOHelmet from '../components/SEOHelmet';

const HomeContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const HeroSection = styled.div`
  text-align: center;
  margin: 3rem 0 4rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: var(--text-color, #333);
  margin-bottom: 1rem;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: var(--secondary-text-color, #666);
  max-width: 700px;
  margin: 0 auto;
`;

const CoursesSection = styled.div`
  margin: 2rem 0;
`;

const SectionTitle = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 2rem;
  color: var(--text-color, #333);
  text-align: center;
`;

const CourseGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
`;

const CourseCard = styled(Link)`
  background-color: var(--card-bg-color, #fff);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  }
`;

const CourseImage = styled.img`
  width: 100%;
  height: 180px;
  object-fit: cover;
`;

const CourseInfo = styled.div`
  padding: 1.5rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;

const CourseTitle = styled.h3`
  font-size: 1.3rem;
  color: var(--text-color, #333);
  margin: 0 0 1rem 0;
`;

const CourseDescription = styled.p`
  color: var(--secondary-text-color, #666);
  font-size: 0.95rem;
  line-height: 1.5;
  flex-grow: 1;
`;

const LearnMoreButton = styled.span`
  display: inline-block;
  margin-top: 1.5rem;
  padding: 0.5rem 1rem;
  background-color: var(--primary-color, #0066cc);
  color: white;
  border-radius: 5px;
  text-align: center;
  font-weight: 500;
  align-self: flex-start;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 2rem;
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

const EmptyMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: var(--secondary-text-color, #666);
`;

const HomePage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getAllCourses();
        setCourses(data);
        setLoading(false);
      } catch (err) {
        setError('加载课程失败，请稍后再试');
        setLoading(false);
        console.error('Error fetching courses:', err);
      }
    };

    fetchCourses();
  }, []);

  const mainlineCourses = courses.filter(
    course => (course.category ?? 'mainline') === 'mainline'
  );

  return (
    <HomeContainer>
      <SEOHelmet 
        title="C++游戏开发 | 从入门到精通的学习之旅"
        description="专业的C++游戏开发教程，循序渐进地教授C++编程和游戏开发技能，带你从零基础成长为游戏开发者。"
        keywords="C++,游戏开发,编程教程,游戏编程,C++教程,游戏引擎,游戏制作"
        canonical="/"
      />
      <HeroSection>
        <Title>C++游戏开发之旅</Title>
        <Subtitle>
          像搭积木一样开发游戏，循序渐进地提升C++编程技能，以及各种类型的游戏实现方式。
        </Subtitle>
      </HeroSection>

      <CoursesSection>
        <SectionTitle>主线任务</SectionTitle>
        {loading ? (
          <LoadingMessage>正在加载任务...</LoadingMessage>
        ) : error ? (
          <ErrorMessage>{error}</ErrorMessage>
        ) : mainlineCourses.length === 0 ? (
          <EmptyMessage>暂时没有主线任务，敬请期待新内容。</EmptyMessage>
        ) : (
          <CourseGrid>
            {mainlineCourses.map(course => (
              <CourseCard key={course.id} to={`/courses/${course.id}`}>
                <CourseImage src={course.coverImage} alt={course.title} />
                <CourseInfo>
                  <CourseTitle>{course.title}</CourseTitle>
                  <CourseDescription>{course.description}</CourseDescription>
                  <LearnMoreButton>开始旅程</LearnMoreButton>
                </CourseInfo>
              </CourseCard>
            ))}
          </CourseGrid>
        )}
      </CoursesSection>
    </HomeContainer>
  );
};

export default HomePage; 