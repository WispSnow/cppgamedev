const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const coursesRouter = require('./routes/courses');
const troubleshootingRouter = require('./routes/troubleshooting');

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 中间件
app.use(cors());
app.use(express.json());

// 路由
app.use('/api/courses', coursesRouter);
app.use('/api/troubleshooting', troubleshootingRouter);

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
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
}); 