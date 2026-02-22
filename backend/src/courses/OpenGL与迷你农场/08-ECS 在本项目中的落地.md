# ECS 应用：Registry、Component、System、Tag

上节课我们建立了《迷你农场》的 Scene 栈心智模型：**Update 只更新栈顶、Render 叠加渲染整栈**。

那节课里还有一句"顺手提到但很关键"的工程事实：**每个 Scene 都有自己的一份 `entt::registry`**。
这意味着：切换/叠加 Scene，本质上就是在切换/叠加不同的"ECS 世界"（实体与组件集合）。

现在，我们要正式展开这句话。

> - 你在 TitleScene 时，实体只有零星几个（UI 按钮、背景）；进入 GameScene 后，实体暴增到几百个（玩家、NPC、作物、瓦片……）。这两个 Scene 的数据凭什么互不干扰？
> - 游戏世界里那么多系统——移动、动画、光照、物品——它们的更新顺序可以随便排吗？调换两行代码会出什么问题？
> - 有些数据（比如游戏时间）好多系统都要读，但它又不属于任何一个实体。你会把它放在哪里？
>
> 这些问题的答案，都藏在 《迷你农场》 的 **ECS 落地方案**中。

## 本课目标

学完本节后，你将能做到：

1. **用一句话描述 《迷你农场》 的 ECS 边界**：一个 Scene 一个 registry——并理解 Scene 切换/叠加时状态如何隔离，以及什么该放在全局 `Context`、什么该放在 `registry`。
2. **区分并定位 Component/Tag 的分层**：`engine::component::*`（通用能力）vs `game::component::*`（玩法语义），以及 Tag 在查询过滤、dirty 标记、生命周期控制中的四种常见用法。
3. **理解 System 的运作方式与更新顺序**：view 查询组件组合、按固定顺序更新；系统间通过 `dispatcher` 交互，通过 `registry.ctx()` 共享"资源型数据"。

---

## 1. 核心心智模型：一个 Scene 一个 registry

### 1.1 Scene 拥有 registry：场景级状态隔离

《迷你农场》 的边界非常明确。打开 `src/engine/scene/scene.h`：

```cpp
class Scene {
protected:
    engine::core::Context& context_;  // 引擎上下文（全局服务入口）
    entt::registry registry_;         // ECS 注册表——场景内状态
    // ...
};
```

**每个 Scene 实例持有独立的 `registry_`**。GameScene 的实体（玩家、NPC、作物）与 TitleScene 的实体（按钮、背景）存在于完全不同的 registry 中——它们互不可见、互不干扰。

你可以把它理解成：
> **Scene 是"世界容器"，registry 是"世界数据"。**

### 1.2 clean() 重置一切

当 Scene 被 Pop 或 Replace 时，`clean()` 负责清理：

```cpp
// src/engine/scene/scene.cpp
void Scene::clean() {
    if (!is_initialized_) return;
    context_.getSpatialIndexManager().resetIfUsingRegistry(&registry_);
    registry_ = entt::registry{};  // 重建 registry，确保实体/组件与 ctx 一并重置
    is_initialized_ = false;
}
```

注意这里用的是**赋值一个全新的 `entt::registry{}`**，而不是 `registry_.clear()`。区别在于：
- `clear()` 只清除实体和组件，**不清除 `registry.ctx()` 中的数据**
- 赋值新 registry 则会**销毁旧 registry 的一切**——包括实体、组件和 ctx 中的数据

《迷你农场》 选择了后者，确保场景切换时不会残留任何状态。

### 1.3 亲手验证

你可以亲手验证这条边界：打开 Engine Debug Panels（`F5`），勾选 `Scene` 面板。在 TitleScene 时观察实体数量，然后点击 Start 进入 GameScene，你会看到实体数量发生巨大变化——因为你切换到了一份全新的 registry。

<img src="https://theorhythm.top/gamedev/TF/L06_scene_stack_registry.webp" style='width: 960px;' />

---

## 2. Context vs registry：服务与状态分离

理解 《迷你农场》 架构最省力的一组对照是：

| | `engine::core::Context` | `entt::registry` |
| :--- | :--- | :--- |
| **角色** | 全局服务容器 | 场景状态容器 |
| **生命周期** | 整个应用程序 | 随 Scene 切换而重建 |
| **内容** | dispatcher、renderer、camera、audio、input… | 实体、组件、ctx 中的场景数据 |
| **跨场景** | 复用 | 隔离 |

