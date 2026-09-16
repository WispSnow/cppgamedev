# 网站优化清单（性能 / SEO / 体验 / 工程）

> 基于 2026-09-14 的全站分析，按优先级排列。
> 分析方式：前后端源码审查、线上只读请求实测、本地生产构建 + source map 包体拆解、全部 194 篇教程逐篇解析（与站点相同的 remark/rehype 管线）。
> 2026-09-15 复核：P1–P3 逐项对照代码与线上（只读查看 nginx 配置、线上 API 实测、带 source map 的本地构建拆包、npm audit 按是否进入浏览器 bundle 分类、对照 React Router 官方预渲染文档），修正了几处描述，新发现标 🆕。
> 完成一项就把 `[ ]` 改成 `[x]`，并注明完成日期和修改涉及的文件。
> 尚未测到的见文末「待在国内网络 / 后台确认」。

## 建议执行顺序（2026-09-15）

1. ~~**第 1 批 · 小修复**（与 P1.1 不冲突）：P2.1、P2.5、P1.5、P1.6、P1.7、P3.1、P3.3、P3.4、P3.6、P3.2（只升运行时依赖）；P2.6 的小项穿插做~~（2026-09-15 已完成，剩 GA4 后台一项设置，见 P1.6）
2. ~~**第 2 批 · 不论做不做 P1.1 都有价值的前端项**：P1.1 阶段 0（react-helmet → 原生标签、axios → fetch、主题改为 `data-theme` + 内联脚本，即 P2.2 / P2.3），P2.4 滚动位置，P2.6 的搜索对话框、正文链接下划线、减少动态效果；顺带 P1.3 的正文 memo 和章节请求取消~~（2026-09-15 已完成）
3. **部署前**：在 GA4 后台关闭「基于浏览器历史记录事件的网页变化」（见 P1.6），否则上线后站内跳转会重复计数
4. **决定 P1.1 阶段 1–3 做不做**（见 P1.1），每个阶段都能单独上线。做的话，P1.2 的 API 缓存与 `.md` Content-Type、P1.3 剩下的 Promise 缓存都会被框架模式与路由 loader 替代，先不做；暂缓的话按原清单做
5. **服务器批次**（需要 sudo，一次做完）：brotli、删除 nginx 遗留的 `location /css/`

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
  - 修改涉及：30 个课程 Markdown 文件、useMarkdownComponents.tsx、frontend/package.json

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

- [x] **6. SEO 基础**（2026-09-15 全部完成）
  - [x] 193 个章节页接入 SEOHelmet（标题 / 描述 / canonical / 封面图）；canonical 统一为主域名 + 当前路径，封面图支持完整 URL
  - [x] sitemap 由 `scripts/generate-sitemap.js` 在构建前自动生成（frontend 的 `prebuild`），共 210 个 URL
  - [x] 404：前端加 `path="*"` 的 NotFoundPage（带 noindex），不存在的课程 / 章节也显示 404；删掉 `/test-video` 路由
  - [x] 后端去掉生产环境静态兜底路由，未匹配的请求返回 404 JSON
  - [x] 每个页面只保留一个 `<h1>`：Markdown 里的一级标题渲染为 `<h2 data-md-h1>`，外观不变
  - [x] 【服务器】nginx 把 `www.cppgamedev.top` 301 到主域名（2026-09-15 已生效）：https / http 的 www 都一跳直达 `https://cppgamedev.top`，主域名与 API 正常
  - 注意：开发模式（`npm start`）下 react-helmet 受 React StrictMode 影响不会更新标题，生产构建正常（已分别验证）
  - 修改涉及：SEOHelmet.tsx、CoursePartPage.tsx、CourseDetailPage.tsx、NotFoundPage.tsx（新增）、App.tsx、courseService.ts、backend/src/index.js、scripts/generate-sitemap.js（新增）、frontend/package.json、sitemap.xml

