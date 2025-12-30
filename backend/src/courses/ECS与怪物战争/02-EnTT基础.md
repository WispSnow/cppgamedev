# 02 EnTT基础

<div class="video-container">
  <div id="bilibili" class="video-content">
    <!-- B站嵌入：使用 https 明确协议（避免 file:// 或 http 导致被浏览器拦截） -->
    <iframe
      class="video-frame"
      src="https://player.bilibili.com/player.html?bvid=BV1GD44z7Eyu&page=1&autoplay=0&danmaku=0&high_quality=1"
      width="100%"
      height="480"
      scrolling="no"
      frameborder="0"
      allowfullscreen>
    </iframe>
  </div>
</div>

[在 Bilibili 上观看](https://www.bilibili.com/video/BV1GD44z7Eyu)

## 📖 概述

从这一节开始，我们正式进入本期的核心：**ECS** 与 **事件驱动**。

但在真正把游戏逻辑迁移到 ECS 之前，先要把 EnTT 的“最小使用闭环”跑通：创建实体、挂载组件、用视图遍历实体集合，并理解一个贯穿后续课程的常用工具——**哈希字符串**。

![](../本期参考/PPT截图/怪物战争.015.png)

> PPT 第 15 页：`registry / entity / component` 的关系

本节对应代码状态：`02-EnTT基础`，核心示例集中在 `src/main.cpp`。

## 🎯 学习目标

- 理解 EnTT 的三件套：`entt::registry` / `entt::entity` / component
- 学会用 `entt::view` 遍历“符合组件条件”的实体集合（系统的雏形）
- 了解 `entt::hashed_string`（哈希字符串）的用途与一个常见坑
- （概念预告）知道 `registry.ctx()` 是干什么的，后续会用

## 🧠 思路与设计

### 1) 把“对象”拆成“数据 + 行为”

在 ECS 思维里：

- **实体（entity）**不是一个“带方法的对象”，更像是一个**ID/句柄**
- **组件（component）**是纯数据：位置、速度、血量、阵营……
- **系统（system）**负责“如何更新”：它会遍历一批拥有指定组件的实体，批量处理

这套设计的收益在后面会越来越明显：当你要新增玩法（比如“阻挡”“弹道”“技能”），往往是**新增组件 + 新增系统**，而不是在一堆类的继承链里打补丁。

### 2) 用 view 代替“手写对象列表”

你可以把 `entt::view` 理解成一种“高效的过滤器”：

- 我只关心“同时拥有 A、B（可选排除 C）组件”的实体
- view 会帮你组织出这批实体，并提供高效遍历方式

![](../本期参考/PPT截图/怪物战争.016.png)

> PPT 第 16 页：view 会检索并保存轻量引用，用于高效遍历

## 🔧 实现步骤

### 1) 定义组件（component）

组件通常是一个简单的 `struct`，只放数据：

```cpp
struct position {
    float x;
    float y;
};

struct velocity {
    float dx;
    float dy;
};
```

这就是 ECS 的第一条“强约束”：**组件不塞复杂逻辑**，只描述状态。

### 2) 创建 registry（世界）与 entity（实体）

`entt::registry` 是“世界/数据库”，用它来创建实体、增删组件、查询视图。

```cpp
entt::registry registry;

entt::entity player = registry.create();
registry.emplace<position>(player, 10.f, 20.f);
registry.emplace<velocity>(player, 1.f, 0.5f);
```

这里的 `emplace<T>` 可以理解成：“给这个实体添加一个 `T` 组件，并初始化它的数据”。

### 3) 用 view 遍历实体集合（系统的雏形）

当我们想找出“所有带 `tag` + `position` 的实体”，就可以建立一个 view：

```cpp
auto view = registry.view<const tag, const position>();

view.each([](const auto& entity_tag, const auto& pos) {
    if (entity_tag.id == "player"_hs) {
        spdlog::info("找到玩家，位置: ({}, {})", pos.x, pos.y);
    }
});
```

这段代码非常重要：后面真正的“游戏系统”（移动、动画、战斗结算……）都会沿用这个结构——**用 view 找到目标实体，然后批处理**。

### 4) 哈希字符串：更快的比较、更稳的“ID”

在游戏里，我们经常需要比较字符串：单位类型、事件名、状态名、技能名、资源 key……

如果每次都用 `std::string` 做比较，频率高时会比较浪费。EnTT 的 `entt::hashed_string` 提供了一种思路：把字符串映射成整数（哈希值），运行时主要比较整数。

![](../本期参考/PPT截图/怪物战争.017.png)

> PPT 第 17 页：`entt::hashed_string` 可以把字符串映射为整数用于快速比较

在 `src/main.cpp` 里，示例用 `_hs` 字面量来生成哈希值：

```cpp
using namespace entt::literals;
registry.emplace<tag>(player, "player"_hs, "player");
```

#### 一个容易踩的坑：`hashed_string` 不“拥有”原始字符串

代码里也写了一个明确的提醒（并给出更安全的做法）：

- 不推荐：在组件里只存 `entt::hashed_string`，因为它更像 `string_view`，不保证原始字符串生命周期
- 更稳：存两份信息：`id` 用于比较/查询，`value` 用于显示/调试

```cpp
struct tag {
    entt::id_type id;
    std::string value;
};
```

最后通过 `registry.get<tag>(player)` 拿到组件，就能同时打印哈希值与原始文本：

```cpp
auto player_tag = registry.get<tag>(player);
spdlog::info("玩家标签的哈希值: {}", player_tag.id);
spdlog::info("玩家标签的原始文本: {}", player_tag.value);
```

### 5) （概念预告）`registry.ctx()`：把“全局数据”放进 registry

EnTT 还提供 `registry.ctx()` 作为“上下文容器”，常见用途是存放一些全局/共享数据（例如时间、配置、事件派发器、服务对象等）。

本节先记住它的定位：**当你不想把某个全局对象做成单例，又希望系统之间能共享时，ctx 往往是一个更干净的选择**。后面引擎重构时会逐步用到。

## ✅ 本节小结

- `entt::registry` 管理实体与组件；`entt::entity` 只是 ID；component 是纯数据
- `entt::view` 是系统遍历实体集合的基础形态
- 哈希字符串适合当作“稳定的 ID”来比较与查找，但要注意原始字符串的生命周期问题

## 🔍 自检清单

- [ ] 能编译并运行 `02-EnTT基础` 对应代码（`src/main.cpp`）
- [ ] 能用 `registry.emplace<T>` 给实体挂组件
- [ ] 能用 `registry.view<A,B>` 遍历到想要的实体集合
- [ ] 理解“哈希用于比较、字符串用于展示”的两份信息策略

## ➡️ 下一节预告

下一节我们进入 **EnTT 信号系统**：看看如何用信号/事件把模块之间的耦合拆开，为后续“事件总线、场景切换、输入分发”打基础。