打开 `src/engine/core/context.h`，你会看到 Context 持有的全是**引用**：

```cpp
class Context final {
private:
    entt::dispatcher& dispatcher_;
    engine::input::InputManager& input_manager_;
    engine::render::Renderer& renderer_;
    engine::render::Camera& camera_;
    engine::audio::AudioPlayer& audio_player_;
    engine::resource::ResourceManager& resource_manager_;
    // ...
};
```

这些模块在 `GameApp` 初始化时创建，整个应用生命周期内共享。Scene 通过 `context_` 引用它们——不同的 Scene 用同一个 renderer、同一个 audio player、同一个 dispatcher。

这能直接回答一个常见问题：
**"为什么 renderer 不放在 registry 里？"** ——因为 renderer 是服务，不是某个场景的状态。切换 Scene 时你不需要"换一个 renderer"，你需要的是换一批实体和组件。

> **判断口诀**：
> - "这个东西是跨场景复用的服务吗？" → 放 `Context`
> - "这个东西是当前场景的状态吗？" → 放 `registry`（实体/组件或 `registry.ctx()`）

---

## 3. `registry.ctx()`：场景级共享数据入口

### 3.1 问题：不属于任何实体的场景数据放哪里？

有些数据属于"这个 Scene 的世界"，但不适合挂在某个实体上：
- **游戏时间**（`game::data::GameTime`）：时间系统、昼夜系统、作物系统都要读
- **世界结构指针**（`game::world::WorldState*`）：地图切换、实体构建、交互系统都要读
- **全局光照参数**（`engine::render::GlobalLightingState`）：一个系统写、多个系统读

《迷你农场》 用 `registry.ctx()` 作为"按类型索引"的小容器，把这些数据放在 registry 上——它们不属于任何实体，但属于当前场景。

<img src="https://theorhythm.top/gamedev/TF/L06_ctx_data_flow.webp" style='width: 960px;' />

### 3.2 初始化：GameScene 往 ctx 里放什么？

打开 `src/game/scene/game_scene.cpp` 的 `initRegistryContext()` 方法：

```cpp
bool GameScene::initRegistryContext() {
    // 从配置文件加载游戏时间（如果未传入）
    if (!game_time_) {
        game_time_ = game::data::GameTime::loadFromConfig("assets/data/game_time_config.json");
        if (!game_time_) {
            spdlog::error("从配置文件加载 GameTime 失败");
            return false;
        }
    }
    // 将 GameTime 放入注册表上下文
    registry_.ctx().emplace<game::data::GameTime>(*game_time_);
    return true;
}
```

以及 `initWorldState()` 中：

```cpp
registry_.ctx().emplace<game::world::WorldState*>(world_state_.get());
```

`emplace<T>()` 以类型为键，存储一份值。后续任何持有 registry 引用的系统都能通过 `registry.ctx().find<T>()` 取到它。

### 3.3 数据流链路：GameTime → DayNightSystem → LightSystem → Renderer

这条链路是 `registry.ctx()` 最精彩的示范。让我们逐步追踪：

**第一步：DayNightSystem 读取 GameTime，写入 GlobalLightingState**

```cpp
// src/game/system/day_night_system.cpp
void DayNightSystem::update() {
    auto* game_time_it = registry_.ctx().find<game::data::GameTime>();
    if (!game_time_it) return;

    float hour_with_minutes = game_time_it->hour_ + game_time_it->minute_ / 60.0f;
    updateLightingParams(hour_with_minutes);

    auto* state_ptr = registry_.ctx().find<engine::render::GlobalLightingState>();
    if (!state_ptr) {
        state_ptr = &registry_.ctx().emplace<engine::render::GlobalLightingState>();
    }
    auto& state = *state_ptr;
    state.ambient = is_world_map ? ambient_ : indoor_ambient;
    // ...写入太阳、月亮参数...
}
```

**第二步：LightSystem 读取 GlobalLightingState，提交给 Renderer**