- [x] **7. 页脚展示 ICP 备案号**（2026-09-15 已完成）
  - 服务器在阿里云杭州，按规定首页底部需展示备案号并链接到工信部备案系统（beian.miit.gov.cn）
  - 页脚底部栏中间展示「鄂ICP备2025098393号-1」，链接到 beian.miit.gov.cn
  - 修改涉及：Footer.tsx

## P1 · 结构性改进

- [ ] **1. 构建期预渲染 HTML（SEO 与首屏的根本解法）**
  - 现状：所有 URL 返回同一个 1.3KB 空壳，用百度爬虫 UA 请求只拿到 `<div id="root"></div>`；不执行 JS 的分享卡片抓取同样只能拿到默认标题
  - 章节页 JS 实测（2026-09-15，本地构建 + source map）：共 249KB gzip（brotli 207KB）。其中 Markdown 解析 + 代码高亮约 130KB（rehype-raw 带进来的 parse5 约 36KB），react-dom 约 55KB，axios 13KB，react-helmet 6KB
  - 第 2 批之后（2026-09-15）：章节页不再加载 axios（13.4KB gzip）和 react-helmet（6.0KB gzip）两个 chunk；但第 1 批把 React 从 19.0 升到 19.3，react / react-dom 大了约 12KB，章节页合计 246KB gzip（brotli 204KB）
  - 路线（分阶段，每个阶段都能单独上线）：
    - ~~**阶段 0 · 准备**（不迁移也有价值）：react-helmet → React 19 原生 `<title>` / `<meta>`；axios → fetch；主题改为 `<html data-theme>` + `<head>` 内联脚本驱动（即 P2.2 / P2.3）~~（2026-09-15 已完成，见 P1.3、P2.2、P2.3）；可选的 P3.5 没做
      - 主题是预渲染的前提：CSS 变量现在在 ThemeContext 的 useEffect 里才设置，预渲染 HTML 会先按浅色显示；代码高亮是按 JS 主题生成的内联样式，暗色用户 hydration 时会与服务端不一致
    - **阶段 1 · CRA → Vite**（仍是 SPA）：npm audit 的 76 条里有 63 条不进浏览器，基本来自 CRA 构建 / 测试链；同时解锁 TS 5。Vite 默认资源目录是 `/assets/`，nginx 只给 `/static/` 配了一年缓存 → 设 `build.assetsDir: 'static'` 就不用动服务器
    - **阶段 2 · React Router 框架模式**：`ssr: false` + `prerender` 全部课程 / 章节路由，styled-components 在 entry.server 里用 ServerStyleSheet 收集样式。官方文档确认：预渲染路由可以用 `loader`（构建期执行，并生成 `.data` 供站内跳转），预渲染了 `/` 时其余路径走 `__spa-fallback.html`。loader 在构建期直接读 Markdown，完成后后端基本只剩搜索
    - **阶段 3 · loader 里直接把 Markdown 渲染成 HTML**：上面约 130KB 不再下发；高亮改成 CSS class，主题问题随之消失；P1.4 章内目录放在这一步做
  - 上线注意：
    - nginx 目前只有 `/index.html` 是 `no-cache`，预渲染出的 `*/index.html` 和 `.data` 也要加，否则发版后浏览器可能按启发式缓存拿到旧 HTML
    - `try_files` 兜底改为 `/__spa-fallback.html`；CI 的 rsync 源目录改为 `build/client/`
    - 回归 P0.1（发版后旧标签页进入没加载过的页面）
    - 上线后在百度搜索资源平台用「抓取诊断」确认爬虫拿到正文，并提交 sitemap
    - index.html 里的默认 description / keywords 现在带 `data-default-seo`，由 index.tsx 启动时移除（第 2 批换掉 react-helmet 时处理）；预渲染后每个页面的 HTML 自带自己的标签，这两个默认标签和 index.tsx 里的移除代码可以一起删掉

