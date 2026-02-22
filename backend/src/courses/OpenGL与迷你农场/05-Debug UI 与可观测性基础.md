# Debug UI 与可观测性基础

上节课我们建立了单元测试的"最小闭环"——从构建、运行到编写，掌握了用测试验证"逻辑对不对"的手段。但在日常开发中，你经常面对的不是"逻辑错了"，而是"不知道现在是什么状态"：场景栈里有几层？事件到底发了没有？输入被谁吃掉了？

这就需要另一种工具——**调试面板**。它让你在运行时直接观察程序内部状态，不用加 `printf`，不用猜。

从下一节课开始，你会频繁地用 `F5/F6` 打开各种调试面板来验证事件、场景、ECS、UI 等模块的行为。如果你不了解 Debug UI 这条链路本身是怎么工作的，就很容易陷入"会点按钮，但看不懂信息、定位不了问题"的状态。

所以这节课的任务是：**把 Debug UI 当作一套基础设施讲清楚**，为后续课程的调试演示打好地基。

## 本课目标

学完本节后，你将能回答四个核心问题：

1. **`F5/F6` 到底触发了什么？** 为什么是 `F5` 打开 Engine 面板、`F6` 打开 Game 面板？
2. **面板为什么分"Engine/Game"两类？** 它们何时注册、何时销毁？
3. **为什么在调试窗口打字时，游戏角色不会乱动？** 输入冲突是怎么被隔离的？
4. **发布构建时，如何把整个 Debug UI 从二进制中剥离？** 编译期开关和运行时开关各管什么？

> 目标不是记住某个实现细节，而是建立"从输入到可观测结果"的可复盘链路，以及理解调试基建如何在开发与发布之间切换。

---

## 1. 核心概念：Debug UI 的定位与两层开关

### 1.1 Debug UI 是"可观测性入口"，不是玩法功能

在《迷你农场》里，调试面板承担的是"验证与定位"的职责，和游戏玩法完全无关：

- **看状态**：游戏时间、场景栈、输入映射、资源缓存命中率
- **看链路**：事件是否发出、何时分发（Immediate 还是 Queued）
- **做小范围调参**：不改业务代码，先确认问题出在哪一层

你可以把它类比为汽车的仪表盘——它不驱动轮子转，但没有它你就是在盲开。

### 1.2 两层开关：编译期与运行时各管什么

《迷你农场》对 Debug UI 采用**两层开关**策略。这两层各有分工，互不干扰：

<img src="https://theorhythm.top/gamedev/TF/L03B_two_layer_switch.webp" style='width: 960px;' />

**编译期开关——控制"有没有"**

CMake 选项 `ENABLE_DEBUG_UI`（默认 `ON`）。关闭时，ImGui 源码、所有调试面板、`DebugRenderSystem` 都不会编入二进制，适用于发布构建。

具体来说：
- `cmake/ImGui.cmake` 不编译 ImGui 源码、不添加头文件搜索路径
- `CMakeLists.txt` 从 `ENGINE_SOURCES` / `GAME_LIB_SOURCES` 中移除所有调试面板 `.cpp` 和 `imgui_layer.cpp`、`debug_render_system.cpp`
- 源码中通过 `#ifdef TF_ENABLE_DEBUG_UI` 在集成点裁剪代码

一个值得注意的设计原则：**`#ifdef` 只出现在少数"边界"文件，而非遍布整个代码库**。被移除的 `.cpp` 文件本身不需要任何 `#ifdef`——它们整体不参与编译；只有**引用**它们的地方才需要条件编译。

| 文件 | 被裁剪的内容 |
|------|------------|
| `gl_renderer.h/.cpp` | `imgui_layer_` 成员、`beginDebugUI/endDebugUI` 方法体、F5/F6 热键逻辑 |
| `game_app.h/.cpp` | `debug_ui_manager_` 成员、`initDebugUIManager/registerDebugPanels`、`render()` 中的 begin/end 调用 |
| `context.h/.cpp` | `DebugUIManager&` 引用成员、构造参数、getter |
| `input_manager.h/.cpp` | `imgui_event_callback_` 成员、`ImGui::WantCaptureKeyboard/Mouse` 阻断逻辑 |
| `game_scene.h/.cpp` | `debug_render_system_` 成员、`registerDebugPanels`、调试面板相关 `#include` |

**运行时开关——控制"画不画"**

`config/window.json` 中的 `graphics.debug_ui`。即使编译时启用了 Debug UI，运行时也可以通过此开关禁用——此时 `F5/F6` 不会有任何响应，ImGui 帧也不会开启。适用于开发过程中临时关闭调试覆盖层，以干净画面检查视觉效果或进行性能测试，无需重新编译。

