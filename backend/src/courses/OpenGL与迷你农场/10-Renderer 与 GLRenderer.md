# Renderer 与 GLRenderer：分层封装与"逻辑分辨率"

上节课我们把《迷你农场》的 2D 渲染最小闭环跑通了：`GameApp::render()` → `SceneManager::render()` → `RenderSystem` → `Renderer::drawSprite()`。系统只关心"画什么、画到哪、按什么顺序画"，把绘制命令交给 `Renderer` 就结束了。

但如果你细看代码，会发现两个"留给本课"的疑问：
1. `RenderSystem` 调用的是 `Renderer::drawSprite()`，但 `Renderer` 内部又转发给了一个 `GLRenderer`——**为什么要分两层？各自负责什么？**
2. 你把窗口拖成各种比例，画面始终不变形，只是多出了黑边（letterbox）——**这种"画面稳定"是怎么做到的？跟"逻辑分辨率"是什么关系？**

这节课就是为这两个问题准备的。

## 本节目标与问题定义

渲染系统的"难点"往往不在画出一个 Sprite，而在于把渲染管线工程化成可维护的结构：

- **分层**：上层系统需要一个稳定、简单的 API；底层渲染后端可能会不断演进（多 pass、合成、后处理、合批）。如果不分层，任何底层改动都会波及上层系统。
- **分辨率与坐标系**：窗口尺寸、像素尺寸、高 DPI、逻辑分辨率、世界坐标……如果这些概念混在一起，输入、UI 与渲染很容易"对不上"。

本节目标是建立两套心智模型：
1. `Renderer`（外观层）vs `GLRenderer`（后端）的职责边界：为什么要分层、各自负责什么。
2. "逻辑分辨率 + letterbox"架构：为什么能保证画面不变形，以及 Window / Pixel / Logical / World 四种坐标系如何对齐。

## 核心概念

建议先快速浏览一份项目级速查文档再继续：
- `docs/resolution_and_viewport.md`：Window / Pixel / Logical / World 坐标系与 letterbox 计算的完整定义

### 分层：Renderer 是"外观层"，GLRenderer 是"后端"

在《迷你农场》中，渲染被拆成两层：

**`engine::render::Renderer`——外观层（Facade）**
- 提供 `drawSprite / drawLine / drawUIImage / ...` 这类高层 API
- 通过 `ResourceManager` 获取纹理等资源（上层系统不需要知道纹理 ID 是什么）
- 负责少量项目约定逻辑（例如 viewport clipping 的 cull、默认绘制参数、flip 合并）
- 把真正的绘制命令转发给 `GLRenderer`

**`engine::render::opengl::GLRenderer`——OpenGL 后端**
- 管理 SDL/OpenGL 上下文（`RenderContext`）与渲染开关（VSync / Pixel Snap 等）
- 管理视口与 letterbox（`ViewportManager`）
- 承载多 pass 管线：Scene / Lighting / Emissive / Bloom / Composite / UI
- 负责最终把一帧画面"合成并显示"（`present()`）

用一句话概括：

> 上层只关心"画什么"，`GLRenderer` 负责"怎么画 + 画到哪里 + 以什么分辨率画"。

<img src="https://theorhythm.top/gamedev/TF/L08_renderer_layer_architecture.webp" style='width: 960px;' />

下面这张图更直观地展示了两层的职责边界：

<img src="https://theorhythm.top/gamedev/TF/L08_renderer_responsibilities.webp" style='width: 960px;' />

**为什么要这样分？** 因为上层系统（`RenderSystem`、`LightSystem`、UI 等）只依赖 `Renderer` 的接口。当底层需要升级（比如从单 pass 到多 pass、添加后处理），只要 `Renderer` 的接口不变，上层系统一行代码都不用改。这就是外观模式（Facade Pattern）在渲染管线中的典型应用。

### 逻辑分辨率：固定的设计坐标空间

《迷你农场》采用"逻辑分辨率渲染"策略：

> 先以固定 `logical_size` 渲染到离屏缓冲（FBO），再把结果等比缩放到窗口中的一个 viewport（letterbox），画面就不会随窗口比例变化而变形。

`logical_size` 的来源是配置文件 `config/window.json`：

```json
{
  "window": {
    "width": 1280,
    "height": 720,
    "window_scale": 1.4,
    "logical_scale": 0.5
  }
}
```