- [ ] **2. 压缩与缓存**
  - [ ] 开 brotli：线上 `gzip_comp_level 6` 与 gzip -9 只差 0.5%，预压缩 gzip 没有意义；brotli-11 实测全站 89 个 JS/CSS 1750KB → 1437KB（-18%），章节页 246KB → 204KB
    - [x] 构建期生成 `.br`（2026-09-15）：新增 `scripts/precompress.js`，前端 `postbuild` 钩子自动执行，用 Node 自带 zlib，不加依赖；构建产物里 ≥1KB 的 js/css/html/json/svg/xml/txt/md 各压一份 `.br`，随 CI 的 rsync 一起上传
    - [ ] 【服务器，需要 sudo 密码，由用户执行】装 `libnginx-mod-http-brotli-static`（apt 源里有 1.0.0~rc-5build1，未安装），新建 `/etc/nginx/conf.d/brotli.conf` 写入 `brotli_static on;`（nginx.conf 的 http 段已经 include conf.d，不用动 nginx.conf），`sudo nginx -t` 通过后 reload；回滚就是删掉这个文件再 reload
  - [ ] API 响应加 `Cache-Control`（内容只在发版时变）——做 P1.1 的话不再需要（前端不再请求课程接口）
  - [ ] `/content/*.md` 的 Content-Type 改为 `text/markdown; charset=utf-8`（现在是 octet-stream）——fetch 读取不受影响，只是直接打开会下载，价值很低；做 P1.1 后也不再需要
  - [ ] 图床：342 张图（291 张 webp、51 张 png），抽样 25 张中位数 41KB、最大 84KB，估算总共约 14MB；Cloudflare 缓存 `max-age=14400`。开发机访问 Cloudflare 的出口在美国（colo=LAX），测不出国内速度 → 用阿里云拨测或 17CE 在国内测；如果慢，图片总量小，直接挂到自己域名下（nginx `proxy_cache` 或拷到服务器）最省事

- [ ] **3. 前端数据与渲染**（2026-09-15 完成 3 项，剩 Promise 缓存）
  - 做 P1.1 的话：剩下的 Promise 缓存由框架模式的 loader 替代，先不做
  - [x] 章节正文 `React.memo`：点收藏不再整章重新解析 + 重新高亮（改动很小，没等 P1.1 的决定）
  - [ ] courseService 加 Promise 缓存（每切一章都重新拉课程信息）
  - [x] 请求可取消：service 函数接受 `AbortSignal`，章节页切走时取消请求，没加载完就离开的章节不再记进「继续阅读」
    - 验证：无头 Chrome 里用 CDP 挂起章节接口，点进章节后立刻后退，再放行请求，阅读历史里没有这一章；正常打开会记进去
  - [x] axios → fetch；react-helmet → React 19 原生 `<title>` / `<meta>`（2026-09-15，即 P1.1 阶段 0）
    - 做法：SEOHelmet 直接渲染 `<title>` / `<meta>` / `<link rel="canonical">`，React 19 把它们放进 `<head>`、页面卸载时移除；index.html 的默认 description / keywords 改为 `data-default-seo`，index.tsx 启动时移除（不执行 JS 的抓取方仍能看到）；`twitter:*` 改用 `name` 属性。新增 services/api.ts（`getJson`、`HttpError`、`isNotFoundError`）
    - 验证：本机 Chrome 无头模式逐页加载 212 个页面，标题、description、keywords、canonical 都只有一份，og:title 与标题一致，没有残留默认标签；站内跳到下一章时整组标签替换；404 页有 noindex、没有 canonical
    - 修改涉及：SEOHelmet.tsx、index.tsx、public/index.html、services/api.ts（新增）、courseService.ts、troubleshootingService.ts、CoursePartPage.tsx、App.test.tsx、frontend/package.json（去掉 axios、react-helmet、@types/react-helmet）

- [ ] **4. 章内目录**：`rehype-slug` + 「本章目录」（每章平均约 9 个 h2、10 个 h3，标题目前没有锚点）；做 P1.1 的话放到阶段 3

