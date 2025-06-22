# 玩家状态HUD

<link rel="stylesheet" href="/css/videoStyles.css" />

<div class="video-container">
  <div class="video-tabs">
    <a href="#bilibili" class="video-tab bilibili-tab">哔哩哔哩</a>
    <a href="#youtube" class="video-tab youtube-tab">YouTube</a>
  </div>

  <div id="youtube" class="video-content">
    <iframe 
      class="video-frame"
      src="https://www.youtube.com/embed/naJ9sh1wB1w?si=2EcHHYM5GRGXjVJ4" 
      frameborder="0" 
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
      allowfullscreen>
    </iframe>
  </div>
  
  <div id="bilibili" class="video-content">
    <iframe 
      class="video-frame"
      src="//player.bilibili.com/player.html?bvid=BV1LvZhYYE41&page=1&autoplay=0&danmaku=0&high_quality=1" 
      scrolling="no" 
      border="0" 
      frameborder="no" 
      framespacing="0" 
      allowfullscreen="true">
    </iframe>
  </div>
</div>

在游戏中，玩家需要随时了解自己的状态信息，如生命值、魔法值等关键数据。为了提供这些信息而不打断游戏体验，我们使用HUD（Heads-Up Display，平视显示器）将这些信息直观地呈现在屏幕上。在本课中，我们将设计并实现一个玩家状态HUD，用于显示玩家的生命值和魔法值。

<img src="https://theorhythm.top/gamedev/GE/22-玩家状态HUD.PNG" style='width: 800px;' />

## 一、HUD的设计需求

我们的玩家状态HUD需要满足以下几个基本需求：

1. **固定位置**：HUD应该固定在屏幕的特定位置，不随游戏世界的移动而变化
2. **实时更新**：能够实时反映玩家的生命值和魔法值变化
3. **直观美观**：使用图形化的方式，如生命条、图标等，使信息一目了然
4. **不干扰游戏**：占用屏幕空间小，不干扰玩家的游戏体验
5. **扩展性**：可以方便地添加新的状态信息显示

## 二、HUDStats类设计

首先，我们设计一个`HUDStats`类来实现玩家状态HUD。这个类继承自`ObjectScreen`，因为它需要固定在屏幕上，而不是游戏世界中：

```cpp
// hud_stats.h
#ifndef HUD_STATS_H
#define HUD_STATS_H

#include "../core/object_screen.h"

class Sprite;
class Actor;
class HUDStats : public ObjectScreen
{
protected:
    Actor* target_ = nullptr;
    Sprite* health_bar_ = nullptr;
    Sprite* health_bar_bg_ = nullptr;
    Sprite* health_icon_ = nullptr;
    Sprite* mana_bar_ = nullptr;
    Sprite* mana_bar_bg_ = nullptr;
    Sprite* mana_icon_ = nullptr;
    
    float health_percentage_ = 1.0f;
    float mana_percentage_ = 1.0f;

    // TODO: 更加细致设置大小、位置的变量

public:
    static HUDStats* addHUDStatsChild(Object* parent, Actor* target, glm::vec2 render_position);
    virtual void init() override;
    virtual void update(float dt) override;
    // setters and getters
    void setTarget(Actor* target) { target_ = target; }
    Actor* getTarget() const { return target_; }
    Sprite* getHealthBar() const { return health_bar_; }
    Sprite* getHealthBarBg() const { return health_bar_bg_; }
    Sprite* getHealthIcon() const { return health_icon_; }
    Sprite* getManaBar() const { return mana_bar_; }
    Sprite* getManaBarBg() const { return mana_bar_bg_; }
    Sprite* getManaIcon() const { return mana_icon_; }

    float getHealthPercentage() const { return health_percentage_; }
    float getManaPercentage() const { return mana_percentage_; }
    void setHealthPercentage(float percentage) { health_percentage_ = percentage; }
    void setManaPercentage(float percentage) { mana_percentage_ = percentage; }

private:
    void update_health_bar();
    void update_mana_bar();
};

#endif // HUD_STATS_H
```

`HUDStats`类包含以下关键属性：

- `target_`：HUD跟踪的目标角色（通常是玩家）
- `health_bar_`、`health_bar_bg_`、`health_icon_`：生命条相关的精灵组件
- `mana_bar_`、`mana_bar_bg_`、`mana_icon_`：魔法条相关的精灵组件
- `health_percentage_`、`mana_percentage_`：生命值和魔法值的百分比

此外，我们声明了几个关键方法：

- `addHUDStatsChild`：静态工厂方法，用于创建HUD实例
- `init`：初始化HUD组件
- `update`：更新HUD显示
- `update_health_bar`和`update_mana_bar`：更新生命条和魔法条的显示