```cpp
// src/engine/system/light_system.cpp
void LightSystem::update(entt::registry& registry, engine::render::Renderer& renderer) {
    if (const auto* lighting = registry.ctx().find<engine::render::GlobalLightingState>(); lighting) {
        renderer.setAmbient(lighting->ambient);
        for (const auto& directional : lighting->directional_lights
                                       | std::views::values
                                       | std::views::filter([](const auto& d) { return d.enabled; })) {
            renderer.addDirectionalLight(directional.direction, &directional.options);
        }
    } else {
        renderer.setAmbient({1.0f, 1.0f, 1.0f});
    }
    // ...收集点光/聚光/自发光组件...
}
```

**第三步：Renderer 用这些参数渲染画面**——画面随之变亮或变暗。

### 3.4 亲手验证

打开 Game Debug Panels（`F6`），勾选 `Game Time` 面板，手动把时间拨到夜晚（如 22:00）或白天（如 12:00），观察画面光照变化。

背后发生的事情就是上面那条链路：调试面板直接修改了 `registry.ctx()` 中的 `GameTime` → DayNightSystem 重新计算光照参数写入 `GlobalLightingState` → LightSystem 把参数提交给 Renderer → 画面变化。

这就是 `registry.ctx()` 的价值：**多个系统通过 ctx 共享数据，不需要全局变量，也不需要系统之间互相持有引用**。

---

## 4. Component 分层 + Tag 四种用法

### 4.1 引擎组件 vs 游戏组件

《迷你农场》 把组件按"通用能力 / 玩法语义"分成两层：

| 层 | 路径 | 例子 | 关注点 |
| :--- | :--- | :--- | :--- |
| **引擎层** | `src/engine/component/*` | Transform、Sprite、Velocity、Animation、Collider、Light… | 通用能力：位置、外观、运动、碰撞——与具体玩法无关 |
| **游戏层** | `src/game/component/*` | Actor、Inventory、Hotbar、Crop、Chest、NPC… | 玩法语义：角色、物品栏、作物、对话——与《迷你农场》的玩法紧密相关 |

**同一个实体会"混搭"两层组件**。比如"玩家"这个实体：
- 引擎层：`TransformComponent`（位置）+ `SpriteComponent`（外观）+ `VelocityComponent`（速度）+ `AnimationComponent`（动画）+ `ColliderComponent`（碰撞）
- 游戏层：`ActorComponent`（角色属性）+ `StateComponent`（动作/朝向状态）+ `InventoryComponent`（物品栏）+ `HotbarComponent`（快捷栏）+ `PlayerTag`（身份标记）

<img src="https://theorhythm.top/gamedev/TF/L06_component_layering.webp" style='width: 960px;' />

这种分层的好处是：引擎层的 System（如 MovementSystem）只依赖引擎层组件，可以在不同游戏中复用；游戏层的 System（如 FarmSystem）读取两层组件，但只有游戏层才知道"种地"是什么意思。

### 4.2 Tag：没有数据但有意义

Tag 是一种**没有数据成员的空结构体**，但它表达了重要的语义。《迷你农场》 大量使用 Tag，按用途可以分为四类：

| Tag 用法 | 例子 | 解决什么问题 |
| :--- | :--- | :--- |
| **marker**（身份标记） | `PlayerTag` | 快速找到"某类实体"（`registry.view<PlayerTag>()`） |
| **dirty**（增量触发） | `TransformDirtyTag`、`StateDirtyTag` | 避免每帧全量重算——只处理"有变化"的实体 |
| **filter**（过滤） | `InvisibleTag`、`LightDisabledTag` | 让渲染/光照系统忽略某些实体（`entt::exclude<InvisibleTag>`） |
| **lifecycle**（统一删除） | `NeedRemoveTag` | 避免"遍地 destroy"与时序问题——标记后统一在帧末销毁 |

打开两份 Tag 定义文件感受一下分层：

```cpp
// src/engine/component/tags.h（引擎层 Tag）
struct InvisibleTag {};       // 渲染系统跳过
struct LightDisabledTag {};   // 光照系统跳过
struct NeedRemoveTag {};      // 帧末统一销毁
struct TransformDirtyTag {};  // 位置变化标记
struct SpatialIndexTag {};    // 需要参与空间索引
struct AutoTileDirtyTag {};   // 自动图块需重算
```

