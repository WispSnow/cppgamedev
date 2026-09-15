# 网站优化清单（性能 / SEO / 体验 / 工程）

> 基于 2026-09-14 的全站分析，按优先级排列。
> 分析方式：前后端源码审查、线上只读请求实测、本地生产构建 + source map 包体拆解、全部 194 篇教程逐篇解析（与站点相同的 remark/rehype 管线）。
> 完成一项就把 `[ ]` 改成 `[x]`，并注明完成日期和修改涉及的文件。
> 尚未测到：真实加载指标（LCP / CLS 等）。建议在国内网络下用 Lighthouse 跑一次首页和一个章节页补上。

## P0 · 改动小、收益大

- [x] **1. 发版后旧标签页白屏**（2026-09-14 已完成）
  - 现状：页面全部 `React.lazy` 按需加载，部署时前端 rsync 带 `--delete`（236ce62）会删掉旧 chunk；全站没有 ErrorBoundary，旧标签页进入没加载过的页面会抛 ChunkLoadError，整个应用白屏
  - 做法：路由层包 ErrorBoundary，ChunkLoadError 自动刷新一次（10 秒内不重复刷新，防止循环），其他渲染错误显示错误提示；localStorage 读写加 try/catch，并校验读出的数据格式
  - 修改涉及：ErrorBoundary.tsx（新增，含单元测试）、App.tsx、ThemeContext.tsx、storageService.ts

- [x] **2. 教程内容错误**（2026-09-14 已完成）
  - [x] OpenGL与迷你农场：27 个文件共 140 个相对 `.md` 链接 → 换成 `/courses/opengl-tiny-farm/parts/part-NN`（脚本批量替换，0 个无法匹配）
  - [x] 2 张图片扩展名改为小写 `.png`（太空战机 09、幽灵逃生 13）
  - [x] 加 `remark-cjk-friendly` 插件：全站没生效的 `**` 从 57 处降到 0（最后 1 处是 `20-碰撞解析与移动.md` 里缺开头的孤立 `**`，已删除）
  - [x] 代码块语言名渲染时转小写，5 处 `CPP` 恢复高亮
  - [x] `SDL与太空战机/02 VScode配置.md`：图片缩进到列表项内，5 个步骤恢复为同一个有序列表
  - 顺带：Markdown 里的站内链接改为前端路由跳转，不再整页刷新
  - 修改涉及：29 个课程 Markdown 文件、useMarkdownComponents.tsx、frontend/package.json

- [x] **3. 课程页章节列表无法用键盘进入**（2026-09-14 已完成）
  - 章节行改为 `<Link>`，加键盘焦点样式
  - 修改涉及：CourseDetailPage.tsx

- [x] **4. 代码高亮只注册用到的语言**（2026-09-14 已完成）
  - `Prism` → `PrismLight`，注册 bash / c / cmake / cpp / diff / glsl / json
  - 效果：章节页 Markdown chunk gzip 325KB → 136KB（-58%），打包的语言 277 → 11（含 cpp 的依赖）
  - 修改涉及：useMarkdownComponents.tsx

- [x] **5. 章节视频点击播放 + 图片懒加载**（2026-09-14 已完成）
  - `useMarkdownComponents` 统一接管 `iframe`（B 站 / YouTube → VideoPlayer，点击后才加载播放器，16:9）和 `img`（`loading="lazy"`），章节页、静态页、疑难解决页共用
  - VideoPlayer 封面改为 `<button>`（可键盘操作）；点击后自动播放、弹幕默认关闭（与原嵌入参数一致）
  - 修改涉及：useMarkdownComponents.tsx、VideoPlayer.tsx、MarkdownPage.tsx、CoursePartPage.tsx、TroubleshootingDetailPage.tsx

- [ ] **6. SEO 基础**（代码部分 2026-09-14 已完成，剩服务器配置）
  - [x] 193 个章节页接入 SEOHelmet（标题 / 描述 / canonical / 封面图）；canonical 统一为主域名 + 当前路径，封面图支持完整 URL
  - [x] sitemap 由 `scripts/generate-sitemap.js` 在构建前自动生成（frontend 的 `prebuild`），共 210 个 URL
  - [x] 404：前端加 `path="*"` 的 NotFoundPage（带 noindex），不存在的课程 / 章节也显示 404；删掉 `/test-video` 路由
  - [x] 后端去掉生产环境静态兜底路由，未匹配的请求返回 404 JSON
  - [x] 每个页面只保留一个 `<h1>`：Markdown 里的一级标题渲染为 `<h2 data-md-h1>`，外观不变
  - [ ] 【服务器】nginx 把 `www.cppgamedev.top` 301 到主域名（现在直接返回 200，会被重复收录）；候选配置已上传到服务器 `~/nginx-www-redirect/cppgamedev.conf`，待用 sudo 替换并 reload
  - 注意：开发模式（`npm start`）下 react-helmet 受 React StrictMode 影响不会更新标题，生产构建正常（已分别验证）
  - 修改涉及：SEOHelmet.tsx、CoursePartPage.tsx、CourseDetailPage.tsx、NotFoundPage.tsx（新增）、App.tsx、courseService.ts、backend/src/index.js、scripts/generate-sitemap.js（新增）、frontend/package.json、sitemap.xml

