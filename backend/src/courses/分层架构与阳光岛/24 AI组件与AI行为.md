# AI组件与AI行为

<div class="video-container">
  <div id="bilibili" class="video-content">
    <!-- B站嵌入：使用 https 明确协议（避免 file:// 或 http 导致被浏览器拦截） -->
    <iframe
      class="video-frame"
      src="https://player.bilibili.com/player.html?bvid=BV1jbhVzfERD&page=1&autoplay=0&danmaku=0&high_quality=1"
      width="100%"
      height="480"
      scrolling="no"
      frameborder="0"
      allowfullscreen>
    </iframe>
  </div>
</div>

[在 Bilibili 上观看](https://www.bilibili.com/video/BV1jbhVzfERD)

## 📌 问题背景

我们已经实现了玩家与敌人的交互系统，玩家可以踩踏敌人。但目前敌人只是静止的"活靶子"，毫无威胁性。一个优秀的平台游戏需要敌人能够移动、巡逻、甚至追击玩家。

### ⚠️ 当前的问题

```
静态的敌人：
┌─────────────────────────┐
│   🐸 青蛙 (静止)        │
│   🦅 老鹰 (静止)        │
│   🦘 负鼠 (静止)        │
│                          │
│ ❌ 无法移动              │
│ ❌ 无法巡逻              │
│ ❌ 缺少威胁性            │
│ ❌ 游戏体验单调          │
└─────────────────────────┘
```

| 问题 | 说明 | 影响 |
|------|------|------|
| **敌人静止** | 所有敌人都在原地不动 | 缺少动态挑战 |
| **行为单一** | 无法实现不同的敌人行为 | 游戏缺乏多样性 |
| **难以扩展** | 用 if-else 处理所有逻辑 | 代码难以维护 |
| **耦合严重** | 行为逻辑混杂在一起 | 无法灵活切换 |

### 💡 解决方案：策略模式的AI系统

**核心思想**：
游戏中的敌人行为千差万别：有的只会在地面巡逻，有的会在空中上下飞，有的则会跳来跳去。如果我们试图用一个巨大的 `EnemyComponent` 加上复杂的 if-else 或 switch 来处理所有逻辑，代码很快会变得难以维护和扩展。

这时，**策略设计模式** 就派上了用场：

1. **定义一系列算法（策略）**：将每种AI行为（巡逻、飞行、跳跃）分别封装在独立的类中
2. **使它们可以互换**：让这些算法类实现一个共同的接口
3. **客户端与算法分离**：AI的持有者只依赖于接口，而不知道具体使用的是哪个算法

```
策略模式架构：
┌──────────────────┐
│   GameObject     │
│   (敌人对象)      │
└────────┬─────────┘
         │ 拥有
         ↓
┌──────────────────┐
│   AIComponent    │ ← 上下文 Context
│   (AI管理器)      │   持有策略接口
└────────┬─────────┘
         │ 持有
         ↓
┌──────────────────┐
│   AIBehavior     │ ← 策略接口 Strategy
│   (抽象基类)      │
└────────┬─────────┘
         │ 实现
    ┌────┴────┬─────────┐
    ↓         ↓         ↓
┌────────┐┌────────┐┌────────┐
│ Patrol ││ UpDown ││  Jump  │ ← 具体策略
│巡逻行为││飞行行为││跳跃行为│   Concrete Strategies
└────────┘└────────┘└────────┘
```

<img src="https://theorhythm.top/gamedev/SL/SL.074.webp" alt="AI组件类图关系" style="display: block; margin: auto; width: 700px;" />

### 🎯 本课目标

| 目标 | 说明 |
|------|------|
| **学习策略设计模式** | 理解策略模式的核心思想并应用于AI系统 |
| **构建AI组件框架** | 创建 AIComponent 和 AIBehavior 基类 |
| **实现多种AI行为** | 巡逻、飞行、跳跃三种行为策略 |
| **动态装配AI** | 在场景中为敌人配置不同的AI行为 |

---

## 第一部分：架构设计与核心框架

### 💡 设计对比

```
传统方式 (❌ 不推荐)：
┌──────────────────────┐
│  EnemyComponent      │
├──────────────────────┤
│  update() {          │
│    if (type == 青蛙) │
│      跳跃逻辑...      │
│    else if (老鹰)    │
│      飞行逻辑...      │
│    else if (负鼠)    │
│      巡逻逻辑...      │
│  }                   │
└──────────────────────┘
问题：
❌ 代码膨胀：所有逻辑混在一起
❌ 难以维护：修改一个影响全部
❌ 扩展困难：添加新行为需改旧代码
❌ 职责不清：一个类承担多种职责

策略模式 (✅ 推荐)：
┌──────────────────────┐
│  AIComponent         │
├──────────────────────┤
│  behavior->update()  │ ← 委托给策略
└──────────────────────┘
优势：
✅ 解耦：每个行为独立封装
✅ 灵活：运行时可切换行为
✅ 易扩展：添加新行为无需改旧代码
✅ 清晰：职责分明，易于理解
```

### 架构三要素

| 组件 | 角色 | 职责 | 说明 |
|------|------|------|------|
| **AIComponent** | 上下文 Context | 持有并调用策略对象 | 不包含具体逻辑 |
| **AIBehavior** | 策略接口 Strategy | 定义行为的抽象接口 | 纯虚基类 |
| **具体行为类** | 具体策略 Concrete Strategy | 实现具体的AI逻辑 | PatrolBehavior等 |

### 运行时灵活性

```
策略模式的优势：
┌─────────────────────┐
│   同一个敌人对象     │
├─────────────────────┤
│ 开始：巡逻行为      │
│ setBehavior(Patrol) │
│    ↓                │
│ 受伤：逃跑行为      │
│ setBehavior(Flee)   │
│    ↓                │
│ 发现玩家：追击行为   │
│ setBehavior(Chase)  │
└─────────────────────┘

无需修改对象本身，
只需切换策略！
```

---

## 1. 行为接口：AIBehavior

我们首先来创建 `AIBehavior` 抽象基类，它是所有具体AI行为的接口。

### src/game/component/ai/ai_behavior.h（新建文件）

```cpp
#pragma once

namespace game::component { 
    class AIComponent; 
}

namespace game::component::ai {

/**
 * @brief AI 行为策略的抽象基类。
 */
class AIBehavior {
    friend class game::component::AIComponent;
public:
    AIBehavior() = default;
    virtual ~AIBehavior() = default;
    //... (禁止移动和拷贝) ...

protected:
    // --- 没有保存owner指针，因此需要传入 AIComponent 引用 ---
    virtual void enter(AIComponent&) {}             ///< @brief enter函数可选是否实现，默认为空
    virtual void update(float, AIComponent&) = 0;   ///< @brief 更新 AI 行为逻辑(具体策略)，必须实现
};

} // namespace game::component::ai
```

### 接口设计要点

| 方法 | 类型 | 职责 | 说明 |
|------|------|------|------|
| **enter()** | 虚函数 | 行为初始化 | 可选实现，行为切换时调用 |
| **update()** | 纯虚函数 | 行为逻辑 | 必须实现，每帧调用 |

### enter 方法的用途

```
enter() 的典型用途：
┌──────────────────────┐
│ 飞行行为 enter():    │
│  - 关闭重力          │
│  - 播放飞行动画      │
├──────────────────────┤
│ 巡逻行为 enter():    │
│  - 开启重力          │
│  - 播放走路动画      │
├──────────────────────┤
│ 攻击行为 enter():    │
│  - 播放攻击音效      │
│  - 设置攻击计时器    │
└──────────────────────┘

一次性初始化，
行为切换时执行
```

### 💡 设计细节

**为什么不保存 owner 指针？**

```cpp
// 方案A：保存owner（不推荐）
class AIBehavior {
    AIComponent* owner_;  // ❌ 增加耦合
    virtual void update(float) = 0;
};

// 方案B：传入引用（推荐）✓
class AIBehavior {
    virtual void update(float, AIComponent&) = 0;  // ✅ 灵活性高
};
```

**优势**：
- ✅ 降低耦合：行为不持有组件指针
- ✅ 灵活性高：同一个行为实例可用于多个组件
- ✅ 生命周期清晰：无需管理指针有效性

---

## 2. AI大脑：AIComponent

`AIComponent` 是AI系统的核心管理者，它持有一个 `AIBehavior` 策略对象，并在每帧将工作委托给它。

### src/game/component/ai_component.h（新建文件）

```cpp
#pragma once
#include "../../engine/component/component.h"
#include "ai/ai_behavior.h"
#include <memory>

//... (前置声明) ...

namespace game::component {

/**
 * @brief 负责管理 GameObject 的 AI 行为。
 */
class AIComponent final : public engine::component::Component {
    friend class engine::object::GameObject;
private:
    std::unique_ptr<ai::AIBehavior> current_behavior_ = nullptr; ///< @brief 当前 AI 行为策略

    // --- 缓存组件指针 ---
    engine::component::TransformComponent* transform_component_ = nullptr;
    engine::component::PhysicsComponent* physics_component_ = nullptr;
    engine::component::SpriteComponent* sprite_component_ = nullptr;
    engine::component::AnimationComponent* animation_component_ = nullptr;

public:
    //...
    void setBehavior(std::unique_ptr<ai::AIBehavior> behavior);
    
    // --- Getters for behaviors ---
    engine::component::PhysicsComponent* getPhysicsComponent() const { return physics_component_; }
    // ... 其他 Getters ...

private:
    void init() override;
    void update(float delta_time, engine::core::Context&) override;
};

} // namespace game::component
```

### AIComponent 的职责

```
AIComponent 的三大职责：
┌──────────────────────┐
│ 1. 持有策略          │
│    current_behavior_ │
├──────────────────────┤
│ 2. 缓存组件          │
│    transform_        │
│    physics_          │
│    sprite_           │
│    animation_        │
├──────────────────────┤
│ 3. 委托执行          │
│    behavior->update()│
└──────────────────────┘
```

| 职责 | 说明 | 优势 |
|------|------|------|
| **策略持有者** | 通过 `unique_ptr` 管理行为对象 | 自动内存管理 |
| **组件缓存** | 缓存常用组件指针 | 避免重复查找 |
| **工作委托** | 将 update 委托给策略 | 解耦逻辑 |

### src/game/component/ai_component.cpp（实现）

```cpp
void AIComponent::init() {
    // 缓存组件指针
    transform_component_ = getOwner()->getComponent<TransformComponent>();
    physics_component_ = getOwner()->getComponent<PhysicsComponent>();
    sprite_component_ = getOwner()->getComponent<SpriteComponent>();
    animation_component_ = getOwner()->getComponent<AnimationComponent>();
}

void AIComponent::setBehavior(std::unique_ptr<ai::AIBehavior> behavior) {
    current_behavior_ = std::move(behavior);
    if (current_behavior_) {
        current_behavior_->enter(*this);  // 调用新行为的enter方法
    }
}

void AIComponent::update(float delta_time, engine::core::Context&) {
    if (current_behavior_) {
        current_behavior_->update(delta_time, *this);  // 委托给策略
    }
}
```

### 组件缓存机制

```
为什么缓存组件指针？
┌──────────────────────┐
│ 不缓存（❌）：       │
│ update() {           │
│   auto* pc =         │
│     getComponent();  │ ← 每帧查找
│   // 使用 pc...      │
│ }                    │
└──────────────────────┘
性能开销大

┌──────────────────────┐
│ 缓存（✅）：         │
│ init() {             │
│   pc_ =              │
│     getComponent();  │ ← 只查找一次
│ }                    │
│ update() {           │
│   // 直接使用 pc_    │
│ }                    │
└──────────────────────┘
性能优化
```

### setBehavior 工作流程

```
setBehavior 流程：
    ↓
1. 移动语义接管所有权
    current_behavior_ = std::move(behavior)
    ↓
2. 检查行为是否有效
    if (current_behavior_)
    ↓
3. 调用新行为的 enter 方法
    current_behavior_->enter(*this)
    ↓
4. 完成行为切换
    ↓
下一帧 update 将调用新行为的逻辑
```

---

## 第二部分：实现具体AI行为

现在我们来创建三个具体的行为策略，分别对应三种不同的敌人类型。

---

## 3. 左右巡逻：PatrolBehavior

这个行为会让敌人（如负鼠）在一个指定的水平范围内来回移动。

### src/game/component/ai/patrol_behavior.h（新建文件）

```cpp
namespace game::component::ai {

class PatrolBehavior final : public AIBehavior {
private:
    float patrol_min_x_;  ///< @brief 巡逻范围最小X
    float patrol_max_x_;  ///< @brief 巡逻范围最大X
    float move_speed_;    ///< @brief 移动速度
    bool moving_right_ = true;  ///< @brief 是否向右移动

public:
    PatrolBehavior(float min_x, float max_x, float speed = 80.0f);
    
protected:
    void enter(AIComponent& ai_component) override;
    void update(float delta_time, AIComponent& ai_component) override;
};

} // namespace game::component::ai
```

### src/game/component/ai/patrol_behavior.cpp（新建文件）

```cpp
// ... (includes) ...
namespace game::component::ai {

PatrolBehavior::PatrolBehavior(float min_x, float max_x, float speed)
    : patrol_min_x_(min_x), patrol_max_x_(max_x), move_speed_(speed)
{ //... (参数校验) ... }

void PatrolBehavior::enter(AIComponent& ai_component) {
    // 播放 'walk' 动画
    if (auto* ac = ai_component.getAnimationComponent()) {
        ac->playAnimation("walk");
    }
}

void PatrolBehavior::update(float, AIComponent& ai_component) {
    auto* pc = ai_component.getPhysicsComponent();
    auto* tc = ai_component.getTransformComponent();
    auto* sc = ai_component.getSpriteComponent();
    // ... (检查组件是否存在) ...

    auto current_x = tc->getPosition().x;

    // 撞右墙或到达右边界则转向左
    if (pc->hasCollidedRight() || current_x >= patrol_max_x_) {
        pc->velocity_.x = -move_speed_;
        moving_right_ = false;
    // 撞左墙或到达左边界则转向右
    } else if (pc->hasCollidedLeft() || current_x <= patrol_min_x_) {
        pc->velocity_.x = move_speed_;
        moving_right_ = true;
    }

    // 更新精灵翻转(向右移动时翻转)
    sc->setFlipped(moving_right_);
}

}
```

### 巡逻行为逻辑

```
PatrolBehavior 工作原理：
┌─────────────────────┐
│  patrol_min_x       │  patrol_max_x
│      ↓              │      ↓
│      ├──────────────┤
│      │   🦘 →      │  向右移动
│      ├──────────────┤
│      │      ← 🦘   │  到达边界，转向
│      ├──────────────┤
│      │   🦘 →      │  继续循环
│      └──────────────┘
```

### 转向判断

| 条件 | 动作 | 说明 |
|------|------|------|
| **hasCollidedRight()** | 向左转 | 撞到右侧墙壁 |
| **current_x >= max_x** | 向左转 | 到达右边界 |
| **hasCollidedLeft()** | 向右转 | 撞到左侧墙壁 |
| **current_x <= min_x** | 向右转 | 到达左边界 |

### 可视化效果

```
巡逻场景：
┌─────────────────────────┐
│ 场景1：向右移动          │
│  🦘 → velocity.x = 80   │
│  flip = true            │
├─────────────────────────┤
│ 场景2：撞墙              │
│  🦘 → 🧱               │
│  检测到碰撞             │
├─────────────────────────┤
│ 场景3：转向              │
│  ← 🦘 velocity.x = -80 │
│  flip = false           │
└─────────────────────────┘
```

---

## 4. 上下飞行：UpDownBehavior

用于老鹰这类飞行敌人，在垂直方向上来回移动。

### src/game/component/ai/updown_behavior.h（新建文件）

```cpp
namespace game::component::ai {

class UpDownBehavior final : public AIBehavior {
private:
    float patrol_min_y_;  ///< @brief 飞行范围最小Y
    float patrol_max_y_;  ///< @brief 飞行范围最大Y
    float move_speed_;    ///< @brief 移动速度

public:
    UpDownBehavior(float min_y, float max_y, float speed = 60.0f);
    
protected:
    void enter(AIComponent& ai_component) override;
    void update(float delta_time, AIComponent& ai_component) override;
};

} // namespace game::component::ai
```

### src/game/component/ai/updown_behavior.cpp（新建文件）

```cpp
// ...
void UpDownBehavior::enter(AIComponent& ai_component) {
    if (auto* ac = ai_component.getAnimationComponent()) {
        ac->playAnimation("fly");
    }
    // 关键：禁用重力
    if (auto* pc = ai_component.getPhysicsComponent()) {
        pc->setUseGravity(false);
    }
}

void UpDownBehavior::update(float, AIComponent& ai_component) {
    auto* pc = ai_component.getPhysicsComponent();
    auto* tc = ai_component.getTransformComponent();
    // ...
    auto current_y = tc->getPosition().y;

    // 到达上边界或碰到上方障碍，向下移动
    if (pc->hasCollidedAbove() || current_y <= patrol_min_y_) {
        pc->velocity_.y = move_speed_;
    } 
    // 到达下边界或碰到下方障碍，向上移动
    else if (pc->hasCollidedBelow() || current_y >= patrol_max_y_) {
        pc->velocity_.y = -move_speed_;
    }
}
```

### 飞行行为特点

```
UpDownBehavior 工作原理：
        patrol_min_y
            ↓
        ┌───────┐
        │  🦅   │  向上飞
        ├───────┤
        │   ↑   │
        │   │   │
        │   ↓   │
        ├───────┤
        │  🦅   │  到达边界
        └───────┘
            ↑
        patrol_max_y
```

### 💡 核心机制：禁用重力

```cpp
pc->setUseGravity(false);  // 关键！
```

**为什么重要？**

| 重力状态 | 效果 | 说明 |
|---------|------|------|
| **开启重力** | 向下加速 | 无法实现悬浮飞行 |
| **关闭重力** | 完全控制速度 | 可以自由飞行 |

```
重力对比：
┌─────────────────────┐
│ 开启重力（❌）：     │
│  🦅                 │
│   ↓ gravity         │
│   ↓↓ 加速下落       │
│   ↓↓↓ 无法飞行      │
└─────────────────────┘

┌─────────────────────┐
│ 关闭重力（✅）：     │
│  🦅 ↑ 可以向上       │
│  🦅 ↓ 可以向下       │
│  🦅 ─ 完全控制       │
└─────────────────────┘
```

### 与巡逻行为的对比

| 特性 | PatrolBehavior | UpDownBehavior |
|------|---------------|----------------|
| **移动轴** | X轴（水平） | Y轴（垂直） |
| **重力** | 开启 | 关闭 |
| **边界检测** | Left/Right | Above/Below |
| **精灵翻转** | 需要 | 不需要 |

---

## 5. 周期跳跃：JumpBehavior

这是最复杂的行为，用于青蛙。它模拟了"在地面等待 - 跳跃 - 落地 - 等待..."的循环。

### src/game/component/ai/jump_behavior.h（新建文件）

```cpp
namespace game::component::ai {

class JumpBehavior final : public AIBehavior {
private:
    float patrol_min_x_;      ///< @brief 巡逻范围最小X
    float patrol_max_x_;      ///< @brief 巡逻范围最大X
    glm::vec2 jump_vel_;      ///< @brief 跳跃速度（x, y）
    float jump_interval_;     ///< @brief 跳跃间隔时间
    
    float jump_timer_ = 0.0f;       ///< @brief 跳跃计时器
    bool jumping_right_ = false;    ///< @brief 是否向右跳

public:
    JumpBehavior(float min_x, float max_x, 
                 glm::vec2 jump_vel = {120.0f, -300.0f}, 
                 float interval = 2.0f);
    
protected:
    void enter(AIComponent& ai_component) override;
    void update(float delta_time, AIComponent& ai_component) override;
};

} // namespace game::component::ai
```

### src/game/component/ai/jump_behavior.cpp（新建文件）

```cpp
// ...
void JumpBehavior::update(float delta_time, AIComponent& ai_component) {
    auto* pc = ai_component.getPhysicsComponent();
    // ... (获取其他组件) ...
    
    auto is_on_ground = pc->hasCollidedBelow();
    if (is_on_ground) { // 如果在地面上
        jump_timer_ += delta_time; // 累加等待计时器
        pc->velocity_.x = 0.0f; // 停止水平滑动

        if (jump_timer_ >= jump_interval_) { // 等待时间到，准备跳跃
            jump_timer_ = 0.0f; // 重置计时器
            
            // 检查是否需要转向
            auto current_x = ai_component.getTransformComponent()->getPosition().x;
            if (jumping_right_ && (pc->hasCollidedRight() || current_x >= patrol_max_x_)) {
                jumping_right_ = false;
            } else if (!jumping_right_ && (pc->hasCollidedLeft() || current_x <= patrol_min_x_)) {
                jumping_right_ = true;
            }
            
            // 设置跳跃速度并发起跳跃
            auto jump_vel_x = jumping_right_ ? jump_vel_.x : -jump_vel_.x;
            pc->velocity_= {jump_vel_x, jump_vel_.y};
            ai_component.getAnimationComponent()->playAnimation("jump");
        } else { // 还在地面等待
            ai_component.getAnimationComponent()->playAnimation("idle");
        }
    } else { // 在空中
        // 根据垂直速度判断是上升(jump)还是下落(fall)来播放动画
        if (pc->getVelocity().y < 0) {
            ai_component.getAnimationComponent()->playAnimation("jump");
        } else {
            ai_component.getAnimationComponent()->playAnimation("fall");
        }
    }
}
```

### 跳跃行为状态机

```
JumpBehavior 状态机：
┌─────────────────────┐
│   在地面？          │
│  hasCollidedBelow() │
└──────┬──────────────┘
       │
   ┌───┴───┐
   │       │
  是       否
   │       │
   ↓       ↓
┌──────┐┌──────┐
│地面态││空中态│
└──────┘└──────┘
```

### 地面状态逻辑

```
地面状态流程：
    ↓
1. 累加计时器
    jump_timer_ += delta_time
    ↓
2. 停止水平移动
    velocity.x = 0.0f
    ↓
3. 检查是否跳跃
    if (jump_timer_ >= jump_interval_)
    ↓
4. 是：重置计时器
    jump_timer_ = 0.0f
    ↓
5. 检查是否需要转向
    if (撞墙 || 到达边界)
    ↓
6. 设置跳跃速度
    velocity = {jump_vel_x, jump_vel_y}
    ↓
7. 播放跳跃动画
    playAnimation("jump")
    ↓
否：播放待机动画
    playAnimation("idle")
```

### 空中状态逻辑

```
空中状态流程：
    ↓
检查垂直速度
    ↓
┌───────────┬───────────┐
│           │           │
↓           ↓           ↓
velocity.y < 0  velocity.y > 0
上升        下落
↓           ↓
jump动画    fall动画
```

### 跳跃参数说明

| 参数 | 默认值 | 说明 |
|------|--------|------|
| **jump_vel.x** | 120.0 | 水平跳跃速度 |
| **jump_vel.y** | -300.0 | 垂直跳跃速度（负值=向上） |
| **jump_interval** | 2.0s | 跳跃间隔时间 |

### 可视化跳跃循环

```
完整跳跃循环：
    时间0s        1s        2s        3s        4s
    ↓             ↓         ↓         ↓         ↓
┌────────┐  ┌────────┐          ┌────────┐  ┌────────┐
│  🐸    │  │  🐸    │   🐸    │  🐸    │  │  🐸    │
│ idle   │  │ idle   │  jump   │  fall  │  │ idle   │
└────────┘  └────────┘          └────────┘  └────────┘
在地面等待    继续等待   发起跳跃   下落着地   重新等待
```

### 💡 复杂度对比

| 行为 | 复杂度 | 原因 |
|------|--------|------|
| **PatrolBehavior** | ⭐ 简单 | 只需边界检测和转向 |
| **UpDownBehavior** | ⭐⭐ 中等 | 需要关闭重力 |
| **JumpBehavior** | ⭐⭐⭐ 复杂 | 内置状态机 + 计时器 + 方向判断 |

---

## 第三部分：在场景中装配AI

现在我们万事俱备，只差最后一步：在 `GameScene` 中为从地图加载的敌人装上我们写好的AI大脑和行为。

---

## 6. 动态装配AI系统

我们在 `GameScene` 的 `initEnemyAndItem` 函数中为每个敌人添加 `AIComponent` 并配置相应的行为。

### src/game/scene/game_scene.cpp（更新）

```cpp
// ... (添加AI相关头文件) ...

bool GameScene::initEnemyAndItem()
{
    bool success = true;
    for (auto& game_object : game_objects_){
        if (game_object->getName() == "eagle"){
            if (auto* ai_component = game_object->addComponent<game::component::AIComponent>(); ai_component){
                auto y_max = game_object->getComponent<engine::component::TransformComponent>()->getPosition().y;
                auto y_min = y_max - 80.0f;  // 让鹰的飞行范围 (当前位置与上方80像素 的区域)
                ai_component->setBehavior(std::make_unique<game::component::ai::UpDownBehavior>(y_min, y_max));
            }
        }
        if (game_object->getName() == "frog"){
            if (auto* ai_component = game_object->addComponent<game::component::AIComponent>(); ai_component){
                auto x_max = game_object->getComponent<engine::component::TransformComponent>()->getPosition().x - 10.0f;
                auto x_min = x_max - 90.0f;
                ai_component->setBehavior(std::make_unique<game::component::ai::JumpBehavior>(x_min, x_max));
            }
        }
        if (game_object->getName() == "opossum"){
            if (auto* ai_component = game_object->addComponent<game::component::AIComponent>(); ai_component){
                auto x_max = game_object->getComponent<engine::component::TransformComponent>()->getPosition().x;
                auto x_min = x_max - 200.0f;
                ai_component->setBehavior(std::make_unique<game::component::ai::PatrolBehavior>(x_min, x_max));
            }
        }
        if (game_object->getTag() == "item"){
            // ... (道具的逻辑不变) ...
        }
    }
    return success;
}
```

### 装配流程

```
AI装配流程：
    ↓
1. 遍历所有游戏对象
    for (auto& game_object : game_objects_)
    ↓
2. 根据名称识别敌人类型
    if (name == "eagle") / "frog" / "opossum"
    ↓
3. 添加 AIComponent
    addComponent<AIComponent>()
    ↓
4. 获取初始位置
    getPosition()
    ↓
5. 计算活动范围
    min, max
    ↓
6. 创建对应的行为策略
    make_unique<Behavior>(min, max)
    ↓
7. 注入到 AIComponent
    setBehavior(behavior)
    ↓
敌人开始执行AI行为
```

### 敌人配置表

| 敌人 | 名称 | 行为类型 | 活动范围 | 说明 |
|------|------|---------|---------|------|
| 🦅 | "eagle" | UpDownBehavior | 当前位置上方80像素 | 垂直飞行 |
| 🐸 | "frog" | JumpBehavior | 当前位置左侧90像素 | 跳跃移动 |
| 🦘 | "opossum" | PatrolBehavior | 当前位置左侧200像素 | 水平巡逻 |

### 范围计算策略

```
老鹰（垂直飞行）：
    初始位置 y = 200
    ↓
    y_max = 200
    y_min = 200 - 80 = 120
    ↓
    飞行范围：[120, 200]
    
青蛙（跳跃）：
    初始位置 x = 500
    ↓
    x_max = 500 - 10 = 490
    x_min = 490 - 90 = 400
    ↓
    跳跃范围：[400, 490]
    
负鼠（巡逻）：
    初始位置 x = 600
    ↓
    x_max = 600
    x_min = 600 - 200 = 400
    ↓
    巡逻范围：[400, 600]
```

### 💡 设计灵活性

```
策略模式的优势体现：
┌──────────────────────┐
│ 添加新敌人非常简单：  │
├──────────────────────┤
│ 1. 在地图中放置敌人   │
│ 2. 在代码中添加配置： │
│                       │
│ if (name == "新敌人") │
│   addComponent<AI>()  │
│   setBehavior(...)    │
│                       │
│ 无需修改任何现有代码！ │
└──────────────────────┘
```

---

## ✅ 编译与运行

编译并运行游戏，你会看到一个全新的、充满生机的世界：

```
运行效果：
┌─────────────────────────┐
│  老鹰（🦅）：            │
│  ↑ 向上飞               │
│  ↓ 向下飞               │
│  循环往复               │
├─────────────────────────┤
│  青蛙（🐸）：            │
│  等待 → 跳跃 → 落地     │
│  循环跳跃               │
├─────────────────────────┤
│  负鼠（🦘）：            │
│  ← → 左右巡逻           │
│  碰壁转向               │
└─────────────────────────┘
```

**你会看到：**
- ✅ 负鼠在平台上往复巡逻，碰到边界自动转向
- ✅ 老鹰在空中上下盘旋，不受重力影响
- ✅ 青蛙在地面上伺机跳跃，有节奏感
- ✅ 每个敌人都有独特的动画表现
- ✅ 所有行为都是动态的、流畅的
- ✅ 敌人现在成为了真正的威胁！

---

## 🎯 系统架构总结

### 完整的AI系统架构

```
AI系统层次结构：
┌──────────────────────────┐
│      GameScene           │ ← 场景层
│   (装配AI行为)            │   配置策略
└────────┬─────────────────┘
         │
         ↓
┌──────────────────────────┐
│      GameObject          │ ← 对象层
│   (持有AI组件)            │   拥有组件
└────────┬─────────────────┘
         │
         ↓
┌──────────────────────────┐
│      AIComponent         │ ← 组件层
│   (管理AI行为)            │   持有策略
└────────┬─────────────────┘
         │
         ↓
┌──────────────────────────┐
│      AIBehavior          │ ← 策略接口层
│   (抽象行为接口)          │   定义契约
└────────┬─────────────────┘
         │
    ┌────┴────┬─────────┐
    ↓         ↓         ↓
┌────────┐┌────────┐┌────────┐
│ Patrol ││ UpDown ││  Jump  │ ← 具体策略层
│        ││        ││        │   实现逻辑
└────────┘└────────┘└────────┘
```

### 核心成就

我们成功地：

1. ✅ **学习了策略设计模式**：理解了其核心思想和优势
2. ✅ **构建了AI组件框架**：AIComponent + AIBehavior
3. ✅ **实现了三种AI行为**：巡逻、飞行、跳跃
4. ✅ **实现了动态装配**：运行时配置敌人AI
5. ✅ **实现了行为解耦**：每个行为独立封装
6. ✅ **提高了可扩展性**：添加新行为无需改旧代码

### 策略模式的优势

```
策略模式 vs 传统方式：
┌─────────────────────┐
│ 传统方式（❌）       │
├─────────────────────┤
│ • 代码膨胀          │
│ • 难以维护          │
│ • 扩展困难          │
│ • 职责不清          │
└─────────────────────┘

┌─────────────────────┐
│ 策略模式（✅）       │
├─────────────────────┤
│ • 高度解耦          │
│ • 易于维护          │
│ • 灵活扩展          │
│ • 职责清晰          │
└─────────────────────┘
```

### AI行为对比表

| 行为 | 移动方式 | 重力 | 计时器 | 状态机 | 复杂度 |
|------|---------|------|--------|--------|--------|
| **PatrolBehavior** | 水平往复 | ✅ | ❌ | ❌ | ⭐ |
| **UpDownBehavior** | 垂直往复 | ❌ | ❌ | ❌ | ⭐⭐ |
| **JumpBehavior** | 跳跃移动 | ✅ | ✅ | ✅ | ⭐⭐⭐ |

### 可扩展性示例

```
添加新行为的步骤：
┌──────────────────────┐
│ 1. 创建新的行为类：   │
│    class ChasePlayer  │
│      : public AIBehavior
├──────────────────────┤
│ 2. 实现update方法：   │
│    void update(...)   │
│    { 追踪玩家逻辑 }   │
├──────────────────────┤
│ 3. 在场景中装配：     │
│    setBehavior(       │
│      make_unique<     │
│        ChasePlayer>() │
│    )                  │
└──────────────────────┘

完全不需要修改：
• AIComponent
• 其他行为类
• GameObject
```

### 职责划分

```
清晰的职责分工：
┌──────────────────┐
│ GameScene        │ ← 策略配置者
│ "为谁配什么行为"  │   装配职责
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│ AIComponent      │ ← 策略管理者
│ "持有并调用策略"  │   委托职责
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│ AIBehavior       │ ← 策略执行者
│ "实现具体逻辑"    │   实现职责
└──────────────────┘
```

---

## 📚 总结

太棒了！通过本课的学习，我们让敌人"活"了起来，游戏世界变得生动而充满挑战。

**关键要点：**
- 🎨 策略设计模式：算法封装与解耦
- 🧠 AIComponent：策略的持有者和调用者
- 📐 AIBehavior：策略的抽象接口
- 🚶 PatrolBehavior：水平巡逻行为
- 🦅 UpDownBehavior：垂直飞行行为（关闭重力）
- 🐸 JumpBehavior：跳跃行为（内置状态机）
- 🔧 动态装配：运行时配置敌人AI

> 💡 **设计哲学**：策略模式是处理"多种可替换算法"的最佳实践。我们的AI系统现在高度解耦、易于扩展。想添加一种新的敌人？只需编写一个新的 `AIBehavior` 子类，然后在 `GameScene` 中为其装配即可，无需改动任何现有AI代码。这正是优秀软件架构的魅力所在——开放扩展，关闭修改（开闭原则）。

---

## 🚀 下一步展望

现在敌人已经动起来了，但游戏体验还可以进一步优化：

- ❓ 如何实现攀爬梯子的功能？
- ❓ 如何让玩家在平台边缘有"宽恕时间"？
- ❓ 如何实现受伤后的无敌闪烁效果？

下一课，我们将实现 **攀爬状态切换**：

- 🪜 梯子检测与攀爬
- ⏱️ 土狼时间（Coyote Time）
- ✨ 无敌闪烁效果
- 🎮 更细腻的操作手感

让游戏体验更上一层楼！🎮🌟