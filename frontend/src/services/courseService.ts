import axios from 'axios';
import { Course, CoursePart } from '../types';

const baseUrl = '/api';

export const getAllCourses = async (): Promise<Course[]> => {
  const response = await axios.get(`${baseUrl}/courses`);
  return response.data;
};

export const getCourseById = async (id: string): Promise<Course> => {
  const response = await axios.get(`${baseUrl}/courses/${id}`);
  return response.data;
};

export const getCoursePart = async (courseId: string, partId: string): Promise<CoursePart> => {
  const response = await axios.get(`${baseUrl}/courses/${courseId}/parts/${partId}`);
  return response.data;
};

// 接口返回 404（课程或章节不存在）时为 true，用来和网络错误区分开
export const isNotFoundError = (error: unknown): boolean =>
  axios.isAxiosError(error) && error.response?.status === 404;