```cpp
// src/game/component/tags.h（游戏层 Tag）
struct PlayerTag {};       // 玩家身份
struct StateDirtyTag {};   // 状态变化，需重新计算动画
struct ActionLockedTag {}; // 动作锁定（播完当前动画再做下一步）
struct NightOnlyTag {};    // 仅夜晚发光
struct DayOnlyTag {};      // 仅白天发光
```

---

## 5. System：view 查询 + 顺序更新

### 5.1 System 的基本范式

System 的核心逻辑通常就三步：
1. 从 registry 创建 **view**（指定组件组合 + 排除条件）
2. 遍历实体：**读取**组件、**写回**组件/Tag
3. 必要时通过 **dispatcher** 发事件，解耦跨系统协作（参见 [事件系统](06-事件系统.md)）

来看一个典型的引擎层 System——`MovementSystem`：

```cpp
// src/engine/system/movement_system.cpp
void MovementSystem::update(entt::registry& registry, float delta_time) {
    // 1. 创建 view：只关心同时拥有 Velocity 和 Transform 的实体
    auto view = registry.view<VelocityComponent, TransformComponent>();

    // 2. 遍历实体
    for (auto entity : view) {
        const auto& velocity = view.get<VelocityComponent>(entity);
        auto& transform = view.get<TransformComponent>(entity);

        glm::vec2 current_pos = transform.position_;
        glm::vec2 target_pos = current_pos + velocity.velocity_ * delta_time;

        // ...碰撞检测逻辑（省略）...
        transform.position_ = target_pos;

        // 3. 如果位置变了，打 dirty Tag
        if (位置确实发生了变化) {
            registry.emplace_or_replace<TransformDirtyTag>(entity);
        }
    }
}
```

注意最后一行——`TransformDirtyTag` 的作用是**通知后续系统**（如 SpatialIndexSystem）"这个实体的位置变了，需要更新空间索引"。这就是 Tag 作为"dirty 标记"的典型用法。

你可以打开 Game Debug Panels（`F6`），勾选 `Player` 面板来亲手体验"系统读取组件数据驱动行为"：调整玩家速度（修改 `VelocityComponent` 的数据），或切换手持工具（触发事件请求）——你会看到角色行为随数据而变。这也直观地演示了 System 如何围绕组件数据运作。

### 5.2 另一个范式："Tag + 事件"组合

`StateSystem` 展示了更复杂的系统范式——同时使用 Tag 和 dispatcher：

```cpp
// src/game/system/state_system.cpp
void StateSystem::update() {
    // 查询：同时有 StateComponent 和 StateDirtyTag，但排除待删除的实体
    auto view = registry_.view<StateComponent, StateDirtyTag>(entt::exclude<NeedRemoveTag>);

    // 先收集到 vector（两阶段模式，稍后详解）
    std::vector<entt::entity> dirty_entities;
    std::ranges::copy(view, std::back_inserter(dirty_entities));

    for (auto entity : dirty_entities) {
        const auto& state = registry_.get<StateComponent>(entity);
        auto animation_id = resolveAnimationId(state.action_, state.direction_, ...);
        // 通过事件通知 AnimationSystem 播放动画
        dispatcher_.enqueue(PlayAnimationEvent{entity, animation_id, loop});
        // 处理完毕，清除 dirty 标记
        registry_.remove<StateDirtyTag>(entity);
    }
}
```

这里有两个值得注意的模式：
- **`StateDirtyTag` 触发处理**：只有被标记为"状态已变"的实体才会被处理——避免每帧对所有实体做无谓的计算
- **`enqueue` 而非 `trigger`**：动画播放事件被放入队列，在本帧末尾批量分发（回忆 [事件系统](06-事件系统.md) 的区分）

### 5.3 顺序就是隐式依赖

在 《迷你农场》 中，系统顺序写在 Scene 的 `update()` 里。打开 `GameScene::update()`：