## 三、HUDStats类实现

接下来，我们实现`HUDStats`类的具体功能：

```cpp
// hud_stats.cpp
#include "hud_stats.h"
#include "../core/actor.h"
#include "../raw/stats.h"
#include "../affiliate/sprite.h"

HUDStats* HUDStats::addHUDStatsChild(Object* parent, Actor* target, glm::vec2 render_position) {
    HUDStats* hud_stats = new HUDStats();
    hud_stats->init();
    hud_stats->setRenderPosition(render_position);
    hud_stats->setTarget(target);
    if (parent) parent->addChild(hud_stats);
    return hud_stats;
}

void HUDStats::init()
{
    ObjectScreen::init();
    health_bar_bg_ = Sprite::addSpriteChild(this, "assets/UI/bar_bg.png", 3.0f, Anchor::CENTER_LEFT);
    health_bar_bg_->setOffset(health_bar_bg_->getOffset() + glm::vec2(30, 0));
    health_bar_ = Sprite::addSpriteChild(this, "assets/UI/bar_red.png", 3.0f, Anchor::CENTER_LEFT);
    health_bar_->setOffset(health_bar_->getOffset() + glm::vec2(30, 0));
    health_icon_ = Sprite::addSpriteChild(this, "assets/UI/Red Potion.png", 0.5f, Anchor::CENTER_LEFT);

    mana_bar_bg_ = Sprite::addSpriteChild(this, "assets/UI/bar_bg.png", 3.0f, Anchor::CENTER_LEFT);
    mana_bar_bg_->setOffset(mana_bar_bg_->getOffset() + glm::vec2(300, 0));
    mana_bar_ = Sprite::addSpriteChild(this, "assets/UI/bar_blue.png", 3.0f, Anchor::CENTER_LEFT);
    mana_bar_->setOffset(mana_bar_->getOffset() + glm::vec2(300, 0));
    mana_icon_ = Sprite::addSpriteChild(this, "assets/UI/Blue Potion.png", 0.5f, Anchor::CENTER_LEFT);
    mana_icon_->setOffset(mana_icon_->getOffset() + glm::vec2(270, 0));
}

void HUDStats::update(float dt)
{
    ObjectScreen::update(dt);
    // 获取Actor血量百分比，然后设置对应sprite
    update_health_bar();
    update_mana_bar();
}

void HUDStats::update_health_bar()
{
    if (!target_ || !health_bar_ || !target_->getStats()) return;
    health_bar_->setPercentage(glm::vec2(target_->getStats()->getHealth() / target_->getStats()->getMaxHealth(), 1.0f));
}

void HUDStats::update_mana_bar()
{
    if (!target_ || !mana_bar_ || !target_->getStats()) return;
    mana_bar_->setPercentage(glm::vec2(target_->getStats()->getMana() / target_->getStats()->getMaxMana(), 1.0f));
}
```

让我们详细分析这些方法：

1. **addHUDStatsChild**：工厂方法，用于创建和初始化一个`HUDStats`实例。它设置了父对象、渲染位置和目标角色，并将HUD添加为父对象的子对象。

2. **init**：初始化HUD的各个组件，包括：
   - 生命条背景、生命条和生命图标
   - 魔法条背景、魔法条和魔法图标
   - 设置各组件的偏移量，使它们按照预期的位置排列

3. **update**：在每一帧更新HUD的显示，调用`update_health_bar`和`update_mana_bar`方法。

4. **update_health_bar**：更新生命条的显示。它获取目标角色的当前生命值百分比，并设置生命条精灵的显示百分比。

5. **update_mana_bar**：更新魔法条的显示。它获取目标角色的当前魔法值百分比，并设置魔法条精灵的显示百分比。

## 四、Sprite类的扩展

为了实现百分比显示的效果（即只显示精灵的一部分），我们需要对`Sprite`类进行扩展，添加一个新的属性`percentage_`：

```cpp
// sprite.h（添加成员变量和方法）
protected:
    glm::vec2 percentage_ = glm::vec2(1.0f);       // 决定图片原始区域的百分比

public:
    glm::vec2 getPercentage() const { return percentage_; }
    void setPercentage(const glm::vec2& percentage) { percentage_ = percentage; }
```

```cpp
// sprite.cpp（修改render方法）
void Sprite::render()
{
    if (!texture_.texture || !parrent_ || is_finish_) return;
    auto pos = parrent_->getRenderPosition() + offset_;
    game_.renderTexture(texture_, pos, size_, percentage_);   //解耦
}
```

同时，我们还需要修改`Game`类的`renderTexture`方法，使其支持只渲染纹理的一部分：

