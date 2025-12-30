# 25 ImGui显示单位信息

<div class="video-container">
  <div id="bilibili" class="video-content">
    <!-- B站嵌入：使用 https 明确协议（避免 file:// 或 http 导致被浏览器拦截） -->
    <iframe
      class="video-frame"
      src="https://player.bilibili.com/player.html?bvid=BV1Dvm5BrEj6&page=1&autoplay=0&danmaku=0&high_quality=1"
      width="100%"
      height="480"
      scrolling="no"
      frameborder="0"
      allowfullscreen>
    </iframe>
  </div>
</div>

[在 Bilibili 上观看](https://www.bilibili.com/video/BV1Dvm5BrEj6/)

## 📖 概述

到第 24 节为止，我们已经把核心玩法链路搭起来了：出击、战斗、波次生成……但越往后做，系统越多，状态越复杂，如果没有一个“随手可用”的调试面板，开发效率会明显下降。

这一节我们正式把 **ImGui 调试 UI** 接入主循环，并把它落到一个最实用的场景：**显示单位信息**。

你可以把它理解为“临时外挂面板”：

- 鼠标悬浮单位：弹出 tooltip，快速看属性
- 鼠标左键点选玩家单位：左上角固定窗口显示详情，并可额外显示攻击范围
- 鼠标右键：取消选中

![](../本期参考/PPT截图/怪物战争.089.png)

> PPT 第 89 页：ImGui 工作/集成流程（初始化 → 主循环 NewFrame/声明UI/Render → 清理）

![](../本期参考/PPT截图/怪物战争.090.png)

> PPT 第 90 页：ImGui 显示单位信息（SelectionSystem 负责检测/赋值，DebugUISystem 负责显示，尽量解耦游戏逻辑）

本节对应代码标签：`25-ImGui显示单位信息`（基线：`24-敌人生成波次`）。

## 🎯 学习目标

- 把 ImGui 跑通：初始化 / 事件处理 / 每帧渲染 / 退出清理
- 处理“逻辑分辨率 + ImGui”兼容问题：在 ImGui 渲染期间临时关闭 SDL 逻辑分辨率
- 用 `SelectionSystem` 实现“悬浮单位/选中单位”检测，并把结果放进 `registry.ctx()`
- 用 `DebugUISystem` 从 `registry.ctx()` 读取被选中/悬浮实体，并显示组件信息
- 复用 `ShowRangeTag`：选中单位后显示攻击范围（和第 23 节的“准备态范围预览”共用一套渲染系统）

## 🧠 思路与设计

这一节有两个关键设计点：

### 1) Debug UI 尽量不绑死游戏逻辑

我们希望 ImGui 只是“观察者”，不要把大量游戏逻辑写进 UI 里。否则以后替换 DebugUI（或做正式 UI）会很痛苦。

因此我们拆成两层：

- `SelectionSystem`：只做“检测与赋值”（hovered/selected 是谁）
- `DebugUISystem`：只做“读取与展示”（把组件信息打印出来）

中间的桥梁就是 `registry.ctx()`：把 `hovered_unit_ / selected_unit_` 的引用放进 ctx，系统之间共享但互不依赖。

### 2) ImGui 与 SDL 逻辑分辨率的冲突

本项目使用 SDL 的逻辑分辨率（letterbox），但 ImGui 对 SDL3 的逻辑分辨率支持并不完美。

所以我们采用一个实用的小技巧：

- ImGui 开始帧时：临时关闭逻辑分辨率
- ImGui 渲染完：恢复逻辑分辨率

这样既不破坏游戏画面，又能让 ImGui 的坐标与鼠标交互更稳定。

## 🔧 实现步骤

## 🧰 1) ImGui 初始化与清理：`GameApp::initImGui()`

在 `src/engine/core/game_app.cpp` 新增 `initImGui()`，并在 `GameApp::init()` 里调用：

- `ImGui::CreateContext()`
- 设置 style / 缩放 / 透明度
- 加载中文字体（失败则回退默认字体）
- 初始化 SDL3 + SDL_Renderer3 backend：`ImGui_ImplSDL3_InitForSDLRenderer` + `ImGui_ImplSDLRenderer3_Init`

退出时在 `GameApp::close()` 做清理：

```cpp
ImGui_ImplSDLRenderer3_Shutdown();
ImGui_ImplSDL3_Shutdown();
ImGui::DestroyContext();
```

## 🖱️ 2) 事件处理与穿透控制：`InputManager`

ImGui 要先收到 SDL 事件才能正确处理鼠标/键盘输入，所以在 `InputManager::update()` 的事件循环里补上：

```cpp
ImGui_ImplSDL3_ProcessEvent(&event);
```

同时为了避免“点了 ImGui 窗口，但游戏也响应鼠标”的穿透问题，在 `processEvent()` 开头加一层拦截：

```cpp
if (ImGui::GetIO().WantCaptureMouse) return;
```

这样鼠标正在操作 ImGui 时，游戏侧输入就会被短路掉。

## 🧩 3) 逻辑分辨率切换：`GameState`

在 `src/engine/core/game_state.*` 新增两个函数：

- `disableLogicalPresentation()`
- `enableLogicalPresentation()`

内部都是调用 `SDL_SetRenderLogicalPresentation(..., SDL_LOGICAL_PRESENTATION_DISABLED/LETTERBOX)` 完成切换。

它们会在 Debug UI 的 begin/end frame 中被调用（下一节）。

## 🧠 4) 选择系统：`SelectionSystem`

`src/game/system/selection_system.*` 负责维护两类信息：

- `hovered_unit`：鼠标附近有哪些单位（先玩家后敌人）
- `selected_unit`：左键点击选中玩家单位；右键取消选中

鼠标悬浮检测本质是一个“距离阈值”判定，本节在 `src/game/defs/constants.h` 新增：

```cpp
constexpr float HOVER_RADIUS = 30.0f;
```

每帧 `SelectionSystem::update()` 会更新 ctx 中的引用：

```cpp
registry_.ctx().get<entt::entity&>("hovered_unit"_hs) = entity;
```

选中单位后，系统会给该单位加上 `ShowRangeTag`，让 `RenderRangeSystem` 画出攻击范围；切换选中或清除选中时，会移除旧单位的 `ShowRangeTag`。

> 这样“范围显示”就成了一种可复用的调试能力：准备态（第23节）和选中态（本节）都能走同一套渲染。

## 🪟 5) 调试 UI：`DebugUISystem`

`src/game/system/debug_ui_system.*` 负责把信息画出来：

- `beginFrame()`：`NewFrame()` + 关闭逻辑分辨率
- `renderHoveredUnit()`：用 `ImGui::BeginTooltip()` 在鼠标旁显示单位信息
- `renderSelectedUnit()`：左上角固定窗口（无标题栏）显示更完整的信息
- `endFrame()`：`ImGui::Render()` + 渲染 draw data + 恢复逻辑分辨率

显示内容主要来自组件：

- `StatsComponent`：等级/稀有度/hp/atk/def/range/atk_interval
- `ClassNameComponent`：职业/敌人名
- 玩家额外 `NameComponent`（姓名）
- 近战额外 `BlockerComponent`（阻挡数）

## 🎬 6) 场景集成：让系统跑起来

`GameScene` 做了两件关键集成：

1) 在 `initRegistryContext()` 里把 `selected_unit_ / hovered_unit_` 的引用放进 ctx：