- [x] **5. 搜索**（2026-09-15 已完成）
  - [x] 🆕 API 名搜不到：建索引时整段删掉了代码块；去斜体的正则 `/(\*|_)(.*?)\1/` 会吃掉同一行里成对的下划线（`SDL_DestroyTexture` 进索引后变成 `SDLDestroyTexture`）。线上 `SDL_GetError`（14 章含有）、`SDL_DestroyTexture`（16 章）、`SDL_FPoint`（10 章）都是 0 条，`SDL_Init`（7 章）只有 1 条；抽查代码块里 166 个 SDL / gl 类标识符，102 个一条结果都搜不到
    - 做法：索引拆成正文和代码两部分，只在代码里命中的排在正文命中之后；去格式时行内代码先占位保护，斜体规则不再动单词内部的下划线；顺带去掉正文里的 HTML 标签（以前 iframe、div 的属性文字也进了索引）
  - [x] 按空格拆词做 AND 匹配（`组件 状态机` 以前 0 条，按 AND 能匹配 25 章）
  - [x] SearchModal：输入法组字时的按键一律交给输入法（`e.isComposing || e.keyCode === 229`，Safari 确认上屏时 `isComposing` 已经是 false）；输入变化时用 AbortController 取消上一次请求，慢的旧响应不再覆盖新结果；请求失败显示「搜索失败」，不再显示成「未找到」
  - 顺带：`?q=a&q=b` 这种数组参数以前会让 `query.trim` 抛异常、接口返回 500，现在正常返回
  - 实测（本地后端）：`SDL_GetError` 14 条、`SDL_DestroyTexture` 16 条、`SDL_FPoint` 10 条、`组件 状态机` 20 条（结果上限），`组件 + 不存在的词` 0 条
  - 测试：`searchService.test.js`（node --test，含真实教程的回归用例）、`SearchModal.test.tsx`（输入法回车不跳转、慢的旧响应不覆盖新结果）
  - 修改涉及：backend/src/services/searchService.js、searchService.test.js（新增）、backend/package.json、SearchModal.tsx、SearchModal.test.tsx（新增）

- [x] **6. 统计去重**（2026-09-15 已完成，GA4 后台设置待确认）：GA 的 `config` 和百度的自动 PV 在首屏各多记一次 → 关闭自动上报，统一由路由 hook 上报；顺带确认 GA4「基于浏览器历史记录事件的网页变化」设置
  - 🆕 GA 记录的页面标题是上一页的：路由一变就上报，但章节标题要等接口返回后才由 SEOHelmet 设置 → 上报要放到标题确定之后，并显式传 `page_title`
  - 做法：index.html 里 GA `config` 加 `send_page_view: false`、百度 `_setAutoPageview false`；页面浏览不再由路由 hook 上报，改由 SEOHelmet 在标题确定后调用 `utils/analytics.ts`（显式传 `page_title`，同一次导航只报一次）；统计脚本只在生产构建里加载，`npm start` 本地开发不再产生数据
  - 验证（本地生产构建，用 CSP 挡住外部脚本后检查 `dataLayer` / `_hmt`）：首屏 1 次 PV；站内跳转 章节 → 课程 → 全部任务 → 关于 → 浏览器后退，每步正好 +1，GA 标题和百度路径都是当前页
  - [ ] 【GA4 后台】管理 → 数据流 → 网站数据流 → 增强型衡量 → 网页浏览 → 高级设置，关闭「基于浏览器历史记录事件的网页变化」，否则站内跳转会被 GA 自动再记一次（标题还是上一页的）
  - 修改涉及：public/index.html、utils/analytics.ts（新增）、SEOHelmet.tsx、App.tsx