- [x] **7. 页脚展示 ICP 备案号**（2026-09-15 已完成）
  - 服务器在阿里云杭州，按规定首页底部需展示备案号并链接到工信部备案系统（beian.miit.gov.cn）
  - 页脚底部栏中间展示「鄂ICP备2025098393号-1」，链接到 beian.miit.gov.cn
  - 修改涉及：Footer.tsx

## P1 · 结构性改进

- [ ] **1. 构建期预渲染 HTML（SEO 与首屏的根本解法）**
  - 现状：所有 URL 返回同一个 1.3KB 空壳，用百度爬虫 UA 请求只拿到 `<div id="root"></div>`
  - 路线：CRA → Vite（CRA 已停止维护、锁死 TypeScript 4.9，`npm audit` 的 71 条绝大多数来自其构建链）→ React Router v7 框架模式 `prerender` 全部课程 / 章节路由（styled-components 需接 ServerStyleSheet）；完成后后端基本只剩搜索

- [ ] **2. 压缩与缓存**
  - [ ] 开 brotli（构建时预压缩实测：主包 85→73KB、章节包 325→256KB；Ubuntu 24.04 源里有 `libnginx-mod-http-brotli-static`）
  - [ ] API 响应加 `Cache-Control`（内容只在发版时变）
  - [ ] `/content/*.md` 的 Content-Type 改为 `text/markdown; charset=utf-8`（现在是 octet-stream）
  - [ ] 图床（Cloudflare）缓存只有 4 小时；在国内网络实测图片加载速度，慢则迁到 OSS + CDN

- [ ] **3. 前端数据与渲染**
  - [ ] 章节正文 `React.memo`（现在点收藏会整章重新解析 + 重新高亮）
  - [ ] courseService 加 Promise 缓存（每切一章都重新拉课程信息）
  - [ ] 请求可取消（章节没加载完就返回，该章仍会被记入「继续阅读」）
  - [ ] axios → fetch（-13KB gzip）；react-helmet → React 19 原生 `<title>` / `<meta>`（-6KB，也能解决开发模式 StrictMode 下标题不更新的问题）

- [ ] **4. 章内目录**：`rehype-slug` + 「本章目录」（每章平均约 9 个 h2、10 个 h3，标题目前没有锚点）

- [ ] **5. 搜索**
  - [ ] 按空格拆词做 AND 匹配（搜 `组件 状态机` 现在 0 条）
  - [ ] SearchModal 回车判断 `isComposing`（macOS 拼音输入法回车上屏会误跳转）；请求可取消

- [ ] **6. 统计去重**：GA 的 `config` 和百度的自动 PV 在首屏各多记一次 → 关闭自动上报，统一由路由 hook 上报；顺带确认 GA4「基于浏览器历史记录事件的网页变化」设置

## P2 · 体验与无障碍

- [ ] **1. 窄屏（≤1200px）目录按钮被回顶按钮遮住**，手机上点「目录」实际回到顶部（TableOfContents.tsx / ScrollToTopButton.tsx）
- [ ] **2. 暗色模式**：定义 `--hover-bg-color`（搜索框选中项对比度 1.21:1）；设置 `data-theme`（写好的暗色表格样式从未生效）；主色按钮对比度 2.72:1；ChapterNavigation 硬编码浅色
- [ ] **3. 暗色首屏闪白**：主题在 useEffect 里才生效 → `<head>` 内联脚本提前设置，并跟随 `prefers-color-scheme`
- [ ] **4. 滚动位置**：前进导航统一回顶部，后退恢复原阅读位置
- [ ] **5. 代码块**：没标语言的 495 个代码块没有背景、不能横向滚动（手机上撑宽整页）；~~疑难解决页行内代码被设成 `display:block`~~（2026-09-14 已修复）
- [ ] **6. 其他**：搜索弹窗的对话框语义与焦点管理；收起的目录仍可 Tab 聚焦；正文链接只靠颜色区分；80% 图片缺 alt；手机菜单跳转后不关闭；`prefers-reduced-motion`

## P3 · 工程与运维

- [ ] **1. 测试与 CI**：~~修复失败的 `App.test.tsx`~~（2026-09-14 已修复，并新增 ErrorBoundary 测试）；部署前跑测试；重启后做健康检查；去掉 CI 里白装的后端 `npm ci`；`setup-node` 加 npm 缓存
- [ ] **2. 依赖升级**：`npm update`（react-router-dom 7.2.0→7.18.3、axios 1.8.1→1.20）
- [ ] **3. 清理死代码**：`rehype-highlight`、`@types/react-router-dom@5`、`@types/styled-components`、`web-vitals`、`ThemeToggle.tsx`、`App.css`、`logo.svg`、`public/css/*`、`public/content/faq.md` 与 `roadmap.md`、`backend/src/test_search.js`、已被跟踪的 `frontend/build.log`、根目录 `package.json` 里的 helmet 依赖；`searchService.js:41` 引用了未定义的 `fs`
- [ ] **4. 后端精简**：关闭 `x-powered-by`；去掉 `cors()` 与 `express.json()`（接口全是同源 GET）
- [ ] **5. 重复代码**：课程卡片 4 份拷贝 → `CourseCard`；Markdown 容器样式 3 份 → `MarkdownBody`
- [ ] **6. 过时配置与文档**：`manifest.json` 名称仍是「React App」；CLAUDE.md 里 MarkdownPage / ScrollToTopButton / TableOfContents 的描述已过时