```cpp
// src/game/scene/game_scene.cpp
void GameScene::update(float delta_time) {
    // 1. 先清理——避免已标记删除的实体继续参与本帧逻辑
    remove_entity_system_->update(registry_);

    // 2. 时间/光照——让后续系统读到最新时间
    time_system_->update(delta_time);
    day_night_system_->update();

    // 3. 输入/AI/玩法
    player_control_system_->update(delta_time);
    npc_wander_system_->update(delta_time);
    // ...（省略多个系统）...
    state_system_->update();

    // 4. 移动——结算位置变化
    movement_system_->update(registry_, delta_time);

    // 5. 空间索引/交互/相机——依赖最新位置
    spatial_index_system_->update(registry_);
    pickup_system_->update(delta_time);
    interaction_system_->update();
    camera_follow_system_->update(delta_time);

    // 6. 动画
    animation_system_->update(delta_time);

    // 7. UI 最后更新——展示本帧已结算的结果
    Scene::update(delta_time);
}
```

顺序之所以重要，是因为它**隐含了依赖**：
- 时间/光照在最前面 → 后续系统读到"最新时间"
- 移动先结算 → 再更新空间索引（否则用的是"上一帧的位置"）
- 相机跟随在移动之后 → 确保追踪的是移动后的玩家位置
- UI 最后更新 → 展示的是本帧已经结算后的世界状态

如果你把 `movement_system_` 和 `spatial_index_system_` 的顺序对调，会发生什么？空间索引会用"上一帧的位置"去构建数据结构，而本帧移动后的位置只能等到下一帧才被索引——玩家可能会"穿墙"一帧。

---

## 6. 架构总览：三层合奏与实体来源

把前面的核心概念放在一起，《迷你农场》 的 ECS 可以看成"三层合奏"：

<img src="https://theorhythm.top/gamedev/TF/L06_three_layer_architecture.webp" style='width: 960px;' />

每一帧的运行逻辑是：
1. **Systems 按固定顺序 update**：从 registry 的 view 中查询组件组合，读写数据、打 Tag、发事件
2. **Systems 通过 Context 调用服务**：提交渲染数据给 Renderer、读取输入状态、播放音效等
3. **dispatcher 分发事件**：解耦系统间的协作（参见 [事件系统](06-事件系统.md)）

实体的来源有两条主线：
- **EntityFactory**：运行时按玩法语义创建实体（玩家/动物/作物/掉落物），组件组合由蓝图数据驱动
- **EntityBuilder / LevelLoader**：从 Tiled 关卡数据构建实体，把地图中的对象/瓦片映射成组件组合

---

## 7. 常见错误

### 7.1 遍历 view 时做结构性修改

ECS 里非常常见的坑是：
> **遍历一个 view 的同时，对该 view 相关的 storage 做 destroy/remove 等结构性修改。**

这可能导致迭代器失效或跳过/重复处理实体。更稳定的写法是**"两阶段"**：
1. 先收集需要处理的实体 id
2. 再统一 destroy/remove

<img src="https://theorhythm.top/gamedev/TF/L06_two_phase_pattern.webp" style='width: 960px;' />

《迷你农场》 中的两个典型示范：

**RemoveEntitySystem**（统一删除）：
```cpp
// src/engine/system/remove_entity_system.cpp
void RemoveEntitySystem::update(entt::registry& registry) {
    auto view = registry.view<NeedRemoveTag>();
    // 第一阶段：收集
    const std::vector<entt::entity> to_destroy(view.begin(), view.end());
    // 第二阶段：统一销毁
    registry.destroy(to_destroy.begin(), to_destroy.end());
}
```

**StateSystem**（清除 dirty tag）——前面已经看过：先 `copy` 到 vector，再逐个 `remove<StateDirtyTag>`。

### 7.2 在 view 查询中忘记 exclude

如果你不排除 `NeedRemoveTag`，系统可能会处理一个"即将被删除"的实体，读到不完整或无效的数据。好习惯是在涉及实体状态变更的 view 中加上 `entt::exclude<NeedRemoveTag>`。

### 7.3 把场景状态放进 Context

新手容易把所有东西都往 Context 里塞。记住判断标准：
- **跨场景复用的服务** → Context
- **场景级状态**（GameTime、WorldState、光照参数……） → `registry.ctx()`

如果 GameTime 放在 Context 里，切换 Scene 时它不会自动重置——上一局游戏的时间会"泄漏"到新场景。

### 7.4 忽略系统更新顺序

改动或新增系统时，一定要问自己：**这个系统依赖哪些数据？那些数据由谁在前面写入？** 如果你的系统需要读取最新的空间索引，就不能排在 `SpatialIndexSystem` 之前。

