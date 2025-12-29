const { courses } = require('../data/courseData');
const { readMarkdownFile } = require('../utils/fileUtils');

let searchIndex = [];
let isIndexing = false;

const fs = require('fs');
const path = require('path');
const logFile = path.resolve(__dirname, '../../search_debug.log');

function log(msg) {
  try {
    const time = new Date().toISOString();
    fs.appendFileSync(logFile, `[${time}] ${msg}\n`);
  } catch (e) {
    // ignore
  }
}

// 移除 Markdown 符号，保留纯文本
function stripMarkdown(text) {
  if (!text) return '';
  return text
    // 移除图片
    .replace(/!\[.*?\]\(.*?\)/g, '')
    // 移除链接
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    // 移除代码块
    .replace(/```[\s\S]*?```/g, '')
    // 移除标题符号
    .replace(/#+\s/g, '')
    // 移除粗体/斜体
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    // 移除列表符号
    .replace(/^[\s-]*[-+*]\s/gm, '')
    // 移除多余空行
    .replace(/\n\s*\n/g, '\n')
    .trim();
}

// 构建索引
async function buildIndex() {
  // Clear log on start
  try { fs.writeFileSync(logFile, ''); } catch(e){}
  
  if (isIndexing) return;
  isIndexing = true;
  log('开始构建搜索索引...');
  
  const tempIndex = [];
  const startTime = Date.now();

  try {
    for (const course of courses) {
      // 索引课程本身
      tempIndex.push({
        type: 'course',
        id: course.id,
        title: course.title,
        description: course.description,
        difficulty: course.difficulty,
        content: stripMarkdown(course.description),
        url: `/courses/${course.id}`
      });

      // 索引每个章节
      if (course.parts) {
        for (const part of course.parts) {
          let content = '';
          try {
            const rawContent = await readMarkdownFile(part.contentPath);
            content = stripMarkdown(rawContent);
          } catch (e) {
            log(`无法读取章节内容: ${part.contentPath} - ${e.message}`);
          }

          tempIndex.push({
            type: 'chapter',
            id: part.id,
            courseId: course.id,
            title: part.title,
            description: part.description,
            content: content,
            url: `/courses/${course.id}/parts/${part.id}`
          });
        }
      }
    }

    searchIndex = tempIndex;
    log(`搜索索引构建完成，耗时 ${Date.now() - startTime}ms，共条目: ${searchIndex.length}`);
  } catch (error) {
    log('构建搜索索引失败: ' + error.message);
    log(error.stack);
  } finally {
    isIndexing = false;
  }
}

// 搜索功能
function search(query) {
  if (!query || query.trim().length === 0) return [];
  
  const lowerQuery = query.toLowerCase().trim();
  log(`搜索请求: "${lowerQuery}"`);
  
  const results = searchIndex
    .map(item => {
      let score = 0;
      const titleMatch = item.title.toLowerCase().indexOf(lowerQuery);
      const contentMatch = item.content.toLowerCase().indexOf(lowerQuery);
      
      // 标题匹配得分更高
      if (titleMatch > -1) score += 10;
      // 内容匹配
      if (contentMatch > -1) score += 1;
      
      if (score === 0) return null;

      // 生成摘要 (Snippet)
      let snippet = '';
      if (contentMatch > -1) {
        const start = Math.max(0, contentMatch - 30);
        const end = Math.min(item.content.length, contentMatch + 100);
        snippet = (start > 0 ? '...' : '') + item.content.substring(start, end) + (end < item.content.length ? '...' : '');
      } else {
        snippet = item.description || item.content.substring(0, 100) + '...';
      }

      return {
        ...item,
        score,
        snippet,
        // 移除完整内容以减小传输体积
        content: undefined 
      };
    })
    .filter(item => item !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, 20); // 限制返回结果数量

  log(`搜索结果数量: ${results.length}`);
  return results;
}

module.exports = {
  buildIndex,
  search
};
