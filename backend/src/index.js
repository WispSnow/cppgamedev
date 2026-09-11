const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const coursesRouter = require('./routes/courses');
const troubleshootingRouter = require('./routes/troubleshooting');
const { buildIndex, search } = require('./services/searchService');

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
// 只监听回环地址：生产环境由 nginx 反代到 127.0.0.1:5000，
// 后端不应该在公网网卡上直接暴露一个明文 HTTP 入口。
// 确有需要时可用 HOST=0.0.0.0 覆盖。
const HOST = process.env.HOST || '127.0.0.1';

// 中间件
// Middleware to log requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use(cors());
app.use(express.json());

// 路由
app.use('/api/courses', coursesRouter);
app.use('/api/troubleshooting', troubleshootingRouter);

// 搜索 API
app.get('/api/search', (req, res) => {
  const { q } = req.query;
  const results = search(q);
  res.json(results);
});

// 静态文件服务（生产环境使用）
if (process.env.NODE_ENV === 'production') {
  // 提供前端构建文件夹作为静态资源
  app.use(express.static(path.join(__dirname, '../../frontend/build')));

  // 处理所有其他请求，返回index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/build', 'index.html'));
  });
}

// 启动服务器
app.listen(PORT, HOST, async () => {
  console.log(`服务器运行在 ${HOST}:${PORT}`);
  // 启动时构建索引
  await buildIndex();
}); 