```cpp
registry_.ctx().emplace_as<entt::entity&>("selected_unit"_hs, selected_unit_);
registry_.ctx().emplace_as<entt::entity&>("hovered_unit"_hs, hovered_unit_);
```

2) 在主循环里调用系统：

- `update()`：`selection_system_->update()`
- `render()`：`debug_ui_system_->update()` 放在最后（保证 ImGui 的显示优先级最高）

同时 `RenderRangeSystem` 也补上了“地图单位范围显示”：如果地图单位带 `ShowRangeTag`，就用它的 `StatsComponent.range_` 绘制范围圆。

## ✅ 本节小结

- ImGui 从“能跑”升级成“能用”：初始化/事件处理/每帧渲染/清理闭环完成
- 用 `SelectionSystem → registry.ctx() → DebugUISystem` 把“检测”和“展示”解耦，便于后续替换/扩展
- 复用 `ShowRangeTag` 让“攻击范围显示”成为通用调试能力

## 🔍 自检清单

- [ ] ImGui 窗口是否能显示中文字体（加载失败会回退默认字体）
- [ ] 鼠标放在单位附近是否出现 tooltip
- [ ] 左键点选玩家单位是否出现左上角信息栏，右键是否取消
- [ ] 在 ImGui 窗口上操作鼠标时，游戏是否不会响应点击（无穿透）
- [ ] 选中远程单位时是否能显示攻击范围

## ➡️ 下一节预告

下一节我们会进入“技能施放与显示”：把技能状态机（冷却/就绪/激活/结束）做成可观察、可反馈的玩法系统，并用特效与 UI 把技能表现补齐。