> **工程要点**：运行时开关控制"画不画"，编译期开关控制"有没有"。前者是日常开发的便利；后者是发布构建的保障。

---

## 2. 从按键到面板：热键链路与帧内位置

### 2.1 热键链路：SDL → GLRenderer → DebugUIManager

`F5/F6` 不是写死在业务层的，而是通过渲染层统一处理。完整链路如下：

<img src="https://theorhythm.top/gamedev/TF/L03B_hotkey_sequence.webp" style='width: 960px;' />

1. SDL 键盘事件被 `InputManager::update()` 轮询到
2. 事件通过回调转发到 `GLRenderer::handleSDLEvent()`
3. GLRenderer 检查按键：`SDL_SCANCODE_F5 + category_index` 映射到 `PanelCategory`
4. 调用 `DebugUIManager::toggleVisible(category)` 切换对应类别的 Hub 窗口可见性

这里有一个巧妙的设计：快捷键不是硬编码的"F5 对应 Engine、F6 对应 Game"，而是**按类别索引偏移**。`PanelCategory::Engine` 的值是 `0`，所以对应 `F5 + 0 = F5`；`PanelCategory::Game` 的值是 `1`，对应 `F5 + 1 = F6`。如果以后增加第三个类别，快捷键会自动扩展到 `F7`，不需要改任何映射代码。

> **注意时序**：`toggleVisible` 发生在输入阶段，而 Hub 窗口和面板的 `draw` 发生在同一帧的渲染阶段。两者不是连续调用，中间隔了整个 `update` 逻辑。

### 2.2 一帧里 Debug UI 画在什么位置

<img src="https://theorhythm.top/gamedev/TF/L03B_frame_render_flow.webp" style='width: 960px;' />

理解这条帧内顺序很重要：

1. `clearScreen()` — 清屏
2. `beginDebugUI()` — 开启 ImGui 帧（`ImGui::NewFrame()`）
3. `scene_manager_->render()` — 渲染游戏内容（场景、精灵、UI）
4. `endDebugUI()` — 绘制所有已注册的调试面板
5. `present()` — ImGui 绘制数据提交、交换缓冲区

Debug UI 是**覆盖层**，叠在场景渲染之上、`present` 之前。这意味着调试面板永远不会被游戏画面遮挡。

`beginDebugUI` 需要在场景渲染之前调用，因为 ImGui 采用"即时模式"：必须先开帧（`NewFrame`），场景中的 UI 代码和调试面板代码才能在同一帧内发出绘制指令，最后在 `present` 阶段统一提交。

---

## 3. 面板管理：分类、生命周期与协议

### 3.1 分类与生命周期：Engine 面板 vs Game 面板

调试面板被分成两类，生命周期也完全不同：

| 类别 | 快捷键 | 注册方 | 注销时机 | 包含面板举例 |
|------|--------|--------|---------|------------|
| **Engine** | F5 | `GameApp::registerDebugPanels()` | 应用退出时 | Renderer / Input / Scene / Resource / Time / Dispatcher Trace |
| **Game** | F6 | `GameScene::registerDebugPanels()` | `GameScene::clean()` 时 | Player / Game Time / Inventory / Save-Load / Map Inspector |

**为什么要分两类？** 因为它们的数据来源生命周期不同：

- **Engine 面板**引用的是引擎级对象（`Time`、`InputManager`、`Renderer` 等），这些对象在整个应用生命周期内都存在，跨场景不变。所以 Engine 面板在 `GameApp` 初始化阶段一次性注册，不需要随场景销毁。

- **Game 面板**引用的是 `GameScene` 内部的数据（`registry` 中的玩家实体、游戏时间、物品栏等）。当你离开 `GameScene`（比如回到标题界面），这些数据会被销毁。如果面板还持有指向它们的引用，就会变成悬垂引用，访问即崩溃。所以 Game 面板必须在 `GameScene::clean()` 中注销。

> **常见疑问**：按 `F6` 没有反应？这通常是因为你不在 `GameScene` 中。回到标题界面、暂停菜单等场景时，Game 面板已经被注销，`F6` 打开的 Hub 窗口里不会有任何勾选项。

### 3.2 面板协议：`name/draw/onShow/onHide`

每个调试面板都实现统一的 `DebugPanel` 接口：

<img src="https://theorhythm.top/gamedev/TF/L03B_panel_protocol.webp" style='width: 960px;' />

- **`name()`**：返回在 Hub 勾选列表中显示的名字（如 `"Core: Dispatcher Trace"`）。
- **`draw(bool& is_open)`**：窗口绘制的主体。面板可以通过将 `is_open` 设为 `false` 来通知管理器关闭自己——比如用户点击了窗口右上角的 × 按钮。管理器检测到 `is_open` 变为 `false` 后，会调用 `onHide()` 并将该面板标记为未启用。
- **`onShow()`**：面板被勾选启用时调用，用于初始化临时状态或开始数据采集。
- **`onHide()`**：面板被取消勾选或通过 × 关闭时调用，用于释放临时资源或停止采集。