- [x] 🆕 **7. 4 个页面没有 SEOHelmet**（2026-09-15 已完成）：关于 / 联系 / 合作（MarkdownPage）和全部课程（CoursesPage）都在 sitemap 里，直接打开是默认标题；站内跳过去时 react-helmet 不会重置，标题停在上一页
  - 做法：MarkdownPage 增加 `description` 参数，加载中和出错时也渲染 SEOHelmet；CoursesPage 接入 SEOHelmet
  - 🆕 顺带修复：index.html 里的静态 description / keywords 不归 react-helmet 管，每个页面都是「站点默认 + 页面自己的」两份，默认的排在前面。给静态标签加上 `data-react-helmet="true"` 后由 Helmet 替换，不执行 JS 的抓取方仍能看到默认描述（第 2 批换成原生标签后，改为 `data-default-seo` + index.tsx 启动时移除）
  - 验证：本机 Chrome 无头模式逐页加载 212 个页面，标题全部是当前页，description 和 keywords 都只有一份
  - 修改涉及：MarkdownPage.tsx、AboutPage.tsx、ContactPage.tsx、CollaboratePage.tsx、CoursesPage.tsx、public/index.html

## P2 · 体验与无障碍

- [x] **1. 窄屏（≤1200px）目录按钮被回顶按钮遮住**，手机上点「目录」实际回到顶部（2026-09-15 已完成）
  - 复核：目录按钮（`bottom:2rem; right:1rem`，48px，z-index 99）大半被回顶按钮（`bottom:2rem; right:2rem`，44px，z-index 100）盖住，滚动超过 400px 后基本点不到
  - 做法：目录按钮移到回顶按钮正上方、中心对齐；抽屉底部留白，最后几项能滚到回顶按钮上方
  - 验证：375px 下两个按钮不再重叠，目录按钮中心点上最上层的元素就是它，点击后抽屉展开、页面不跳动
  - 修改涉及：TableOfContents.tsx
- [x] **2. 暗色模式**（2026-09-15 已完成）：定义 `--hover-bg-color`（搜索框选中项对比度 1.21:1）；设置 `data-theme`（写好的暗色表格样式从未生效）；主色按钮对比度 2.72:1；ChapterNavigation 硬编码浅色
  - 做法：颜色变量从 ThemeContext 的 JS 挪到 index.css，按 `<html data-theme>` 切换（暗色表格样式随之生效），暗色加 `color-scheme: dark`；补上 `--hover-bg-color`；新增 `--on-primary-color`（主色背景上的文字，暗色下用深色字，对比度 2.72:1 → 约 7:1）、`--primary-hover-color` 和错误 / 成功 / 骨架屏 / 小按钮的颜色变量；ChapterNavigation、复制按钮、骨架屏、错误提示、搜索结果标签、路线图「计划中」标签等硬编码颜色改用变量
  - 顺带：全部任务页「N 个章节」标签用了不存在的 `--primary-color-light`，一直没有背景；课程页「已读」绿字对比度 2.5:1 → 4.6:1；章节页没收藏时的星号是 `#eaeaea`，几乎看不见 → 次要文字色，并加 `aria-pressed`
  - 验证：无头 Chrome 暗色截图检查首页、课程页、章节页（表格、代码块、上下章导航）、FAQ、路线图、搜索弹窗
  - 修改涉及：index.css、ThemeContext.tsx、useMarkdownComponents.tsx（去掉设置代码块背景变量的 effect）、ChapterNavigation.tsx、CopyButton.tsx、Skeleton.tsx、ErrorState.tsx、SearchModal.tsx、TableOfContents.tsx、ScrollToTopButton.tsx、MarkdownPage.tsx、HomePage.tsx、CourseDetailPage.tsx、CoursePartPage.tsx、CoursesPage.tsx、FAQPage.tsx、NotFoundPage.tsx、RoadmapPage.tsx
