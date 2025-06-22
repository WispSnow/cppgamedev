const express = require('express');
const router = express.Router();
const path = require('path');
const { courses } = require('../data/courseData');
const { readMarkdownFile, fileExists } = require('../utils/fileUtils');

// 获取所有课程
router.get('/', (req, res) => {
  // 返回课程列表，但不包含章节内容
  const coursesWithoutContent = courses.map(course => {
    const { parts, ...courseWithoutParts } = course;
    return {
      ...courseWithoutParts,
      partCount: parts.length
    };
  });
  
  res.json(coursesWithoutContent);
});

// 获取特定课程
router.get('/:courseId', (req, res) => {
  const { courseId } = req.params;
  const course = courses.find(c => c.id === courseId);
  
  if (!course) {
    return res.status(404).json({ message: '课程未找到' });
  }
  
  // 返回课程信息，包括章节列表，但不包含章节内容
  const partsWithoutContent = course.parts.map(({ contentPath, ...partWithoutContent }) => partWithoutContent);
  
  res.json({
    ...course,
    parts: partsWithoutContent
  });
});

// 获取特定课程的特定章节
router.get('/:courseId/parts/:partId', async (req, res) => {
  const { courseId, partId } = req.params;
  const course = courses.find(c => c.id === courseId);
  
  if (!course) {
    return res.status(404).json({ message: '课程未找到' });
  }
  
  const part = course.parts.find(p => p.id === partId);
  
  if (!part) {
    return res.status(404).json({ message: '章节未找到' });
  }

  try {
    // 修复：直接使用相对于项目根目录的路径
    const contentPath = part.contentPath;
    const exists = fileExists(contentPath);
    
    if (!exists) {
      console.error(`文件不存在: ${contentPath}`);
      return res.status(404).json({ message: '章节内容未找到' });
    }
    
    const content = await readMarkdownFile(contentPath);
    
    // 返回章节信息，包括内容
    res.json({
      ...part,
      content
    });
  } catch (error) {
    console.error('Error reading markdown file:', error);
    res.status(500).json({ message: '服务器错误，无法读取章节内容' });
  }
});

module.exports = router; 