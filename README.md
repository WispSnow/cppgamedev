# C++ 游戏开发教程网站 🎮

<div align="center">

![C++ Game Development](https://img.shields.io/badge/C%2B%2B-Game_Development-00599C?style=for-the-badge&logo=c%2B%2B&logoColor=white)
![License](https://img.shields.io/badge/License-Open_Source-green?style=for-the-badge)
![Website](https://img.shields.io/badge/Website-cppgamedev.top-blue?style=for-the-badge)

**一个开源的 C++ 游戏开发教程网站**

[🌐 访问网站](https://cppgamedev.top) | [📚 查看教程](#教程内容) | [🤝 参与贡献](#如何贡献)

</div>

---

## 📖 项目简介

这是一个专注于 C++ 游戏开发的开源教程网站项目。网站提供了从入门到进阶的完整游戏开发学习路径，通过实战项目帮助开发者掌握游戏开发的核心技能。

**网站地址：** [cppgamedev.top](https://cppgamedev.top)

## 🎯 教程内容

网站提供循序渐进的 C++ 游戏开发教程，目前已完成 3 套，未来计划共 8 套完整教程系列。每个系列都配有详细的文字教程和视频讲解：

### 1️⃣ SDL 与太空战机
- **难度等级：** ⭐ 入门级
- **章节数量：** 32 章（含扩展章节）
- **状态：** ✅ 已完成
- **项目简介：** 通过 SDL2 图形库学习 C++ 游戏开发基础，从零开始构建一款经典的太空射击游戏
- **核心技术：** 
  - SDL2 基础 API 使用
  - 游戏循环与帧率控制
  - 碰撞检测与击杀系统
  - 序列帧动画与粒子效果
  - 音效与背景音乐
  - UI 系统与得分榜
  - 游戏数据保存与读取

### 2️⃣ 模块化编程与幽灵逃生
- **难度等级：** ⭐⭐ 进阶级
- **章节数量：** 38 章（含扩展章节）
- **状态：** ✅ 已完成
- **项目简介：** 学习 C++ 游戏开发中的模块化编程思想，使用 SDL3、GLM 数学库构建一款生存类游戏
- **核心技术：**
  - 封装与模块化设计
  - 继承关系设计与自动挂载机制
  - GLM 向量数学库应用
  - 继承与组合相结合的架构设计
  - 碰撞检测与战斗系统
  - HUD 界面与文本渲染
  - 游戏存档系统

### 3️⃣ 分层架构与阳光岛
- **难度等级：** ⭐⭐ 进阶级
- **章节数量：** 36 章
- **状态：** ✅ 已完成
- **项目简介：** 学习 C++ 游戏开发中的分层架构设计，使用 SDL3、GLM、nlohmann-json、Tiled 构建一款平台跳跃游戏
- **核心技术：**
  - 现代游戏引擎架构设计
  - 基于组件的设计思想
  - 资源管理与配置系统
  - 2D 物理引擎实现
  - Tiled 地图解析与载入
  - 瓦片地图碰撞检测（含斜坡、单向平台）
  - 玩家状态机与动画系统
  - AI 行为树
  - 关卡切换与数据持久化
  - 完整的 UI 系统

### 🚧 未来规划
更多进阶教程将持续添加

## 🛠️ 技术栈

### 前端
- **框架：** React 19 + TypeScript
- **路由：** React Router v7
- **样式：** Styled Components
- **Markdown 渲染：** react-markdown + rehype-highlight + remark-gfm
- **代码高亮：** react-syntax-highlighter
- **构建工具：** Create React App

### 后端
- **运行时：** Node.js
- **框架：** Express
- **中间件：** CORS, dotenv

## 📂 项目结构

```
cppgamedev/
├── frontend/               # React 前端应用
│   ├── public/            # 静态资源
│   │   ├── content/       # Markdown 内容页面
│   │   └── css/           # 自定义样式
│   └── src/
│       ├── components/    # React 组件
│       ├── pages/         # 页面组件
│       ├── services/      # API 服务
│       └── types/         # TypeScript 类型定义
│
├── backend/               # Express 后端服务
│   └── src/
│       ├── courses/       # 📚 教程 Markdown 文件
│       │   ├── SDL与太空战机/
│       │   ├── 分层架构与阳光岛/
│       │   └── 模块化编程与幽灵逃生/
│       ├── data/          # 课程数据配置
│       └── routes/        # API 路由
│
└── README.md             # 项目说明文档
```

## 🚀 本地运行

### 前置要求
- Node.js (推荐 v18 或更高版本)
- npm 或 yarn

### 安装步骤

1. **克隆仓库**
```bash
git clone https://github.com/WispSnow/cppgamedev.git
cd cppgamedev
```

2. **安装依赖**
```bash
# 安装根目录依赖
npm install

# 安装前端依赖
cd frontend
npm install

# 安装后端依赖
cd ../backend
npm install
```

3. **启动开发服务器**

```bash
# 在 backend 目录下启动后端
cd backend
npm run dev        # 后端运行在 http://localhost:5001

# 在新终端窗口，在 frontend 目录下启动前端
cd frontend
npm start          # 前端运行在 http://localhost:3000
```

4. **访问网站**
在浏览器中打开 [http://localhost:3000](http://localhost:3000)

## 🤝 如何贡献

我们欢迎并感谢社区的贡献！由于作者时间和精力有限，教程内容可能存在错漏之处。你可以通过以下方式参与贡献：

### 📝 教程内容改进

教程的 Markdown 文件位于 `backend/src/courses/` 目录下，包括：
- `SDL与太空战机/` - SDL 入门教程
- `模块化编程与幽灵逃生/` - 模块化设计进阶教程
- `分层架构与阳光岛/` - 游戏架构进阶教程


如果你发现了以下问题，欢迎提交改进：
- ✏️ 文字错误、错别字
- 📖 表述不清晰、难以理解的部分
- 💻 代码示例错误或可优化之处
- 🔗 失效的链接
- 📚 补充说明或最佳实践

### 🔧 代码贡献

除了教程内容，网站本身的功能也欢迎改进：
- 🐛 修复 Bug
- ✨ 添加新功能
- 🎨 UI/UX 优化
- ⚡ 性能优化
- 📱 移动端适配改进

### 提交方式

1. **通过 Issue 反馈**
   - 如果发现问题，欢迎在 [Issues](../../issues) 中提出
   - 请尽量详细描述问题所在（章节、行号等）

2. **通过 Pull Request 贡献**
   - Fork 本仓库
   - 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
   - 提交你的改动 (`git commit -m 'Add some AmazingFeature'`)
   - 推送到分支 (`git push origin feature/AmazingFeature`)
   - 开启一个 Pull Request

### 贡献指南

在提交 PR 之前，请确保：
- [ ] 遵循现有的代码风格
- [ ] 测试你的改动（如适用）
- [ ] 更新相关文档（如适用）
- [ ] PR 描述清晰说明了改动内容

## 📄 开源协议

本项目采用开源协议，欢迎自由使用和传播。

## 🙏 致谢

感谢所有为本项目做出贡献的开发者和提供反馈的学习者！

## 📧 联系方式

如有任何问题或建议，欢迎：
- 在 [Issues](../../issues) 中提出
- 访问网站查看更多信息：[cppgamedev.top](https://cppgamedev.top)

---

<div align="center">

**⭐ 如果这个项目对你有帮助，欢迎 Star 支持！**

Made with ❤️ for C++ Game Developers

</div>

