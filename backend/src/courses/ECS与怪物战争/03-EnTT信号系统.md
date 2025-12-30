# 03 EnTT信号系统

<div class="video-container">
  <div id="bilibili" class="video-content">
    <!-- B站嵌入：使用 https 明确协议（避免 file:// 或 http 导致被浏览器拦截） -->
    <iframe
      class="video-frame"
      src="https://player.bilibili.com/player.html?bvid=BV1SaWzzTE8f&page=1&autoplay=0&danmaku=0&high_quality=1"
      width="100%"
      height="480"
      scrolling="no"
      frameborder="0"
      allowfullscreen>
    </iframe>
  </div>
</div>

[在 Bilibili 上观看](https://www.bilibili.com/video/BV1SaWzzTE8f)

## 📖 概述

从第 02 节开始，我们已经能用 EnTT 的 `registry + entity + component + view` 跑通 ECS 的最小闭环。

但只靠 “view 遍历 + 直接调用函数” 还不够。随着系统变多，你会很快遇到一个现实问题：**模块之间的交互会越来越复杂**。

举个常见场景：

- 敌人死亡了
- 分数系统要加分
- 掉落系统要生成道具
- UI 系统要刷新面板
- 音效系统要播放音效

如果这些逻辑全都写在“击杀敌人”的那段代码里，你会得到一个**高度耦合**的“上帝函数”。这节课我们引入 **EnTT 的信号/事件机制**，用“发布事件 → 多处订阅响应”的方式，把这些后续逻辑拆开。

本节对应代码状态：`03-EnTT信号系统`，核心示例仍然集中在 `src/main.cpp`。

<img src="https://theorhythm.top/gamedev/MW/怪物战争.023.webp" style='width: 800px;' />

> PPT 第 23 页：`entt::dispatcher` 是“事件中心”，按事件类型管理信号，并支持事件队列

## 🎯 学习目标

- 知道 EnTT 信号系统的三块积木：`entt::delegate` / `entt::sigh + entt::sink` / `entt::dispatcher`
- 理解 `dispatcher` 的工作方式：**连接监听器 → 发布事件（enqueue/trigger）→ update 统一处理**
- 学会用 `registry.ctx()` 存放“非组件”的全局数据（本节示例：分数 `game_state`）
- 了解事件对象应该携带哪些信息，避免“实体销毁后取不到数据”的坑

## 🧠 思路与设计

### 1) 从“直接调用”走向“发布-订阅”

事件驱动的核心思想是：**发生了什么（事件）** 与 **要做什么（响应）** 解耦。

在游戏里，一个系统经常只负责“产生事件”，但不关心“谁会处理它”。例如：

- 战斗系统只负责发布 `enemy_destroyed_event`
- 分数系统监听它并加分
- 掉落系统监听它并生成掉落

这样做的收益是：后续你加一个新系统（比如成就系统），通常只是“再连一个监听器”，不需要回去改战斗系统。

### 2) delegate / sigh / dispatcher：三层工具的关系

- `entt::delegate`：单播回调（只绑定一个函数），可以理解为轻量级的 `std::function` 替代品
- `entt::sigh`：多播信号（一个信号绑定多个回调）
- `entt::sink`：信号的“入口”，提供安全的 `connect/disconnect` 接口（一般通过 sink 来连回调）

<img src="https://theorhythm.top/gamedev/MW/怪物战争.022.webp" style='width: 800px;' />

> PPT 第 22 页：`sigh` 保存回调列表并发布事件；`sink` 提供连接/断开监听器的安全接口

`entt::dispatcher` 则可以理解为“更上层的事件中心”：它按事件类型管理一组 `sigh`，并额外提供 **事件队列**，让你能把事件在主循环中“集中入队、统一出队处理”。

## 🔧 实现步骤

### 1) 用 `registry.ctx()` 存放“非组件”的全局状态

这节课我们用最简单的例子：分数。分数不是某个实体的组件，而是全局状态，更适合放在 `registry.ctx()` 里：

<img src="https://theorhythm.top/gamedev/MW/怪物战争.018.webp" style='width: 800px;' />

> PPT 第 18 页：`registry.ctx()` 用来存放“非 component”的数据（如分数、时间、重要实体引用等）

对应代码：

```cpp
struct game_state {
    int score = 0;
};

// 初始化上下文变量
registry.ctx().emplace<game_state>();
```

之后任何拿到 `registry` 的系统，都可以通过 `registry.ctx().get<game_state>()` 取到并修改它。

### 2) 定义事件类型：事件就是一个“数据结构”

在 EnTT 的 `dispatcher` 里，事件类型通常是一个结构体。结构体里放“监听者处理事件所需的信息”：

```cpp
struct enemy_destroyed_event {
    entt::entity enemy_entity;
    // 可以在此添加更多信息，比如敌人类型、掉落物品等
};
```

注意这里的注释非常关键：**如果你在发布事件前就把实体销毁了，那么监听器里就不一定还能通过 registry 拿到该实体的组件数据**。

因此，事件里应该携带“处理所需的最小信息”（例如敌人类型、奖励值、掉落表 key……），而不是只塞一个 entity 句柄。

### 3) 编写监听器：既可以是类成员函数，也可以是普通函数

本节演示两种监听器写法：

1) 用类组织逻辑（更像真实项目中的系统）：

