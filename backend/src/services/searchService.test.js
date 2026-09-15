const test = require('node:test');
const assert = require('node:assert/strict');
const { buildIndex, search, splitMarkdown, stripMarkdown } = require('./searchService');

test('代码块单独拆出来，围栏上的语言名不算代码', () => {
  const { prose, code } = splitMarkdown('开头\n\n```cpp\nSDL_Init(SDL_INIT_VIDEO);\n```\n\n~~~\nls -la\n~~~\n结尾');
  assert.equal(code, 'SDL_Init(SDL_INIT_VIDEO);\nls -la');
  assert.equal(prose, '开头\n\n\n结尾');
});

test('写在一行里的三个反引号是行内代码，不是代码块', () => {
  const { prose, code } = splitMarkdown('```SDL_Quit()``` 放在最后调用\n后面的正文');
  assert.equal(code, '');
  assert.equal(prose, '```SDL_Quit()``` 放在最后调用\n后面的正文');
});

test('去格式时保留单词内部的下划线和行内代码里的符号', () => {
  assert.equal(
    stripMarkdown('先调用 SDL_DestroyTexture，再调用 SDL_DestroyRenderer'),
    '先调用 SDL_DestroyTexture，再调用 SDL_DestroyRenderer'
  );
  assert.equal(
    stripMarkdown('声明 `SDL_Window* window` 和 `SDL_Renderer* renderer`'),
    '声明 SDL_Window* window 和 SDL_Renderer* renderer'
  );
  assert.equal(stripMarkdown('这是 **粗体**、*斜体* 和 _强调_'), '这是 粗体、斜体 和 强调');
});

test('去掉 HTML 标签、图片和链接地址，标题符号只认行首', () => {
  const text = stripMarkdown([
    '## C# 与 C++ 的区别',
    '<div align="center">',
    '<iframe src="//player.bilibili.com/player.html?bvid=BV1xx"></iframe>',
    '</div>',
    '',
    '![截图](https://example.com/shot.webp)',
    '',
    '详见[第一章](/courses/demo/parts/part-01)'
  ].join('\n'));
  assert.equal(text, 'C# 与 C++ 的区别\n详见第一章');
});

test('真实教程：API 名和多个关键词都能搜到', async () => {
  await buildIndex();

  // 这几个 API 名只出现在代码块里，或者带下划线，以前一条结果都搜不到
  for (const api of ['SDL_GetError', 'SDL_DestroyTexture', 'SDL_FPoint']) {
    const results = search(api);
    assert.ok(results.length > 0, `${api} 应该能搜到`);
    assert.match(results[0].snippet, new RegExp(api, 'i'));
  }

  // 多个关键词是 AND：都出现才算命中，其中一个词不存在就没有结果
  assert.ok(search('组件 状态机').length > 0);
  assert.deepEqual(search('组件 这个词不会出现在教程里'), []);
  assert.deepEqual(search('   '), []);

  // 返回给前端的结果不带正文和代码全文
  const [first] = search('SDL_GetError');
  for (const field of ['content', 'code', 'titleLower', 'contentLower', 'codeLower']) {
    assert.equal(field in first, false, `结果里不应该有 ${field}`);
  }
});
