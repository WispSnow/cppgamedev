import React, { useEffect, useState } from 'react';
import { Course, CourseCategory } from '../types';
import { getAllCourses } from '../services/courseService';
import CourseCard from './CourseCard';
import ErrorState from './ErrorState';
import SEOHelmet from './SEOHelmet';
import { CourseCardSkeletonGrid } from './Skeleton';
import { PageShell, Eyebrow, PageHeading, PageIntro, CardGrid } from './Workshop';

interface Props { category?: CourseCategory; title: string; description: string; canonical: string; }
export default function CourseCatalog({ category, title, description, canonical }: Props) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(false);
    getAllCourses(controller.signal)
      .then(data => { if (!controller.signal.aborted) setCourses(data); })
      .catch(() => { if (!controller.signal.aborted) setError(true); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [reloadKey]);
  const visible = courses.filter(course => !category || (course.category ?? 'mainline') === category);
  return <PageShell>
    <SEOHelmet title={`${title} | C++游戏开发`} description={description} canonical={canonical} />
    <Eyebrow>{category === 'side' ? 'SIDE QUESTS / 拓展技能' : category === 'mainline' ? 'MAIN QUESTS / 项目式学习' : 'COURSE LIBRARY / 课程库'}</Eyebrow>
    <PageHeading>{title}</PageHeading><PageIntro>{description}</PageIntro>
    {loading ? <CourseCardSkeletonGrid /> : error ? <ErrorState message="获取课程失败，请稍后再试" onRetry={() => setReloadKey(key => key + 1)} /> : visible.length ? <CardGrid>{visible.map((course, index) => <CourseCard key={course.id} course={course} index={index} headingLevel="h2" />)}</CardGrid> : <PageIntro>课程正在准备中，敬请期待。</PageIntro>}
  </PageShell>;
}
