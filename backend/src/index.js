const express = require('express');
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

// 不在响应头里暴露框架信息（X-Powered-By: Express）
app.disable('x-powered-by');

// 中间件
// Middleware to log requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// 不需要 cors() 和 express.json()：前端和接口同源（线上由 nginx 反代，本地开发走 CRA 的 proxy），
// 接口也全是只读 GET，没有请求体要解析。

// 路由
app.use('/api/courses', coursesRouter);
app.use('/api/troubleshooting', troubleshootingRouter);

// 搜索 API
app.get('/api/search', (req, res) => {
  const { q } = req.query;
  const results = search(q);
  res.json(results);
});

// 未匹配的请求一律返回 404 JSON。
// 前端静态文件由 nginx 提供，后端不再兜底返回 index.html，
// 否则 /api/任意路径 都会得到 200 + HTML。
app.use((req, res) => {
  res.status(404).json({ message: '接口不存在' });
});

// 启动服务器
app.listen(PORT, HOST, async () => {
  console.log(`服务器运行在 ${HOST}:${PORT}`);
  // 启动时构建索引
  await buildIndex();
});