---

## 8. 阅读清单

建议按以下顺序阅读代码，建立直观印象：

| 顺序 | 文件 | 关注点 |
| :--- | :--- | :--- |
| **1** | `src/engine/scene/scene.h/.cpp` | 确认"registry 的所有权边界"在 Scene 上，以及 `clean()` 重建 registry 的方式 |
| **2** | `src/game/scene/game_scene.cpp` | **【核心】** 完整的落地案例：ctx 初始化（`initRegistryContext`）、系统创建（`initSystems`）、update/render 调度顺序 |
| **3** | `src/engine/core/context.h` | 对比 Scene/registry——Context 负责"全局服务"，registry 负责"场景状态" |
| **4** | `src/engine/component/*` + `src/game/component/*` + 两份 `tags.h` | 建立组件分层与 Tag 习惯（dirty/marker/filter/lifecycle） |
| **5** | `src/engine/system/movement_system.*` | 典型 System 范式：view 查询组件组合 + dirty Tag 标记 |
| **6** | `src/engine/system/remove_entity_system.*` | 生命周期控制：用 `NeedRemoveTag` 统一销毁 + 两阶段模式 |
| **7** | `src/game/system/state_system.*` | "Tag + 事件"的组合：`StateDirtyTag` 触发动画更新 + `enqueue` 分发 |
| **8** | `src/game/system/day_night_system.*` → `src/engine/system/light_system.*` | 聚焦 `registry.ctx()`：一个系统写 `GlobalLightingState`，另一个系统读 |
| **9** | `src/game/factory/entity_factory.*` | （可选）理解"数据如何变成组件组合"：engine/game 组件的混搭 |

---

## 9. 课后作业

### 作业 1：做一个最小 ECS Inspector（调试面板）

> 目的：训练"从数据出发定位行为"的能力——先看到实体/组件，再去追系统/事件。

**目标**：增加一个调试面板，能够"列出实体 / 筛选 / 查看组件概览"。

**验收标准**（建议至少完成 3 项）：
- 显示当前 Scene 的实体数量，并能列出最近 N 个实体 id
- 支持至少一种过滤：按 Tag（如 `PlayerTag`）或按是否拥有某组件（如 `TransformComponent`）
- 选中一个实体后，展示它拥有的 3–5 个关键组件的摘要（例如 `Name/Transform/Sprite/State/Actor`）
- 选中实体失效（被删除）时能给出友好提示（不崩溃）

**提示线索**：
- `src/engine/debug/debug_ui_manager.h/.cpp`：面板注册入口
- `src/engine/debug/panels/scene_debug_panel.cpp`：面板组织方式参考
- `src/game/debug/player_debug_panel.cpp`：游戏层面板注册与 UI 控件参考

### 作业 2：把 `GameScene::update()` 里的系统顺序抽成"阶段表"

**目标**：把"系统顺序 = 隐式依赖"从散落的调用变成一份更可维护的结构（但避免过度抽象）。

**验收标准**（满足 2 项即可）：
- 以 `PreUpdate/Update/PostUpdate` 或类似阶段组织系统顺序（例如用数组/列表保存系统函数）
- 保持行为不变：顺序不乱、过渡冻结逻辑仍正确
- 用注释写清每个阶段的职责（例如：时间/输入/移动/空间索引/相机/UI）

**提示线索**：
- `src/game/scene/game_scene.cpp`（系统创建与更新顺序）

---

## 小结

你现在应该能用 4 句话描述 《迷你农场》 的 ECS：

1. **一个 Scene 一个 registry**：Scene 生命周期就是场景状态边界。
2. **Context 放服务、registry 放状态**：服务跨场景复用，状态随场景切换而重建。
3. **Component 分层 + Tag 表达语义**：engine 通用能力、game 玩法语义；Tag 用于 marker/dirty/filter/lifecycle。
4. **System 围绕 registry 运作**：view 查询组件组合，按顺序更新；系统间用 dispatcher 事件协作，用 `registry.ctx()` 共享场景级数据。

下节课（渲染最小闭环）我们会把 ECS 的"数据与系统"落到可见的渲染闭环：`Transform + Sprite + Render` 如何驱动 2D 渲染，并解释渲染系统在本项目里如何从 registry 取数并组织渲染顺序。