- [x] **3. 暗色首屏闪白**（2026-09-15 已完成）：主题在 useEffect 里才生效 → `<head>` 内联脚本提前设置，并跟随 `prefers-color-scheme`
  - 做法：public/index.html 的 `<head>` 里加内联脚本，首屏绘制前按「手动切换过的主题 → 系统主题」设置 `data-theme` 和 `theme-color`（原来固定是黑色）；ThemeContext 沿用这个值，没手动切换过时跟随系统切换
  - 验证（无头 Chrome）：系统暗色下，HTML 解析完、打包的 JS 执行前 `data-theme` 已经是 dark，body 背景是 #121212；系统切换深浅色时网站跟着变；手动切换后刷新保持
  - 注意：没手动切换过、系统是暗色的访客，上线后默认看到暗色
  - 修改涉及：public/index.html、ThemeContext.tsx、index.css
- [x] **4. 滚动位置**（2026-09-15 已完成）：前进导航统一回顶部，后退恢复原阅读位置
  - 🆕 复核：除了章节页，所有页面切换都不回顶部，比如在页面底部点页脚链接，新页面停在下半截
  - 做法：新增 ScrollManager。点链接进入新页面时回到顶部；后退 / 前进 / 刷新时恢复。数据在组件里异步加载，浏览器自带的恢复发生在内容出来之前，所以关掉自带的自己管。只记 scrollY 在图片多的章节不准（懒加载图片没加载时高度是 0，同样的 scrollY 会落到更靠后的内容），所以记下视口顶部的元素（DOM 路径 + 偏移），等它渲染出来再对齐，对齐后 1.5 秒内上方内容变高时继续对齐。位置存 sessionStorage；新打开的页面（输入地址、从别处点进来）不恢复
  - 验证（无头 Chrome，桌面 1280px 和手机 375px 各一遍，10 项全过）：页面底部点页脚链接，新页面在顶部，后退回到列表原来的位置；课程页 80% 处点章节再后退、刷新课程页，都回到原来看到的那一章；图片多的章节读到 60% → 下一章 → 后退，视口里是同一段内容，1.8 秒后仍对齐
  - 做 P1.1 的话：框架模式的 `<ScrollRestoration>` 按像素恢复，图片多的章节会有上面说的偏差，可以继续用 ScrollManager
  - 修改涉及：ScrollManager.tsx（新增）、App.tsx、CoursePartPage.tsx（去掉进入章节时的 scrollTo）
- [x] **5. 代码块**：没标语言的 495 个代码块没有背景、不能横向滚动（手机上撑宽整页）；~~疑难解决页行内代码被设成 `display:block`~~（2026-09-14 已修复）（2026-09-15 已完成）
  - 做法：没标语言的代码块放进和其他代码块一样的代码框（背景、块内横向滚动、复制按钮）
  - 🆕 复核时发现，手机上把页面撑宽的还有宽表格和正文里的长网址 / 长标识符 → 表格外面包一层横向滚动容器；body 设 `overflow-wrap: break-word`，放不下的长词才断行
  - 🆕 第 2 批逐页检查时又测出一处：SDL与太空战机的介绍章用 `display:flex` 并排两张 `width="300"` 的图片，手机上把页面撑宽 267px → 全局给图片加 `min-width: 0`，窄屏上等比缩小（index.css）。之后 375px 下 212 页横向溢出为 0
  - 验证：本机 Chrome 无头模式按 375px 手机视口逐页加载 212 个页面，横向溢出 0 页；1400px 抽查 22 页也没有溢出。把代码框换回改动前的裸 `<pre>` 模拟旧版，两个章节分别被撑到 848px / 918px 宽
  - 修改涉及：useMarkdownComponents.tsx、index.css