`DebugUIManager` 的职责很明确：**只管理分组与生命周期**。它遍历每个类别的面板列表，在 Hub 窗口中画勾选框，根据勾选状态调用 `onShow/onHide`，对已启用的面板调用 `draw`。它不关心面板内部画了什么——这是每个面板自己的事。

### 3.3 继承类范例：`DispatcherTraceDebugPanel`

抽象接口讲完了，来看一个具体实现。`DispatcherTraceDebugPanel` 是一个很好的"最小面板实现模板"，因为它结构简单、分层清晰。

但这里一定要分清**展示层**和**采集层**：

- **展示层**：`DispatcherTraceDebugPanel`（`src/engine/debug/panels/`），只负责 ImGui 窗口绘制。
- **采集层**：`DispatcherTrace`（`src/engine/debug/dispatcher_trace.h/.cpp`），负责订阅事件、记录分发时机（Immediate/Queued）、维护最近分发的环形缓冲区。

展示层的落地非常简洁：

- `name()` 返回 `"Core: Dispatcher Trace"`，用于 Hub 勾选项展示。
- `draw(bool& is_open)` 负责窗口主体——Immediate/Queued 含义说明、最近分发事件表格、条目数量滑条。表格通过调用 `trace_.recentDispatches(...)` 拉取数据快照。
- **没有重写 `onShow()/onHide()`**——这表明并非每个面板都需要额外的生命周期逻辑。默认实现是空操作，不重写就行。

对应的数据链路是：

1. `GameApp` 初始化时调用 `DebugUIManager::enableDispatcherTrace(...)`。
2. `DebugUIManager` 创建 `DispatcherTrace` 实例，用 `watch<...>()` 为一批事件类型注册监听。
3. 主循环在 `dispatcher.update()` 前后调用 `onDispatcherUpdateBegin/End`，标记 queued 分发区间。
4. 面板的 `draw()` 通过 `trace_.recentDispatches(...)` 拉取快照并展示。

**这个范例的价值**：
- **结构简单**：容易看清 `DebugPanel` 协议如何落地。
- **分层明确**：采集与展示分离，便于后续替换 UI 但保留追踪能力。
- **业务纯粹**：它只做"观察事件分发"，不掺杂任何玩法逻辑。
- **向后衔接**：[事件系统](06-事件系统.md)讲事件系统时，你会继续用它作为事件时序的验证工具。

---

## 4. 输入隔离：ImGui capture 防止误触发

输入冲突最常见的场景：你在 `Save/Load` 面板的路径输入框里打字，结果游戏角色开始移动了。

这种事在《迷你农场》里不会发生，因为输入管理器实现了明确的**占用规则**：

1. SDL 事件先通过回调喂给 ImGui（`ImGui_ImplSDL3_ProcessEvent`）
2. ImGui 内部更新 `ImGuiIO::WantCaptureKeyboard` 和 `WantCaptureMouse` 标志
3. `InputManager::processEvent()` 检查这两个标志：如果 ImGui 正在占用输入，就不再将该事件映射为游戏动作

有一个值得留意的细节：**当前策略会阻断 `KEY_DOWN`，但仍保留 `KEY_UP` 的传递路径**。

这不是"放行输入"，而是让游戏的动作状态机能正确收尾。假设玩家按着方向键移动，这时你点击了调试面板的输入框——`WantCaptureKeyboard` 变为 `true`，后续的 `KEY_DOWN` 被阻断，角色停止移动。但如果同时阻断了 `KEY_UP`，动作状态机就永远收不到"释放"信号，方向键对应的动作会卡在 `HELD` 状态。等你关闭调试面板后，角色会"自动"朝那个方向走，因为状态机认为你还在按着键。放行 `KEY_UP` 就是为了避免这个问题。

同样的逻辑也适用于鼠标：`WantCaptureMouse` 为 `true` 时阻断鼠标按下和滚轮事件，但鼠标移动事件始终放行（用于更新逻辑坐标）。

> **工程约定**：调试 UI 与游戏输入共享同一事件源，但必须有明确的占用边界。这条规则在后续涉及 UI 框架（[UI 框架基础](17-UI%20框架基础.md)）和输入系统（[输入系统](15-输入系统.md)）的课程中会再次出现。

---

## 5. 阅读清单

建议按以下顺序阅读源码，建立"可复盘链路"。重在理解结构和数据流向，不必逐行深究实现细节。

