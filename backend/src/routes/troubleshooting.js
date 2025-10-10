const express = require('express');
const router = express.Router();
const { troubleshootingArticles } = require('../data/troubleshootingData');
const { readMarkdownFile, fileExists } = require('../utils/fileUtils');

// 获取疑难解决文章列表
router.get('/', (req, res) => {
  const articlesWithoutContent = troubleshootingArticles.map(({ contentPath, ...rest }) => rest);
  res.json(articlesWithoutContent);
});

// 获取单篇疑难解决文章
router.get('/:articleId', async (req, res) => {
  const { articleId } = req.params;
  const article = troubleshootingArticles.find(item => item.id === articleId);

  if (!article) {
    return res.status(404).json({ message: '文章未找到' });
  }

  try {
    const { contentPath, ...articleData } = article;
    if (!fileExists(contentPath)) {
      return res.status(404).json({ message: '文章内容未找到' });
    }

    const content = await readMarkdownFile(contentPath);
    res.json({
      ...articleData,
      content
    });
  } catch (error) {
    console.error('读取疑难解决内容失败:', error);
    res.status(500).json({ message: '服务器错误，无法读取文章内容' });
  }
});

module.exports = router;