```cpp
class ScoreSystem {
    entt::registry& registry;   // 需要 registry 的引用，以便获取上下文
public:
    ScoreSystem(entt::registry& reg) : registry(reg) {}

    void on_enemy_destroyed(const enemy_destroyed_event& event) {
        auto& state = registry.ctx().get<game_state>();
        state.score += 10;

        spdlog::info("杀死敌人 {}，分数增加！当前分数: {}", entt::to_integral(event.enemy_entity), state.score);
            /* entt::entity 的底层是 entt::id_type，即 uint32_t，但不可直接当成整数用（保证类型安全），
                                                    可以用 entt::to_integral 显式转换为 uint32_t */
    }
};
```

2) 直接用函数监听（适合快速验证/临时逻辑）：

```cpp
void dummy_listener(const enemy_destroyed_event& event) {
    spdlog::info("DummyListener 收到事件：敌人 {} 被摧毁！", entt::to_integral(event.enemy_entity));
}
```

> 小提示：`entt::entity` 是强类型句柄，打印时建议用 `entt::to_integral(...)` 显式转换。

### 4) 创建 `dispatcher` 并连接监听器

`dispatcher.sink<Event>()` 会返回该事件类型对应的 `sink`，通过它连接监听器：

```cpp
entt::dispatcher dispatcher{};
ScoreSystem score_system(registry);

dispatcher.sink<enemy_destroyed_event>()
    .connect<&ScoreSystem::on_enemy_destroyed>(score_system);

dispatcher.sink<enemy_destroyed_event>()
    .connect<&dummy_listener>();
```

这段代码表达的是：

- `enemy_destroyed_event` 发生时，调用 `ScoreSystem::on_enemy_destroyed`
- 同一个事件可以连接多个监听器（代码里也提示了：**后进先调**，顺序会影响结果时要留意）

### 5) 发布事件：`enqueue` 入队，`update` 统一处理

演示流程是：

1) 创建一个敌人实体
2) “战斗发生”后摧毁敌人
3) 发布事件
4) `update()` 触发监听器

```cpp
entt::entity enemy_to_destroy = registry.create();
registry.emplace<tag>(enemy_to_destroy, "enemy"_hs, "enemy");

spdlog::info("初始分数: {}", registry.ctx().get<game_state>().score);

// ... 战斗发生 ...
registry.destroy(enemy_to_destroy);

dispatcher.enqueue(enemy_destroyed_event{enemy_to_destroy});
dispatcher.update();
```

这里有两个常用选择：

- `enqueue + update`：事件先入队，等到你选定的“主循环某一阶段”再统一处理（更适合游戏循环）
- `trigger`：立即触发（即时响应，简单但更容易造成“中途触发导致状态不一致”）

本节先用 `enqueue + update` 建立更稳的习惯：**事件的处理点要固定，避免到处插入“即时回调”**。

## 🧩 关键代码（只贴关键片段）

- 事件类型：`enemy_destroyed_event`
- 上下文变量：`game_state` + `registry.ctx()`
- 事件中心：`entt::dispatcher`
- 连接监听器：`dispatcher.sink<Event>().connect<...>()`
- 发布与处理：`dispatcher.enqueue(...)` + `dispatcher.update()`

以上代码均来自 `src/main.cpp`（tag：`03-EnTT信号系统`）。

## ✅ 本节小结

- EnTT 的信号/事件体系可以把“发生什么”与“怎么响应”拆开，降低系统耦合
- `entt::dispatcher` 是更上层的事件中心：按事件类型管理回调，并支持事件队列
- `registry.ctx()` 很适合存放全局共享状态（分数/时间/服务对象等），避免到处传参或写单例

## 🔍 自检清单

- [ ] 能解释 `delegate / sigh+sink / dispatcher` 三者的定位
- [ ] 能写出一个事件结构体，并用 `dispatcher.sink<Event>().connect(...)` 连接监听器
- [ ] 能说清 `enqueue + update` 与 `trigger` 的差异
- [ ] 知道为什么“实体销毁后再发事件”时，事件里可能需要携带更多信息

## ➡️ 下一节预告

下一节进入 **ImGui 基础**：我们会把 UI 的集成流程跑通（初始化/事件处理/生成绘图数据/渲染/清理），并为后面做“调试面板”打基础。