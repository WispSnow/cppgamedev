import { Course, CoursePart } from '../types';
import { getJson } from './api';

export { isNotFoundError } from './api';

const baseUrl = '/api';

export const getAllCourses = (signal?: AbortSignal): Promise<Course[]> =>
  getJson<Course[]>(`${baseUrl}/courses`, signal);

export const getCourseById = (id: string, signal?: AbortSignal): Promise<Course> =>
  getJson<Course>(`${baseUrl}/courses/${encodeURIComponent(id)}`, signal);

export const getCoursePart = (courseId: string, partId: string, signal?: AbortSignal): Promise<CoursePart> =>
  getJson<CoursePart>(
    `${baseUrl}/courses/${encodeURIComponent(courseId)}/parts/${encodeURIComponent(partId)}`,
    signal
  );
