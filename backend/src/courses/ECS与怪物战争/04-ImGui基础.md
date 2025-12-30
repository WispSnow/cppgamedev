# 04 ImGui基础

<div class="video-container">
  <div id="bilibili" class="video-content">
    <!-- B站嵌入：使用 https 明确协议（避免 file:// 或 http 导致被浏览器拦截） -->
    <iframe
      class="video-frame"
      src="https://player.bilibili.com/player.html?bvid=BV1ZQWZzTEVw&page=1&autoplay=0&danmaku=0&high_quality=1"
      width="100%"
      height="480"
      scrolling="no"
      frameborder="0"
      allowfullscreen>
    </iframe>
  </div>
</div>

[在 Bilibili 上观看](https://www.bilibili.com/video/BV1ZQWZzTEVw)

## 📖 概述

从这一节开始，我们引入 **ImGui**：一个广泛用于游戏/引擎开发的“即时模式 UI”（Immediate Mode GUI）库。

它最大的特点是：**UI 不是对象树，也不是一堆控件类**；你只要在每一帧里“声明”界面长什么样，然后根据控件返回值（例如按钮是否被点击）直接写逻辑即可。

![](../本期参考/PPT截图/怪物战争.025.png)

> PPT 第 25 页：ImGui 的集成流程（初始化 → 主循环：事件处理/开始新帧/声明UI/渲染 → 清理）

本节对应代码状态：`04-ImGui基础`，核心示例集中在：

- `CMakeLists.txt`：把 ImGui 加进工程编译
- `src/main.cpp`：ImGui 初始化/循环/渲染/清理 + 两个示例窗口

> 说明：本节属于“预备知识”中的 ImGui 分支（tag 在 `imgui-tut` 线上）。跟课时直接 `git checkout 04-ImGui基础` 即可，不需要关心它与 EnTT 分支是否在同一条提交线上。

## 🎯 学习目标

- 理解 ImGui 的工作方式：每帧 `NewFrame()` → 声明 UI → `Render()` 生成绘制数据
- 学会在 SDL3 + SDL_Renderer 项目中集成 ImGui（使用 SDL3 / SDL_Renderer3 后端）
- 能写出常见控件：`Text` / `Button` / `SliderFloat` / `Image`
- 了解常用配置：主题、缩放、透明度、中文字体加载

## 🧠 思路与设计

### 1) 集成 ImGui 有哪些选择？

常见有两种：

- **把 ImGui 源码放进工程（本节采用）**：如 `external/imgui/`，CMake 直接把 `imgui.cpp` 等源码编进目标
  - 优点：完全离线、版本可控，和课程的 `external/` 依赖策略一致
  - 缺点：仓库体积变大，需要维护更新
- **用 CMake 在线拉取（FetchContent）**：像 SDL3、EnTT 一样在线获取
  - 优点：自动化、依赖管理一致
  - 缺点：依赖网络；课程环境下可控性略弱

### 2) 为什么本节用 SDL_Renderer3 后端？

ImGui 本身不负责“怎么画到屏幕上”，它只生成 draw data；具体的绘制要交给“后端（backend）”完成。

本节选的是：

- 平台后端：`imgui_impl_sdl3`
- 渲染后端：`imgui_impl_sdlrenderer3`

这样我们可以在“原本就使用 SDL_Renderer 的小项目”里，用最少心智成本把 ImGui 跑起来；后面如果切换到 OpenGL/Vulkan，也只是替换后端文件与初始化方式。

## 🔧 实现步骤

### 1) 把 ImGui 编进工程（CMake）

在 `CMakeLists.txt` 里，我们把 ImGui 的核心源文件和 SDL3/SDL_Renderer3 的后端源文件加入编译：

```cmake
set(IMGUI_DIR ${CMAKE_SOURCE_DIR}/external/imgui)
set(IMGUI_SOURCES
    ${IMGUI_DIR}/imgui.cpp
    ${IMGUI_DIR}/imgui_draw.cpp
    ${IMGUI_DIR}/imgui_tables.cpp
    ${IMGUI_DIR}/imgui_widgets.cpp
    ${IMGUI_DIR}/imgui_demo.cpp
    ${IMGUI_DIR}/backends/imgui_impl_sdl3.cpp
    ${IMGUI_DIR}/backends/imgui_impl_sdlrenderer3.cpp
)

include_directories(${IMGUI_DIR} ${IMGUI_DIR}/backends)
add_executable(${TARGET} ${SOURCES} ${IMGUI_SOURCES})
```

这一步做完，你就能在代码里 `#include <imgui.h>`，并链接到对应实现。

### 2) 初始化 ImGui：创建 Context + 初始化后端

本节把初始化封装成了 `ImGuiInit(window, renderer)`：

```cpp
IMGUI_CHECKVERSION();
ImGui::CreateContext();

ImGuiOptionalSettings();

ImGui_ImplSDL3_InitForSDLRenderer(window, renderer);
ImGui_ImplSDLRenderer3_Init(renderer);
```

这里要点是两件事：

1) 先有 ImGui Context（ImGui 的“世界”）
2) 再初始化后端，让 ImGui 知道“事件从哪里来、画到哪里去”

