import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
  position: relative;
  text-align: center;
  padding: 3.5rem 2rem;
  margin: 0 -2rem 3rem;
  border-radius: 16px;
  background: linear-gradient(135deg,
    var(--hero-bg-start, #eef4ff) 0%,
    var(--hero-bg-end, #f0f0ff) 100%);
  overflow: hidden;

  @media (max-width: 768px) {
    margin: 0 -1rem 2rem;
    padding: 2.5rem 1.5rem;
    border-radius: 0;
  }
`;

const HeroGrid = styled.div`
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(var(--hero-grid-color, rgba(0,102,204,0.04)) 1px, transparent 1px),
    linear-gradient(90deg, var(--hero-grid-color, rgba(0,102,204,0.04)) 1px, transparent 1px);
  background-size: 32px 32px;
  pointer-events: none;
`;

const HeroDecor = styled.div`
  position: absolute;
  font-size: 1.2rem;
  opacity: 0.12;
  font-family: 'SFMono-Regular', Consolas, monospace;
  color: var(--primary-color, #0066cc);
  pointer-events: none;
  user-select: none;
  white-space: pre;
  line-height: 1.5;

  @media (max-width: 768px) {
    display: none;
  }
`;

const HeroDecorLeft = styled(HeroDecor)`
  top: 1.5rem;
  left: 2rem;
  text-align: left;
`;

const HeroDecorRight = styled(HeroDecor)`
  bottom: 1.5rem;
  right: 2rem;
  text-align: right;
`;

const Title = styled.h1`
  position: relative;
  font-size: 2.5rem;
  color: var(--text-color, #333);
  margin-bottom: 0.5rem;
  letter-spacing: -0.02em;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const TitleAccent = styled.span`
  background: linear-gradient(135deg, var(--primary-color, #0066cc), #7c3aed);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled.p`
  position: relative;
  font-size: 1.1rem;
  color: var(--secondary-text-color, #666);
  max-width: 600px;
  margin: 0.75rem auto 0;
  line-height: 1.7;
`;

const HeroBadge = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 1rem;
  padding: 0.3rem 0.9rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--primary-color, #0066cc);
  background-color: var(--hero-badge-bg, rgba(0,102,204,0.08));
  border-radius: 20px;
  letter-spacing: 0.02em;
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
  transition: color 0.2s ease;

  ${CourseCard}:hover & {
    color: var(--primary-color, #0066cc);
  }

  @media (max-width: 480px) {
    font-size: 1.15rem;
  }
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

  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
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
  transition: transform 0.15s ease, opacity 0.15s ease;

  ${CourseCard}:active & {
    transform: scale(0.96);
    opacity: 0.85;
  }
`;


const FilterContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 3rem;

  @media (max-width: 600px) {
    flex-wrap: nowrap;
    justify-content: flex-start;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    padding: 0.25rem 0;
    margin-left: -1rem;
    margin-right: -1rem;
    padding-left: 1rem;
    padding-right: 1rem;
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }
  }
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

  &:active {
    transform: translateY(0) scale(0.97);
  }

  @media (max-width: 600px) {
    flex-shrink: 0;
    white-space: nowrap;
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
  padding: 3rem 2rem;
  color: var(--secondary-text-color, #666);
`;

const EmptyIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
  opacity: 0.5;
`;

const EmptyText = styled.p`
  font-size: 1rem;
  margin: 0 0 0.5rem;
`;

const EmptyHint = styled.p`
  font-size: 0.85rem;
  margin: 0;
  opacity: 0.7;
`;

const ClearFilterButton = styled.button`
  margin-top: 1rem;
  padding: 0.4rem 1rem;
  border: 1px solid var(--border-color, #eee);
  border-radius: 20px;
  background: var(--card-bg-color, #fff);
  color: var(--primary-color, #0066cc);
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;

  &:hover {
    background: var(--primary-color, #0066cc);
    color: #fff;
  }
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
  const filteredCourses = useMemo(() =>
    selectedDifficulty
      ? courses.filter(course => course.difficulty === selectedDifficulty)
      : courses,
    [courses, selectedDifficulty]
  );

  // 2. 主线任务
  const mainlineCourses = useMemo(() =>
    filteredCourses
      .filter(course => (course.category ?? 'mainline') === 'mainline')
      .sort((a, b) => (a.difficulty || 0) - (b.difficulty || 0)),
    [filteredCourses]
  );

  // 3. 支线任务
  const sideCourses = useMemo(() =>
    filteredCourses
      .filter(course => course.category === 'side')
      .sort((a, b) => (a.difficulty || 0) - (b.difficulty || 0)),
    [filteredCourses]
  );

  const handleClearFilter = useCallback(() => setSelectedDifficulty(null), []);

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
        <HeroGrid />
        <HeroDecorLeft>{`while (game.running) {\n  handleInput();\n  update(dt);\n  render();\n}`}</HeroDecorLeft>
        <HeroDecorRight>{`struct Player {\n  Vec2 pos;\n  float speed;\n  Sprite sprite;\n};`}</HeroDecorRight>
        <HeroBadge>
          <span>&#9654;</span> PBL 项目式学习
        </HeroBadge>
        <Title>
          <TitleAccent>C++</TitleAccent>游戏开发之旅
        </Title>
        <Subtitle>
          精心设计的项目式教程，让你像搭积木一样开发游戏，循序渐进地掌握游戏编程技能与各类游戏实现方式。
        </Subtitle>
      </HeroSection>

      <FilterContainer>
        <FilterButton
          $active={selectedDifficulty === null}
          onClick={handleClearFilter}
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
          <EmptyMessage>
            <EmptyIcon>{selectedDifficulty ? '🔍' : '📭'}</EmptyIcon>
            <EmptyText>
              {selectedDifficulty
                ? `暂无「${getDifficultyInfo(selectedDifficulty).label}」难度的主线任务`
                : '暂时没有主线任务，敬请期待新内容。'}
            </EmptyText>
            {selectedDifficulty && (
              <>
                <EmptyHint>试试其他难度筛选，或查看全部课程</EmptyHint>
                <ClearFilterButton onClick={handleClearFilter}>
                  查看全部
                </ClearFilterButton>
              </>
            )}
          </EmptyMessage>
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
      {!loading && !error && (
        <CoursesSection>
          <SectionTitle>支线任务</SectionTitle>
          {sideCourses.length === 0 ? (
            <EmptyMessage>
              <EmptyIcon>{selectedDifficulty ? '🔍' : '📭'}</EmptyIcon>
              <EmptyText>
                {selectedDifficulty
                  ? `暂无「${getDifficultyInfo(selectedDifficulty).label}」难度的支线任务`
                  : '暂时没有支线任务，敬请期待新内容。'}
              </EmptyText>
              {selectedDifficulty && (
                <>
                  <EmptyHint>试试其他难度筛选，或查看全部课程</EmptyHint>
                  <ClearFilterButton onClick={handleClearFilter}>
                    查看全部
                  </ClearFilterButton>
                </>
              )}
            </EmptyMessage>
          ) : (
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
          )}
        </CoursesSection>
      )}
    </HomeContainer>
  );
};

export default HomePage; 