| 顺序 | 文件路径 | 关注点 |
| :--- | :--- | :--- |
| **1** | `CMakeLists.txt` | 找到 `option(ENABLE_DEBUG_UI ...)`，理解编译期开关如何控制源文件列表和 `TF_ENABLE_DEBUG_UI` 宏定义。 |
| **2** | `cmake/ImGui.cmake` | ImGui 源码与头文件路径如何被条件包含——`ENABLE_DEBUG_UI=OFF` 时如何置空。 |
| **3** | `src/engine/core/game_app.cpp` | **【必读】** 建立"主循环里 Debug UI 在哪里被驱动"的全局位置。注意 `#ifdef TF_ENABLE_DEBUG_UI` 包裹的初始化、渲染、注册代码段。 |
| **4** | `src/engine/render/opengl/gl_renderer.cpp` | **【必读】** 看 `F5/F6` 热键如何按类别索引偏移、`beginDebugUI/endDebugUI` 在帧内的位置。 |
| **5** | `src/engine/debug/debug_ui_manager.h/.cpp` | 分类（Engine/Game）与面板生命周期（register/draw/unregister），以及 Hub 窗口的勾选逻辑。 |
| **6** | `src/engine/debug/debug_panel.h` | 所有面板必须遵循的最小接口——4 个虚函数。 |
| **7** | `src/engine/debug/dispatcher_trace.h/.cpp` | 追踪数据模型：先看"数据从哪来"（watch 哪些事件、如何区分 Immediate/Queued、环形缓冲区）。 |
| **8** | `src/engine/debug/panels/dispatcher_trace_debug_panel.h/.cpp` | 再看"数据怎么展示"（`name/draw` 的具体落地），体会"最小面板实现"的模式。 |
| **9** | `src/game/scene/game_scene.cpp` | Game 面板如何注册、何时注销，理解"场景生命周期与调试面板绑定"。 |
| **10** | `src/engine/input/input_manager.cpp` | **【必读】** ImGui capture 如何阻断游戏动作映射。注意 `KEY_UP` 放行和 `#ifdef TF_ENABLE_DEBUG_UI` 裁剪逻辑。 |
| **11** | `src/engine/render/opengl/imgui_layer.cpp` | ImGui 的 SDL/OpenGL 后端封装——`processEvent/newFrame/endFrame` 三步。 |
| **12** | `config/window.json` | 运行时开关 `graphics.debug_ui` 的位置。 |

## 6. 课后作业

**作业 1（推荐）：做一个最小 UI 调试面板**

- **目标**：增加一个 `UI` 调试面板，至少显示 hovered 元素、pressed 元素、当前 logical mouse 坐标。
- **验收标准**：
  - `F5 → Engine Debug Panels` 能看到新面板入口；
  - 在有 UI 与无 UI 的 Scene 中都不崩溃；
  - 不影响现有点击/拖拽交互行为。
- **提示线索**：
  - `src/engine/debug/debug_ui_manager.*`
  - `src/engine/debug/debug_panel.h`
  - `src/engine/ui/ui_manager.*`、`src/engine/ui/ui_element.*`
- **提交方式**：GitHub PR

**作业 2（可选）：做一个调试面板组合快捷开关（Profile）**

- **目标**：支持"一键打开一组面板"（例如 `Input + Scene + Dispatcher Trace`）。
- **验收标准**：
  - 至少支持 2 组 profile；
  - 切换 profile 后，Hub 勾选状态与实际窗口状态一致；
  - 关闭 Debug UI 后状态可正确重置或按你的策略明确保留。
- **提示线索**：
  - `src/engine/debug/debug_ui_manager.h/.cpp`
  - `src/engine/render/opengl/gl_renderer.cpp`（快捷键入口）
- **提交方式**：GitHub PR

---

## 小结

本节课围绕四个问题建立了 Debug UI 的完整心智模型：

- **热键链路**：`SDL 事件 → GLRenderer → DebugUIManager::toggleVisible`，快捷键按类别索引自动映射
- **面板分类与生命周期**：Engine 面板跟随应用，Game 面板跟随 `GameScene`，注册/注销各有归属
- **输入隔离**：`ImGuiIO::WantCaptureKeyboard/Mouse` 配合 `InputManager` 的阻断规则，保证调试窗口和游戏输入互不干扰
- **两层开关**：编译期 `ENABLE_DEBUG_UI` 控制"有没有"，运行时 `graphics.debug_ui` 控制"画不画"

下节课 （事件系统）将深入 `EnTT Dispatcher` 的使用方式与设计边界。你会继续用 `Dispatcher Trace` 面板做验证，但重点将转向"事件分发时机的选择"和"`trigger` vs `enqueue` 的适用场景"。
