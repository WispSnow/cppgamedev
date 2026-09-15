const { courses } = require('../data/courseData');
const { readMarkdownFile } = require('../utils/fileUtils');

let searchIndex = [];
let isIndexing = false;

// 调试日志：默认关闭，需要排查搜索问题时设置 SEARCH_DEBUG=1
// 输出走 stdout，由 systemd/journald 接管并轮转，不再同步写文件
const SEARCH_DEBUG = process.env.SEARCH_DEBUG === '1';

// 返回给前端的结果数量上限
const MAX_RESULTS = 20;
// 查询最多拆成这么多个关键词，避免超长查询拖慢遍历
const MAX_TERMS = 8;
// 摘要从命中位置往前、往后截取的字符数
const SNIPPET_BEFORE = 30;
const SNIPPET_AFTER = 100;

// 去格式时行内代码的占位符：用 NUL 字符包住序号，教程正文里不会出现这个字符
const INLINE_CODE_MARK = String.fromCharCode(0);
const INLINE_CODE_PLACEHOLDER = new RegExp(INLINE_CODE_MARK + '([0-9]+)' + INLINE_CODE_MARK, 'g');

function log(msg) {
  if (!SEARCH_DEBUG) return;
  console.log(`[search] ${msg}`);
}

// 把 Markdown 拆成正文和代码两部分。
// 代码块要单独索引：教程里的 API 名、函数名（如 SDL_GetError）很多只出现在代码里。
function splitMarkdown(markdown) {
  const prose = [];
  const code = [];
  // 当前所在代码块的开头围栏，比如 ``` 或 ~~~~；null 表示在正文里
  let fence = null;

  for (const line of String(markdown || '').split(/\r?\n/)) {
    if (fence) {
      const close = /^ {0,3}(`{3,}|~{3,})[ \t]*$/.exec(line);
      if (close && close[1][0] === fence[0] && close[1].length >= fence.length) {
        fence = null;
      } else {
        code.push(line);
      }
      continue;
    }

    // 反引号围栏后面不能再出现反引号，否则是写在一行里的行内代码
    const open = /^ {0,3}(`{3,}(?=[^`]*$)|~{3,})/.exec(line);
    if (open) {
      fence = open[1];
    } else {
      prose.push(line);
    }
  }

  return { prose: prose.join('\n'), code: code.join('\n') };
}

// 去掉 Markdown 与 HTML 标记，只保留可搜索的文字
function stripMarkdown(text) {
  if (!text) return '';

  // 行内代码先换成占位符，里面的 * 和 _ 不参与后面的格式清理（比如 `SDL_Window* window`）
  const inlineCode = [];

  return String(text)
    .replace(/(`+)([\s\S]*?[^`])\1(?!`)/g, (_, ticks, code) => {
      inlineCode.push(code.trim());
      return INLINE_CODE_MARK + (inlineCode.length - 1) + INLINE_CODE_MARK;
    })
    .replace(/<!--[\s\S]*?-->/g, '')
    // HTML 标签（视频 iframe、图片外层的 div 等）
    .replace(/<\/?[a-zA-Z][^>]*>/g, ' ')
    // 图片
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    // 链接只保留文字
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    // 标题、引用和列表符号，只认行首的
    .replace(/^[ \t]*#{1,6}[ \t]+/gm, '')
    .replace(/^[ \t]*>[ \t]?/gm, '')
    .replace(/^[ \t]*(?:[-+*]|\d+[.)])[ \t]+/gm, '')
    // 粗体、斜体。单词内部的下划线不是强调（SDL_GetError、snake_case），不能去掉
    .replace(/(\*\*|__)(?=\S)([^\n]*?\S)\1/g, '$2')
    .replace(/(^|[^\w*])\*(?=[^\s*])([^*\n]*?[^\s*])\*(?![\w*])/g, '$1$2')
    .replace(/(^|[^\w])_(?=[^\s_])([^_\n]*?[^\s_])_(?!\w)/g, '$1$2')
    .replace(INLINE_CODE_PLACEHOLDER, (_, index) => inlineCode[Number(index)])
    // 多余空行
    .replace(/\n\s*\n/g, '\n')
    .trim();
}

// 生成一条索引：保留原文用来截取摘要，另存小写副本用来匹配
function createEntry(fields, markdown) {
  const { prose, code } = splitMarkdown(markdown);
  const content = stripMarkdown(prose);
  return {
    ...fields,
    content,
    code,
    titleLower: String(fields.title || '').toLowerCase(),
    contentLower: content.toLowerCase(),
    codeLower: code.toLowerCase()
  };
}

// 构建索引
async function buildIndex() {
  if (isIndexing) return;
  isIndexing = true;
  log('开始构建搜索索引...');

  const tempIndex = [];
  const startTime = Date.now();

  try {
    for (const course of courses) {
      // 索引课程本身
      tempIndex.push(createEntry({
        type: 'course',
        id: course.id,
        title: course.title,
        description: course.description,
        difficulty: course.difficulty,
        url: `/courses/${course.id}`
      }, course.description));

      // 索引每个章节
      for (const part of course.parts || []) {
        let markdown = '';
        try {
          markdown = await readMarkdownFile(part.contentPath);
        } catch (e) {
          console.error(`[search] 无法读取章节内容: ${part.contentPath} - ${e.message}`);
        }

        tempIndex.push(createEntry({
          type: 'chapter',
          id: part.id,
          courseId: course.id,
          title: part.title,
          description: part.description,
          url: `/courses/${course.id}/parts/${part.id}`
        }, markdown));
      }
    }

    searchIndex = tempIndex;
    log(`搜索索引构建完成，耗时 ${Date.now() - startTime}ms，共条目: ${searchIndex.length}`);
  } catch (error) {
    console.error('[search] 构建搜索索引失败: ' + error.message);
    console.error(error.stack);
  } finally {
    isIndexing = false;
  }
}

// 每个关键词都必须出现（AND）。标题命中最重要，其次是正文，只出现在代码里的排在后面
function scoreEntry(entry, terms, phrase) {
  let score = 0;
  for (const term of terms) {
    const inTitle = entry.titleLower.includes(term);
    const inContent = entry.contentLower.includes(term);
    const inCode = entry.codeLower.includes(term);
    if (!inTitle && !inContent && !inCode) return 0;
    score += (inTitle ? 10 : 0) + (inContent ? 2 : 0) + (inCode ? 1 : 0);
  }
  // 多个关键词按输入顺序连在一起出现的，额外加分
  if (phrase) {
    if (entry.titleLower.includes(phrase)) score += 5;
    else if (entry.contentLower.includes(phrase)) score += 2;
  }
  return score;
}

// 摘要优先从正文里截取，正文没有命中再用代码，都没有就用描述
function makeSnippet(entry, terms) {
  const sources = [
    [entry.content, entry.contentLower],
    [entry.code, entry.codeLower]
  ];
  for (const [text, lower] of sources) {
    const positions = terms.map(term => lower.indexOf(term)).filter(index => index !== -1);
    if (positions.length === 0) continue;
    const first = Math.min(...positions);
    const start = Math.max(0, first - SNIPPET_BEFORE);
    const end = Math.min(text.length, first + SNIPPET_AFTER);
    const excerpt = text.slice(start, end).replace(/\s+/g, ' ').trim();
    return (start > 0 ? '...' : '') + excerpt + (end < text.length ? '...' : '');
  }
  return entry.description || entry.content.slice(0, SNIPPET_AFTER) + (entry.content.length > SNIPPET_AFTER ? '...' : '');
}

// 搜索功能：按空白拆成关键词，所有关键词都要命中
function search(query) {
  const words = String(query ?? '').toLowerCase().split(/\s+/).filter(Boolean);
  const terms = [...new Set(words)].slice(0, MAX_TERMS);
  if (terms.length === 0) return [];
  const phrase = words.length > 1 ? words.join(' ') : '';
  log(`搜索请求: ${JSON.stringify(terms)}`);

  const matches = [];
  for (const entry of searchIndex) {
    const score = scoreEntry(entry, terms, phrase);
    if (score > 0) matches.push({ entry, score });
  }

  const results = matches
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_RESULTS)
    .map(({ entry, score }) => {
      // 正文、代码全文和小写副本只用于匹配，不返回给前端
      const { content, code, titleLower, contentLower, codeLower, ...fields } = entry;
      return { ...fields, score, snippet: makeSnippet(entry, terms) };
    });

  log(`搜索结果数量: ${results.length}（共命中 ${matches.length}）`);
  return results;
}

module.exports = {
  buildIndex,
  search,
  // 以下两个导出给测试用
  splitMarkdown,
  stripMarkdown
};