```cpp
// game.h（修改函数声明）
void renderTexture(const Texture& texture, const glm::vec2& position, const glm::vec2& size, const glm::vec2 &mask = glm::vec2(1.0f)); // 渲染纹理

// game.cpp（修改函数实现）
void Game::renderTexture(const Texture &texture, const glm::vec2 &position, const glm::vec2 &size, const glm::vec2 &mask)
{
    SDL_FRect src_rect = {
        texture.src_rect.x,
        texture.src_rect.y,
        texture.src_rect.w * mask.x,
        texture.src_rect.h * mask.y
    };
    SDL_FRect dst_rect = {
        position.x,
        position.y,
        size.x * mask.x,
        size.y * mask.y
    };
    SDL_RenderTextureRotated(renderer_, texture.texture, &src_rect, &dst_rect, texture.angle, nullptr, texture.is_flip ? SDL_FLIP_HORIZONTAL : SDL_FLIP_NONE);
}
```

这些修改使得我们可以只显示一个纹理的一部分，例如生命条只显示70%，魔法条只显示50%等。

## 五、在场景中集成HUD

最后，我们需要在主场景中创建并设置HUD：

```cpp
// scene_main.h（添加成员变量）
class HUDStats;
class SceneMain: public Scene
{
    Player* player_ = nullptr; // 玩家
    Spawner* spawner_ = nullptr;
    UIMouse* ui_mouse_ = nullptr;
    HUDStats* hud_stats_ = nullptr;
    // ...
};

// scene_main.cpp（在init方法中初始化HUD）
#include "screen/hud_stats.h"

void SceneMain::init()
{
    // ... 其他初始化代码
    
    ui_mouse_ = UIMouse::addUIMouseChild(this, "assets/UI/29.png", "assets/UI/30.png", 1.0f, Anchor::CENTER);
    hud_stats_ = HUDStats::addHUDStatsChild(this, player_, glm::vec2(30.f));
}
```

在`SceneMain`类的`init`方法中，我们创建了一个`HUDStats`实例，并将玩家作为目标传递给它。我们将HUD放置在屏幕的左上角（坐标为(30, 0)）。

## 六、最终效果

通过上述实现，我们创建了一个直观的玩家状态HUD，显示玩家的生命值和魔法值。生命条使用红色，而魔法条使用蓝色，与游戏中的常见惯例一致。此外，我们还添加了图标来表示这些条形代表什么：红色药水图标表示生命值，蓝色药水图标表示魔法值。

<img src="https://theorhythm.top/gamedev/GE/22-玩家状态HUD截图.png" style='width: 600px;' />

## 七、HUD与敌方生命条的比较

在上一课中，我们实现了敌方生命条，而本课中我们实现了玩家状态HUD。虽然它们都显示生命值，但有几个关键区别：

1. **位置不同**：
   - 敌方生命条：附加在敌人身上，跟随敌人移动
   - 玩家状态HUD：固定在屏幕上，不随游戏世界移动

2. **实现方式不同**：
   - 敌方生命条：使用`AffiliateBar`类，继承自`ObjectAffiliate`
   - 玩家状态HUD：使用`HUDStats`类，继承自`ObjectScreen`

3. **显示内容不同**：
   - 敌方生命条：只显示生命值
   - 玩家状态HUD：显示生命值和魔法值，还包括图标

4. **渲染方式不同**：
   - 敌方生命条：使用`renderHBar`方法，直接绘制矩形
   - 玩家状态HUD：使用纹理和百分比遮罩，可以实现更丰富的视觉效果

这些区别反映了不同用户界面元素的不同需求和用途。

## 总结

在本课中，我们实现了一个玩家状态HUD系统：

1. 设计并实现了`HUDStats`类，用于显示玩家的生命值和魔法值
2. 扩展了`Sprite`类，添加了百分比显示功能
3. 修改了`Game`类的`renderTexture`方法，使其支持部分纹理渲染
4. 在主场景中集成了HUD，并将其固定在屏幕上
5. 实现了HUD随玩家状态实时更新的功能

玩家状态HUD的实现使得玩家可以随时了解自己的状态，提升了游戏的可玩性和用户体验。同时，我们的实现也为未来添加更多HUD元素奠定了基础。

## 练习

1. **经验条**：为HUD添加一个经验条，显示玩家的当前经验值和升级所需经验值
2. **数字显示**：在生命条和魔法条旁边添加具体的数值显示
3. **状态图标**：添加显示玩家特殊状态（如中毒、虚弱等）的图标
4. **自适应布局**：使HUD能够根据屏幕分辨率自动调整大小和位置