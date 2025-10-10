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
