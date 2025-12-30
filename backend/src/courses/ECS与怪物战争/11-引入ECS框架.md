# 11 引入ECS框架

<div class="video-container">
  <div id="bilibili" class="video-content">
    <!-- B站嵌入：使用 https 明确协议（避免 file:// 或 http 导致被浏览器拦截） -->
    <iframe
      class="video-frame"
      src="https://player.bilibili.com/player.html?bvid=BV1pK1pB2E9J&page=1&autoplay=0&danmaku=0&high_quality=1"
      width="100%"
      height="480"
      scrolling="no"
      frameborder="0"
      allowfullscreen>
    </iframe>
  </div>
</div>

[在 Bilibili 上观看](https://www.bilibili.com/video/BV1pK1pB2E9J)

## 📖 概述

前面几节我们把“输入信号 + 事件总线 + 场景切换 + 资源系统”都铺好了，但游戏本体（塔防）真正跑起来后，会出现一个非常现实的问题：

> 屏幕上的“单位/子弹/特效/瓦片”会越来越多，传统的 `GameObject + Component（面向对象）` 写法会越来越吃力。

这一节我们把游戏框架的核心数据组织方式，正式切换到 **ECS（Entity-Component-System）**：

- **Entity（实体）**：只是一个“唯一标识符”
- **Component（组件）**：纯粹的数据
- **System（系统）**：纯粹的逻辑（在拥有特定组件的实体集合上运行）
- **Registry**：管理实体与组件的容器（EnTT 的 `entt::registry`）

并且做出一个重要设计决策：**UI 依然保持“自组合 + 继承”的树形结构，不强行 ECS 化**，让 UI 模块与游戏 ECS 模块隔离。

![](../本期参考/PPT截图/怪物战争.052.png)

> PPT 第 52 页：框架结构：Scene 内部同时驱动 UI 与 ECS（两条链路隔离）

本节对应代码标签：`11-引入ECS框架`（基线：`10-引入哈希字符串`）。

## 🎯 学习目标

- 理解 ECS 的三要素与 `entt::registry` 的职责
- 在 `Scene` 中引入 `entt::registry`，把场景变成“ECS 世界容器”
- 把旧的“组件类（带 update/render）”改为“纯数据组件”
- 落地 3 个最小系统：移动、动画、渲染，并在 `GameScene` 中跑通闭环

## 🧠 思路：为什么要从 GameObject 转向 ECS

如果你还记得第 05 节我们总结过的痛点：组件之间互相引用、生命周期复杂、查询成本高……当实体数量上来后，这些问题会被放大。

ECS 的核心优势并不是“更优雅”，而是更适合**大量同类对象的批处理**：

- 组件是 POD/数据结构，存储更紧凑
- 系统用 `view<...>` 一次性拿到一组实体，循环里做同一类事情
- 系统逻辑从组件里抽离出来，组件之间更少互相依赖

![](../本期参考/PPT截图/怪物战争.053.png)

> PPT 第 53 页：registry 统一管理实体/组件索引，System 独立运行逻辑

## 🔧 实现步骤

### 1) Scene：引入 `entt::registry`，场景成为 ECS 世界

这一节最关键的结构变化发生在 `Scene`：

- 删除原来的 `game_objects_ / pending_additions_`（GameObject 容器与延迟添加机制）
- 新增 `entt::registry registry_`，用它来管理场景内的所有实体与组件

```cpp
// src/engine/scene/scene.h（节选）
class Scene {
protected:
    entt::registry registry_;
    // ...

public:
    entt::registry& getRegistry() { return registry_; }
};
```

`Scene::clean()` 也相应变得很干脆：直接 `registry_.clear()`，清空本场景所有实体与组件。

### 2) 组件：从“带行为的类”变成“纯数据 struct”

这节课把多个组件都改成了“纯数据”：

- `TransformComponent`：位置/缩放/旋转
- `VelocityComponent`：速度
- `SpriteComponent`：贴图信息 + 渲染尺寸/偏移
- `AnimationComponent`：动画帧数据 + 当前播放状态
- 以及 `ParallaxComponent / TileLayerComponent / AudioComponent` 等（后续关卡与玩法会逐渐用到）

例如 `TransformComponent`（节选）：

```cpp
// src/engine/component/transform_component.h（节选）
struct TransformComponent {
    glm::vec2 position_{};
    glm::vec2 scale_{1.0f};
    float rotation_{};
};
```

注意：组件不再提供 `update()` 之类的成员函数 —— **行为全部移到系统中**。

### 3) 系统：把逻辑集中到 `src/engine/system/`

本节新增 `src/engine/system/`，并落地了三个最小系统。

#### 3.1 MovementSystem：速度驱动位移

它关心两个组件：`VelocityComponent + TransformComponent`。

```cpp
// src/engine/system/movement_system.cpp（节选）
auto view = registry.view<engine::component::VelocityComponent, engine::component::TransformComponent>();
for (auto entity : view) {
    const auto& velocity = view.get<engine::component::VelocityComponent>(entity);
    auto& transform = view.get<engine::component::TransformComponent>(entity);

    transform.position_ += velocity.velocity_ * delta_time; // 更新位置
}
```

#### 3.2 RenderSystem：把组件数据喂给 Renderer

它关心两个组件：`TransformComponent + SpriteComponent`，并把它们组合成一次 draw call。

```cpp
// src/engine/system/render_system.cpp（节选）
auto view = registry.view<component::TransformComponent, component::SpriteComponent>();
for (auto entity : view) {
    const auto& transform = view.get<component::TransformComponent>(entity);
    const auto& sprite = view.get<component::SpriteComponent>(entity);
    auto position = transform.position_ + sprite.offset_;   // 位置 = 变换组件的位置 + 精灵的偏移
    auto size = sprite.size_ * transform.scale_;            // 大小 = 精灵的大小 * 变换组件的缩放
    renderer.drawSprite(camera, sprite.sprite_, position, size, transform.rotation_);
}
```

> 这里也能看出一个工程取舍：`Renderer::drawSprite(...)` 的参数从“传 scale”变成了“直接传 size”，系统负责把 `SpriteComponent.size_` 与 `TransformComponent.scale_` 组合好。

#### 3.3 AnimationSystem：推进动画帧，并回写到 SpriteComponent

它关心两个组件：`AnimationComponent + SpriteComponent`。

动画组件内部保存“动画表”（key 为动画名的哈希 ID），并记录当前帧、当前时间等播放状态；系统每帧推进计时器，并把当前帧的 `src_rect_` 写回精灵组件。

![](../本期参考/PPT截图/怪物战争.054.png)

> PPT 第 54 页：动画系统的关键：定时更新 `source_rect`，渲染就自然变成“动起来”

对应实现（节选）：

```cpp
// src/engine/system/animation_system.cpp（节选）
auto view = registry.view<engine::component::AnimationComponent, engine::component::SpriteComponent>();
for (auto entity : view) {
    auto& anim_component = view.get<engine::component::AnimationComponent>(entity);
    auto& sprite_component = view.get<engine::component::SpriteComponent>(entity);

    // 如果动画不存在，则跳过
    auto it = anim_component.animations_.find(anim_component.current_animation_id_);
    if (it == anim_component.animations_.end()) {
        continue;
    }

    // 获取当前动画
    auto& current_animation = it->second;
    // 如果没有帧，则跳过
    if (current_animation.frames_.empty()) {
        continue;
    }

    // 更新当前播放时间 (推进计时器)
    anim_component.current_time_ms_ += dt * 1000.0f * anim_component.speed_;

    // 获取当前帧
    const auto& current_frame = current_animation.frames_[anim_component.current_frame_index_];

    // 检查是否需要切换到下一帧
    if (anim_component.current_time_ms_ >= current_frame.duration_ms_) {
        anim_component.current_time_ms_ -= current_frame.duration_ms_;
        anim_component.current_frame_index_++;

        // 处理动画播放完成
        if (anim_component.current_frame_index_ >= current_animation.frames_.size()) {
            if (current_animation.loop_) {
                anim_component.current_frame_index_ = 0;
            } else {
                // 动画播放完毕且不循环，停在最后一帧
                anim_component.current_frame_index_ = current_animation.frames_.size() - 1;
            }
        }
    }
    
    // 更新 SpriteComponent 的源矩形 （根据当前动画帧的源矩形信息）
    const auto& next_frame = current_animation.frames_[anim_component.current_frame_index_];
    sprite_component.sprite_.src_rect_ = next_frame.src_rect_;
}
```

### 4) GameScene：跑通 ECS 最小闭环（创建实体 → 系统更新 → 系统渲染）

`GameScene` 现在不再往场景里塞 `GameObject`，而是直接对 `registry_` 创建实体并添加组件：

```cpp
// src/game/scene/game_scene.cpp（节选）
auto entity = registry_.create();
registry_.emplace<engine::component::TransformComponent>(entity, glm::vec2(100, 100));
registry_.emplace<engine::component::VelocityComponent>(entity, glm::vec2(10, 10));
registry_.emplace<engine::component::SpriteComponent>(entity, 
    engine::component::Sprite("assets/textures/Units/Archer.png", engine::utils::Rect(0, 0, 192, 192)));
```

然后在 `update()` 里按顺序运行系统（先移动、再动画），在 `render()` 里运行渲染系统：

- `movement_system_->update(registry_, delta_time)`
- `animation_system_->update(registry_, delta_time)`
- `render_system_->update(registry_, context_.getRenderer(), context_.getCamera())`

最后仍然调用 `Scene::update/render` 让 UI 正常工作 —— 这就是“UI 与 ECS 隔离”的落地方式。

## 🧩 顺手整理：把 UI 的 Sprite 改名为 Image

上一节我们引入了资源哈希 ID 后，`Sprite` 这个名字在工程里开始“语义冲突”：

- 游戏世界里的 sprite：更像是 ECS 的 **渲染组件数据**
- UI 里的 sprite：其实只是“屏幕空间贴图”

所以这节把 UI 专用的 `engine::render::Sprite` 改名为 `engine::render::Image`，并把 `Renderer` 的 UI 接口同步改为 `drawUIImage(...)`。

这样就能更清晰地区分两条渲染链路：

- ECS：`component::SpriteComponent` → `RenderSystem` → `Renderer::drawSprite(...)`
- UI：`ui::UIImage`（内部持有 `render::Image`）→ `Renderer::drawUIImage(...)`

## ✅ 本节小结

- `Scene` 内引入 `entt::registry`，场景成为 ECS 世界容器；旧的 GameObject 容器被移除
- 组件改为纯数据，系统承担逻辑：移动/动画/渲染三个系统组成最小闭环
- `GameScene` 直接创建 entity 并 `emplace` 组件，用系统驱动运行与绘制
- UI 不强行 ECS 化：继续走 UI 树结构，但在 Scene 内与 ECS 并行更新/渲染

## 🔍 自检清单

- [ ] `GameScene::testECS()` 创建的实体能被渲染出来（说明 RenderSystem view 工作正常）
- [ ] 实体位置会随时间变化（说明 MovementSystem 正常更新 Transform）
- [ ] 精灵会切换帧（说明 AnimationSystem 正常回写 `src_rect_`）
- [ ] UI 仍然能渲染（说明 Scene 的 UI 链路未被 ECS 改造影响）

## ➡️ 下一节预告

下一节（第 12 节）开始进入“塔防数据驱动”的关键基础：关卡载入器。我们会把 Tiled 地图/瓦片信息转成 ECS 实体与组件，并把“地图”真正搬进游戏。