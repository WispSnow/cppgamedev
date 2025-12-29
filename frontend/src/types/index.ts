export type CourseCategory = 'mainline' | 'side';

// 课程类型定义
export interface Course {
  id: string;
  title: string;
  description: string;
  parts?: CoursePart[];
  coverImage?: string;
  category?: CourseCategory;
  difficulty?: number;
  updateAt?: string;
  status?: string;
}

// 课程部分类型定义
export interface CoursePart {
  id: string;
  title: string;
  description: string;
  topics?: string[];
  contentUrl?: string;
  content?: string;
}

// 疑难解决文章类型定义
export interface TroubleshootingArticleSummary {
  id: string;
  title: string;
  description: string;
}

export interface TroubleshootingArticle extends TroubleshootingArticleSummary {
  content?: string;
}