两个 scale 的含义完全不同：
- **`window_scale`**：决定"窗口初始大小"。`1280 × 1.4 = 1792`，`720 × 1.4 = 1008`，所以初始窗口是 1792×1008。这只是视觉偏好，用户随时可以拖拽改变。
- **`logical_scale`**：决定"画面设计分辨率"。`1280 × 0.5 = 640`，`720 × 0.5 = 360`，所以逻辑分辨率是 640×360。这个值在运行期间**不会变**，它决定了离屏 FBO 的尺寸、UI 的坐标空间、以及相机的视野大小。

> `window_scale` 影响"看到多大的窗口"；`logical_scale` 影响"看到多细的画面"。改 `logical_scale` 会同时影响渲染质量和像素密度。

### Letterbox：把 logical 画面等比塞进窗口

letterbox 的核心就是"等比缩放 + 居中"：
```text
scale = min(window_w / logical_w, window_h / logical_h)
viewport.size = logical_size * scale
viewport.pos  = (window_size - viewport.size) * 0.5
```

用一组具体数字感受一下：

```text
窗口：1792 × 1008     逻辑分辨率：640 × 360

scale_x = 1792 / 640 = 2.8
scale_y = 1008 / 360 = 2.8    → scale = min(2.8, 2.8) = 2.8
viewport.size = 640 × 2.8  = 1792,  360 × 2.8 = 1008
viewport.pos  = (0, 0)     → 刚好撑满，无黑边

如果把窗口拖成 1400 × 1008（更窄了）：
scale_x = 1400 / 640 = 2.1875
scale_y = 1008 / 360 = 2.8    → scale = min(2.1875, 2.8) = 2.1875
viewport.size = 640 × 2.1875 = 1400,  360 × 2.1875 = 787.5
viewport.pos  = (0, 110.25)   → 上下各约 110px 黑边
```

项目中对应的函数是 `engine::utils::computeLetterboxMetrics()`（`src/engine/utils/math.h`）。`ViewportManager` 在窗口尺寸变化时调用它来更新 `glViewport`。

<img src="https://theorhythm.top/gamedev/TF/L08_logical_resolution_letterbox.webp" style='width: 960px;' />

**常见坑：高 DPI 下"窗口坐标"和"drawable 像素"不一致**

在高 DPI 屏幕上（如 macOS Retina），`SDL_GetWindowSize()` 返回的"窗口坐标尺寸"和 `SDL_GetWindowSizeInPixels()` 返回的"drawable 像素尺寸"可能不同（例如窗口 1792×1008 但 drawable 3584×2016）。`glViewport` 用的是像素单位，而鼠标事件坐标用的是窗口坐标。因此渲染侧与输入侧必须分别在各自的单位里做 letterbox 换算：
- **渲染侧**：`ViewportManager` 使用 `SDL_GetWindowSizeInPixels()` 的结果
- **输入侧**：`InputManager` 使用 `SDL_GetWindowSize()` 的结果

如果弄反了，坐标会差一倍——这是跨平台渲染中经典的排查盲区。

### 四种坐标系：Window / Pixel / Logical / World

本项目涉及的坐标系可以这样记：

| 坐标系 | 你会在哪看到它 | 典型用途 |
| --- | --- | --- |
| Window Coordinates | `SDL_GetWindowSize()`、鼠标事件 `event.*.x/y` | 输入事件坐标、输入侧 letterbox 映射 |
| Window Pixels (drawable) | `SDL_GetWindowSizeInPixels()`、`glViewport` | 渲染 viewport、渲染侧 letterbox |
| Logical | `logical_size`（配置计算） | 离屏渲染目标尺寸、UI 坐标空间、相机 screen 空间 |
| World | `Transform.position_` | 玩法/物理/空间索引、相机与视口剔除 |

如果只记一条"对齐原则"：

> 输入（鼠标）最终要映射到 Logical；相机把 World 映射到 Logical；GLRenderer 把 Logical 等比合成到 Window Pixels 的 viewport。

<img src="https://theorhythm.top/gamedev/TF/L08_coordinate_systems_alignment.webp" style='width: 960px;' />

## 架构与数据流

### `present()`：多 pass 管线的合成流水线

上节课说过 `GameApp::render()` 最后会调用 `Renderer::present()`，它内部转发到 `GLRenderer::present()`。这个函数是整个渲染管线的"终点"，它把一帧的所有绘制命令按 pass 执行，最终合成到屏幕：

