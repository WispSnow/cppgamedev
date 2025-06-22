// 课程类型定义
export interface Course {
  id: string;
  title: string;
  description: string;
  parts: CoursePart[];
  coverImage?: string;
}

// 课程部分类型定义
export interface CoursePart {
  id: string;
  title: string;
  description: string;
  topics: string[];
  contentUrl?: string;
  content?: string;
} 