### 3) 主循环里按固定顺序接入 ImGui：事件 → 新帧 → UI → 渲染

![](../本期参考/PPT截图/怪物战争.026.png)

> PPT 第 26 页：UI 是“声明出来的”，控件返回值就是交互入口（如按钮是否点击）

对应 `src/main.cpp` 的结构是：

- 事件阶段：把 SDL 事件喂给 ImGui
  - `ImGui_ImplSDL3_ProcessEvent(&event);`
- 每帧开始：告诉 ImGui “我要开始写这一帧的 UI”
  - `ImGui_ImplSDLRenderer3_NewFrame();`
  - `ImGui_ImplSDL3_NewFrame();`
  - `ImGui::NewFrame();`
- UI 声明：调用你的窗口函数（本节有 `ImGuiWindow1()` / `ImGuiWindow2(renderer)`）
- 每帧结束：生成绘制数据并交给渲染后端画出来
  - `ImGui::Render();`
  - `ImGui_ImplSDLRenderer3_RenderDrawData(ImGui::GetDrawData(), renderer);`

本节把这段流程收拢到 `ImGuiLoop(renderer)` 里，让 `main()` 更清爽，也更贴近“引擎主循环”写法。

### 4) 两个最小窗口：按钮/滑条 + 图片

`ImGuiWindow1()` 演示了最常见的控件模式：

- `ImGui::Button(...)` 返回 `true` → 说明这一帧按钮被点击 → 直接写逻辑（本节用 `spdlog::info` 打印）
- `ImGui::SliderFloat(...)` 返回 `true` → 说明数值发生变化 → 执行响应逻辑

`ImGuiWindow2(renderer)` 演示了 `ImGui::Image(...)`：

- 使用 `SDL3_image` 读取贴图 `assets/textures/Buildings/Castle.png`
- 以 `ImVec2(128, 128)` 尺寸显示在窗口中

> 注意：示例里在窗口函数中直接 `IMG_LoadTexture` 只是演示用法；实际项目应缓存纹理并在退出时释放，避免重复加载与内存增长。

### 5) 常用配置：主题/缩放/透明度/中文字体

本节把一些实用设置放在 `ImGuiOptionalSettings()`：

- 导航：`io.ConfigFlags |= ImGuiConfigFlags_NavEnableKeyboard / NavEnableGamepad`
- 主题：`ImGui::StyleColorsDark()`
- 缩放：用 `SDL_GetDisplayContentScale(SDL_GetPrimaryDisplay())` 取系统缩放，并调用 `style.ScaleAllSizes(main_scale)`
- 透明度：调整 `style.Colors[ImGuiCol_WindowBg].w` / `ImGuiCol_PopupBg].w`
- 中文：用 `AddFontFromFileTTF(..., io.Fonts->GetGlyphRangesChineseSimplifiedCommon())` 加载字体

## ✅ 本节小结

- ImGui 的核心节奏是：事件 → 新帧 → UI 声明 → RenderDrawData
- SDL3 集成时，关键是选对后端文件（`imgui_impl_sdl3` + `imgui_impl_sdlrenderer3`）
- 即时模式 UI 的写法非常适合“调试面板”：写起来快，交互直接

## 🔍 自检清单

- [ ] 工程能编译运行，并出现 ImGui 窗口
- [ ] 点击按钮/拖动滑条能触发日志输出
- [ ] 能解释 `NewFrame()` 与 `Render()` 分别做什么
- [ ] 理解“每帧声明 UI”与传统 UI（对象树/控件类）的差异

## ➡️ 下一节预告

下一节是 **第 05 节：游戏框架改进**（纯理论课，无对应代码 tag）。我们会结合 PPT 与录音稿，讨论为什么要从“轮询 + 组件互相访问”走向“事件驱动 + 更清晰的系统边界”。