- [ ] **6. 其他**（2026-09-15 只剩图片 alt）：~~搜索弹窗的对话框语义与焦点管理~~；~~收起的目录仍可 Tab 聚焦~~（2026-09-15 已修复：收起后设为 `visibility: hidden`，按钮加 `aria-expanded`）；~~正文链接只靠颜色区分~~；80% 图片缺 alt（要逐张补文字说明，是内容工作）；~~手机菜单开着时经搜索结果或浏览器后退跳转，菜单不关、`body` 保持 `overflow:hidden` 导致页面滚不动~~（2026-09-15 已修复：路由变化时收起菜单，滚动锁跟随菜单状态）；~~`prefers-reduced-motion`~~
  - 修改涉及（目录和菜单两项）：TableOfContents.tsx、Navbar.tsx
  - 搜索弹窗（2026-09-15）：`role="dialog"` + `aria-modal`；输入框是组合框，方向键选中的结果通过 `aria-activedescendant` 告诉读屏软件，结果数写进状态区；Tab 不会让焦点移出对话框；关闭后焦点回到搜索按钮；方向键选到列表可视范围以外的结果时自动滚进来
  - 正文链接（2026-09-15）：章节页、静态页、疑难解决页的正文链接加下划线（疑难解决页的链接以前连颜色都和正文一样）
  - 减少动态效果（2026-09-15）：系统开启时去掉过渡和动画，回顶按钮直接跳到顶部
  - 🆕 章节底部的「上一章 / 遇到问题？去反馈 / 下一章」在手机上三栏挤在一行，标题一行只剩两三个字（2026-09-15 暗色截图时发现）→ 600px 以下上一章、下一章各占一行，反馈链接放最后（ChapterNavigation.tsx）
  - 验证：SearchModal.test 新增 2 个用例（焦点与 Tab、aria-activedescendant）；无头 Chrome 里实际操作搜索、方向键、Tab、Esc；模拟 `prefers-reduced-motion` 后页面淡入和目录抽屉的时长为 0
  - 修改涉及（这 3 项）：SearchModal.tsx、SearchModal.test.tsx、CoursePartPage.tsx、MarkdownPage.tsx、TroubleshootingDetailPage.tsx、index.css、ScrollToTopButton.tsx

## P3 · 工程与运维

- [x] **1. 测试与 CI**（2026-09-15 全部完成）：~~修复失败的 `App.test.tsx`~~（2026-09-14 已修复，并新增 ErrorBoundary 测试）；~~部署前跑测试~~（前端 jest、后端 `node --test`，任何一项失败都不构建、不部署）；~~重启后做健康检查~~（2026-09-15 已加；同时服务器上依赖没变就跳过 `npm ci`，安装限时 5 分钟且失败不重启）；~~去掉 CI 里白装的后端 `npm ci`~~；~~`setup-node` 加 npm 缓存~~
  - 顺带：App.test 在 act 里等懒加载页面加载完，去掉每次测试的 15 条 act 警告
  - 修改涉及：.github/workflows/deploy.yml、App.test.tsx
- [x] **2. 依赖升级**（2026-09-15 运行时依赖已升级；类型包等迁到 Vite 后再升）
  - 复核：audit 共 76 条，只有 13 条的包会进浏览器 bundle。axios、react-router、mdast-util-to-hast、styled-components、@babel/runtime 在 semver 范围内升级即可修复；mermaid 12 全版本被 chevrotain → lodash-es 标记（npm 给的「修复」是降回 11，不采纳）；prismjs 要 react-syntax-highlighter 16 才能修。请求地址固定、内容都是自己写的，这几条实际都利用不了
  - ⚠️ 不要直接 `npm update`：会把 `@types/react` 升到 19.3（声明需要 TS 5.6），项目锁在 TS 4.9 → 只升运行时包，类型包等迁到 Vite 后再升
  - 结果：react / react-dom 19.3.0、react-router-dom 7.18.3、axios 1.20.0、mdast-util-to-hast 13.2.1、@babel/runtime 7.29.7；audit 76 → 68 条，进浏览器的包里剩下的主要是 mermaid 和 prismjs 两条依赖链
  - 🆕 styled-components 锁在 `~6.4.4`：6.5 起类型声明用了 TS 5.4 的 `NoInfer`，在 TS 4.9 下事件处理函数的参数被推断成隐式 any，构建失败；6.4.4 已不在 audit 名单里
  - 修改涉及：frontend/package.json、frontend/package-lock.json
