import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { getAllCourses } from '../services/courseService';
import { Course } from '../types';
import SEOHelmet from '../components/SEOHelmet';
import { getDifficultyInfo } from '../utils/difficultyUtils';
import { getReadingHistory, getBookmarks, HistoryItem } from '../services/storageService';

const HomeContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
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

const HistoryCard = styled(CourseCard)`
  min-height: 120px;
  padding: 1.5rem;
  justify-content: center;
`;

const HistoryTitle = styled.h3`
  font-size: 1.1rem;
  margin: 0 0 0.5rem 0;
  color: var(--text-color, #333);
`;

const HistoryMeta = styled.div`
  font-size: 0.9rem;
  color: var(--secondary-text-color, #666);
`;

const CourseImageWrapper = styled.div`
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
`;

const CourseImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
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

const ImageTag = styled.span<{ $bgColor: string; $color: string }>`
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  font-size: 0.75rem;
  padding: 0.25rem 0.65rem;
  border-radius: 4px;
  background-color: ${props => props.$bgColor};
  color: ${props => props.$color};
  font-weight: 600;
  backdrop-filter: blur(4px);
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
  line-height: 1.6;
  flex-grow: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
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


const FilterContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 3rem;
`;

const FilterButton = styled.button<{ $active: boolean; $color?: string; $bgColor?: string }>`
  padding: 0.5rem 1.2rem;
  border: none;
  border-radius: 20px;
  background-color: ${props => props.$active ? (props.$color || 'var(--primary-color, #0066cc)') : 'var(--card-bg-color, #fff)'};
  color: ${props => props.$active ? '#fff' : 'var(--text-color, #333)'};
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  transition: all 0.2s;
  border: 1px solid ${props => props.$active ? 'transparent' : 'var(--border-color, #eee)'};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }
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
  const [selectedDifficulty, setSelectedDifficulty] = useState<number | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [bookmarks, setBookmarks] = useState<HistoryItem[]>([]);

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
    setHistory(getReadingHistory());
    setBookmarks(getBookmarks());
  }, []);

  // 1. 筛选逻辑
  const filteredCourses = selectedDifficulty 
    ? courses.filter(course => course.difficulty === selectedDifficulty)
    : courses;



  // 3. 主线任务
  const mainlineCourses = filteredCourses
    .filter(course => (course.category ?? 'mainline') === 'mainline')
    .sort((a, b) => (a.difficulty || 0) - (b.difficulty || 0));

  // 4. 支线任务
  const sideCourses = filteredCourses
    .filter(course => course.category === 'side')
    .sort((a, b) => (a.difficulty || 0) - (b.difficulty || 0));

  const difficulties = [1, 2, 3, 4, 5];

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
          精心设计的PBL项目式教程，让你像搭积木一样开发游戏，循序渐进地提升C++游戏编程技能，以及各种类型的游戏实现方式。
        </Subtitle>
      </HeroSection>

      <FilterContainer>
        <FilterButton 
          $active={selectedDifficulty === null} 
          onClick={() => setSelectedDifficulty(null)}
        >
          全部
        </FilterButton>
        {difficulties.map(level => {
          const info = getDifficultyInfo(level);
          return (
            <FilterButton
              key={level}
              $active={selectedDifficulty === level}
              $color={info.color}
              onClick={() => setSelectedDifficulty(level)}
            >
              {info.label}
            </FilterButton>
          );
        })}
      </FilterContainer>

      {/* 历史记录与收藏 */}
      {(!loading && !error) && (
        <>
          {history.length > 0 && (
            <CoursesSection>
              <SectionTitle>📖 继续阅读</SectionTitle>
              <CourseGrid>
                {history.slice(0, 3).map(item => (
                  <HistoryCard key={`${item.courseId}-${item.partId}`} to={`/courses/${item.courseId}/parts/${item.partId}`}>
                    <HistoryTitle>{item.title}</HistoryTitle>
                    <HistoryMeta>上次阅读于 {new Date(item.timestamp).toLocaleDateString()}</HistoryMeta>
                  </HistoryCard>
                ))}
              </CourseGrid>
            </CoursesSection>
          )}

          {bookmarks.length > 0 && (
            <CoursesSection>
              <SectionTitle>⭐ 我的收藏</SectionTitle>
              <CourseGrid>
                {bookmarks.map(item => (
                  <HistoryCard key={`bm-${item.courseId}-${item.partId}`} to={`/courses/${item.courseId}/parts/${item.partId}`}>
                    <HistoryTitle>{item.title}</HistoryTitle>
                    <HistoryMeta>收藏于 {new Date(item.timestamp).toLocaleDateString()}</HistoryMeta>
                  </HistoryCard>
                ))}
              </CourseGrid>
            </CoursesSection>
          )}
        </>
      )}



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
            {mainlineCourses.map(course => {
              const diffInfo = course.difficulty ? getDifficultyInfo(course.difficulty) : null;
              return (
                <CourseCard key={course.id} to={`/courses/${course.id}`}>
                  <CourseImageWrapper>
                    <CourseImage src={course.coverImage} alt={course.title} />
                    <ImageOverlay />
                    {diffInfo && (
                      <ImageTag $bgColor={diffInfo.bgColor} $color={diffInfo.color}>
                        {diffInfo.label}
                      </ImageTag>
                    )}
                  </CourseImageWrapper>
                  <CourseInfo>
                    <CourseTitle>{course.title}</CourseTitle>
                    <CourseDescription>{course.description}</CourseDescription>
                    <LearnMoreButton>开始旅程</LearnMoreButton>
                  </CourseInfo>
                </CourseCard>
              );
            })}
          </CourseGrid>
        )}

      </CoursesSection>

      {/* 支线任务区块 */}
      {!loading && !error && sideCourses.length > 0 && (
        <CoursesSection>
          <SectionTitle>🛡️ 支线任务</SectionTitle>
          <CourseGrid>
            {sideCourses.map(course => {
              const diffInfo = course.difficulty ? getDifficultyInfo(course.difficulty) : null;
              return (
                <CourseCard key={course.id} to={`/courses/${course.id}`}>
                  <CourseImageWrapper>
                    <CourseImage src={course.coverImage} alt={course.title} />
                    <ImageOverlay />
                    {diffInfo && (
                      <ImageTag $bgColor={diffInfo.bgColor} $color={diffInfo.color}>
                        {diffInfo.label}
                      </ImageTag>
                    )}
                  </CourseImageWrapper>
                  <CourseInfo>
                    <CourseTitle>{course.title}</CourseTitle>
                    <CourseDescription>{course.description}</CourseDescription>
                    <LearnMoreButton>开始探索</LearnMoreButton>
                  </CourseInfo>
                </CourseCard>
              );
            })}
          </CourseGrid>
        </CoursesSection>
      )}
    </HomeContainer>
  );
};

export default HomePage; 