```text
1. Scene Pass:     把场景精灵 flush 到 FBO（@logical 分辨率）
2. Lighting Pass:  把光照结果 flush 到 FBO（@logical 分辨率）
3. Emissive Pass:  把自发光精灵 flush 到 FBO（@logical 分辨率）
4. Bloom Pass:     对自发光做泛光后处理（@logical 分辨率，可关闭）
5. Composite Pass: 把上面所有 FBO 合成到默认帧缓冲的 viewport（@window pixels）
6. UI Pass:        把 UI 元素渲染到 viewport（@window pixels；UI 坐标按 logical 设计）
7. ImGui:          Debug UI 覆盖整个窗口（@window pixels）
8. swap buffers
```

**关键的分辨率切换发生在第 5 步**：前 4 步都在 `logical_size` 大小的 FBO 上绘制（固定分辨率），第 5 步 Composite Pass 用一个全屏四边形把结果缩放到 letterbox viewport 里（窗口像素）。这就是"逻辑分辨率渲染"在管线中的实际落地。

<img src="https://theorhythm.top/gamedev/TF/L08_pass_pipeline.webp" style='width: 960px;' />

**为什么 UI 在 viewport 而不在 logical FBO 上？**
UI 的坐标是相对**屏幕**的（不随相机移动），所以最终要画到代表屏幕可见区域的 viewport。但 UI 的设计坐标空间仍然是 `logical_size`——这样无论窗口怎么变化，UI 布局的相对位置都保持一致。这正是"逻辑分辨率"的价值所在：它不仅统一了场景渲染，也统一了 UI 布局。

### 输入对齐：Mouse(window) → Logical Mouse(logical)

玩家的鼠标坐标来自 SDL 事件，是 window coordinates。但游戏逻辑（UI 点击、世界坐标转换）需要 logical 坐标。`InputManager::recalculateLogicalMousePosition()` 负责做这个映射：

```text
# 1. 用 window 坐标系（不是 pixels！）计算 letterbox
metrics = computeLetterboxMetrics(window_size, logical_size)

# 2. 减去 viewport 偏移，得到 viewport 内的局部坐标
local = mouse_position - metrics.viewport.pos

# 3. 除以缩放因子，得到 logical 坐标
logical = local / metrics.scale

# 4. clamp 到 [0, logical_size]，避免黑边区域产生越界交互
logical = clamp(logical, {0,0}, logical_size)
```

注意第 1 步用的是 `window_size`（来自 `SDL_GetWindowSize`），而不是 `window_size_pixels`——因为 SDL 鼠标事件的坐标就是 window coordinates。这和渲染侧用 `SDL_GetWindowSizeInPixels` 做 `glViewport` 是两套独立的换算，各自在各自的单位体系里保持一致。

### 调试验证：三面板联动"看见坐标系"

这节课强烈建议你同时打开三块面板来验证你的理解：

- **`Core: Game State`**：显示 Window Size / Logical Size / Camera View Size(world)
- **`Input`**：显示 Mouse Position(window) / Logical Position(logical)
- **`OpenGL Renderer`**：显示 Logical Size、Window Size(pixels)、Viewport(pixels)、Letterbox Scale、Pass Stats

**动手实验 1：拖拽窗口观察 letterbox**
改变窗口大小/比例，你会看到：
- Logical Size **始终不变**（由配置决定）
- Viewport 和 Letterbox Scale 跟着窗口变化
- 画面不变形，多出的区域以黑边填充

**动手实验 2：观察输入坐标映射**
打开 `Input` 面板，缓慢移动鼠标：
- Mouse Position（window 坐标）会随鼠标连续变化
- Logical Position 也在变化，但范围被 clamp 在 `[0, logical_size]` 内
- 把鼠标移到 letterbox 黑边区域，Logical Position 会停在边界值——不会越界

**动手实验 3（可选）：渲染管线开关**
在 `OpenGL Renderer` 面板里切换 `Pixel Snap` / `VSync`，建立"渲染管线的全局开关都集中在 GLRenderer"的直觉。你也可以观察 Pass Stats 里各个 Pass 的 draw calls 与 vertices 计数。

**深入观察：ViewportManager 的 dirty 机制**

ViewportManager 用 `dirty()` 标记窗口尺寸是否改变，避免每帧都重新计算 letterbox viewport。只有窗口大小变化时才触发重算。这是实时图形中常见的"变化检测 + 延迟更新"模式。

## 阅读清单

这份"最短闭环阅读路径"能把逻辑分辨率与分层串起来：

1. **【核心】** `docs/resolution_and_viewport.md`：把 Window / Pixel / Logical / World 与 letterbox 规则立住
2. `config/window.json` → `src/engine/core/config.*`：理解 `window_scale` vs `logical_scale` 各自控制什么
   > 关注点：JSON 键名 `logical_scale` 对应 Config 成员 `window_logical_scale_`