- [x] **3. 清理死代码**（2026-09-15 已完成，服务器上的 nginx 配置待处理）：`rehype-highlight`、`@types/react-router-dom@5`、`@types/styled-components`、`web-vitals`、`ThemeToggle.tsx`、`App.css`、`logo.svg`、`public/css/*`、`public/content/faq.md` 与 `roadmap.md`、`backend/src/test_search.js`、已被跟踪的 `frontend/build.log`、根目录 `package.json` 里的 helmet 依赖；`searchService.js:41` 引用了未定义的 `fs`
  - 顺带：根目录 `package.json` / `package-lock.json` 里只有这几个没用到的依赖，整个删掉；SearchModal 去掉 `REACT_APP_API_URL`，和其他请求一样走同源 `/api`；index.tsx 去掉 reportWebVitals
  - [ ] 【服务器，需要 sudo 密码，由用户执行】nginx 里遗留的 `location /css/`（配置文件第 28–34 行，alias 到 `/var/www/html/css/`，里面还有 2025-03 的 tableStyles.css / videoStyles.css）：线上跑的还是第 1 批之前的构建，`index.html` 仍引用 `/css/`，**要等这批部署完、确认站点正常之后再删**；改前备份 `cppgamedev.conf`，`nginx -t` 通过再 reload
  - 修改涉及：删除 12 个文件，frontend/package.json（去掉 4 个依赖），searchService.js、SearchModal.tsx、index.tsx
- [x] **4. 后端精简**（2026-09-15 已完成）：关闭 `x-powered-by`；去掉 `cors()` 与 `express.json()`（接口全是同源 GET）
  - `cors` 依赖一并删除，部署脚本里的依赖自检同步去掉 cors
  - 验证：本地接口响应头里不再有 `X-Powered-By` 和 `Access-Control-Allow-Origin`
  - 修改涉及：backend/src/index.js、backend/package.json、backend/package-lock.json、.github/workflows/deploy.yml
- [ ] **5. 重复代码**：课程卡片 4 份拷贝 → `CourseCard`；Markdown 容器样式 3 份 → `MarkdownBody`
- [x] **6. 过时配置与文档**（2026-09-15 已完成）：`manifest.json` 名称仍是「React App」；CLAUDE.md 里 MarkdownPage / ScrollToTopButton / TableOfContents 的描述已过时
  - manifest 改为「C++游戏开发教程」；CLAUDE.md 同时补上统计上报方式、搜索索引、前后端测试命令；README 去掉 rehype-highlight、CORS 和根目录 `npm install`，Node 版本改为 22+
  - 修改涉及：public/manifest.json、CLAUDE.md、README.md

## 待在国内网络 / 后台确认

- 百度收录：开发机的 `site:cppgamedev.top` 查询触发了百度安全验证，需要在百度搜索资源平台查看
- 图床在国内的速度：见 P1.2
- 真实加载指标（LCP / CLS 等）：在国内网络下用 Lighthouse 跑一次首页和一个章节页
- GA4 后台「增强型衡量 → 网页浏览 → 基于浏览器历史记录事件的网页变化」：见 P1.6

## 复核时确认没问题的

- 线上运行的就是 main 最新提交（deploy 与 main 同为 ac15af4）
- 后端生产依赖 0 漏洞
- Giscus 评论已是 `loading: lazy`
- 教程里的原始 HTML 只有 img / div / iframe / br 四种，没有正文被误当成 HTML 标签吞掉
- ErrorBoundary 已能识别 Chrome / Safari 的动态 import 失败（迁到 Vite 后仍适用）
- 目录抽屉用负的 `right` 藏在屏幕外，在真实 Chrome 里不会撑宽页面（应用内浏览器面板隐藏时测到的溢出，是过渡动画被暂停造成的假象）