3. **【核心】** `src/engine/core/game_app.cpp`：找到 `logical_size` 的计算与 `GLRenderer::create()` 的输入来源
   > 关注点：`initGLRenderer()` 函数的注释详细说明了两个 scale 的区别
4. **【核心】** `src/engine/render/renderer.*`：外观层心智模型——系统如何用 Renderer 画世界/画 UI，以及它如何做 cull 并把命令交给 GLRenderer
5. **【核心】** `src/engine/render/opengl/gl_renderer.*`：重点看 `clear()` / `present()` 的"离屏 logical → 合成到窗口 viewport"流水线
6. `src/engine/render/opengl/viewport_manager.*` → `src/engine/utils/math.h`：把 letterbox 的 viewport / scale 算清楚（渲染侧用 pixels，输入侧用 window coordinates）
7. `src/engine/render/camera.*`：理解 Camera 的 screen 空间为何是 `logical_size`，以及 zoom 如何改变 world view size
8. `src/engine/input/input_manager.cpp`：Mouse(window) → Logical Mouse(logical) 的映射与 clamp
9. （选读）`src/engine/debug/panels/*_debug_panel.cpp`：用面板验证 viewport / scale 是否符合预期

## 练习

### 练习 1：为 `computeLetterboxMetrics()` 增加单元测试

目的：把"窗口适配/输入映射"的核心数学逻辑用测试固化，避免后续改动引入坐标回归。

**目标：**
- 为 `engine::utils::computeLetterboxMetrics()` 编写单元测试，覆盖至少 3 类窗口比例与边界输入。

**验收标准（建议至少完成 4 项）：**
- 典型 16:9 窗口 + 不同 logical 比例：scale 取 `min(scale_x, scale_y)`，viewport 居中
- 超宽/超高窗口：viewport 不越界，pos 非负
- 非正输入（0 或负数）：返回的 viewport size 至少为 1，scale 合理
- 断言不要过度依赖浮点精度：用允许误差或只断言关键关系（例如 min 关系与居中关系）

**提示线索（模块/文件）：**
- `src/engine/utils/math.h`：`computeLetterboxMetrics`
- `tests/engine/*`：选择一个合适目录放测试（例如 `tests/engine/core/` 或 `tests/engine/render/`）

**提交方式：** GitHub PR

### 练习 2：在调试面板里可视化 DPI 缩放差异（可选）

目的：让高 DPI 下的"窗口坐标 vs 像素"差异一眼可见，减少后续排查成本。

**目标：**
- 在 `OpenGL Renderer` 或 `Core: Game State` 面板中同时显示：
  - Window Size（window coordinates）
  - Window Size(pixels)
  - 推导的 DPI scale（例如 `pixels / window`）

**验收标准：**
- 在普通 DPI 下 scale ≈ 1；在高 DPI 下 scale > 1
- 不引入新的第三方依赖，不破坏现有面板交互

**提示线索（模块/文件）：**
- `src/engine/debug/panels/gl_renderer_debug_panel.cpp`
- `src/engine/debug/panels/game_state_debug_panel.cpp`
- SDL API：`SDL_GetWindowSize` / `SDL_GetWindowSizeInPixels`

**提交方式：** GitHub PR

## 小结与预告

你现在应该能用几句话描述《迷你农场》的渲染分层与分辨率策略：

1. **Renderer 是外观层**：给系统用，负责资源获取、viewport clipping 与默认绘制参数，把命令转发给 GLRenderer。上层系统只依赖 `Renderer`，不碰 OpenGL 细节。
2. **GLRenderer 是后端**：承载多 pass 管线（Scene / Lighting / Emissive / Bloom / Composite / UI）、管理 ViewportManager 与 RenderContext，负责一帧画面的合成与显示。
3. **逻辑分辨率渲染**让画面不随窗口变形：以固定 `logical_size` 渲染到离屏 FBO，再由 Composite Pass 等比缩放到 letterbox viewport。
4. **四种坐标系各司其职**：Window（输入事件）→ Logical（UI / 相机 screen 空间）→ World（玩法 / 空间索引）；渲染侧用 Pixel，输入侧用 Window，各自独立换算，在 Logical 这一层对齐。

下节课（批处理与着色器）我们会进一步进入性能与画面稳定性：SpriteBatch / Shader 如何通过批处理减少 draw call、纹理缓存与 UV 计算、以及 Pixel Snap 在像素风渲染里解决了什么问题。
