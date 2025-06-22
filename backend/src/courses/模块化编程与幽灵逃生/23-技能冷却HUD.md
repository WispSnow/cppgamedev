# 技能冷却HUD

<link rel="stylesheet" href="/css/videoStyles.css" />

<div class="video-container">
  <div class="video-tabs">
    <a href="#bilibili" class="video-tab bilibili-tab">哔哩哔哩</a>
    <a href="#youtube" class="video-tab youtube-tab">YouTube</a>
  </div>

  <div id="youtube" class="video-content">
    <iframe 
      class="video-frame"
      src="https://www.youtube.com/embed/fV98dWVwpAI?si=2EcHHYM5GRGXjVJ4" 
      frameborder="0" 
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
      allowfullscreen>
    </iframe>
  </div>
  
  <div id="bilibili" class="video-content">
    <iframe 
      class="video-frame"
      src="//player.bilibili.com/player.html?bvid=BV1UuZhYnEx9&page=1&autoplay=0&danmaku=0&high_quality=1" 
      scrolling="no" 
      border="0" 
      frameborder="no" 
      framespacing="0" 
      allowfullscreen="true">
    </iframe>
  </div>
</div>

在游戏中，玩家需要随时了解自己技能的冷却状态，以便做出最佳的战斗决策。技能冷却HUD（Heads-Up Display）是一种直观显示技能可用性的界面元素，能够让玩家清楚地知道何时可以再次使用某个技能。在本课中，我们将设计并实现一个技能冷却HUD，为我们的武器系统提供视觉反馈。

<img src="https://theorhythm.top/gamedev/GE/23-技能冷却HUD.PNG" style='width: 800px;' />

## 一、技能冷却HUD的设计需求

我们的技能冷却HUD需要满足以下几个基本需求：

1. **清晰可见**：技能图标应该足够大，冷却状态应该一目了然
2. **实时更新**：能够实时反映技能的冷却进度
3. **位置合理**：通常放置在屏幕边缘，不影响游戏主视图
4. **视觉反馈**：提供明确的视觉区分，让玩家知道技能是否可用
5. **扩展性**：系统应当易于扩展，以支持多个技能的冷却显示

## 二、HUDSkill类设计

首先，我们设计一个`HUDSkill`类来实现技能冷却HUD。这个类继承自`ObjectScreen`，因为它需要固定在屏幕上而不是游戏世界中：

```cpp
// hud_skill.h
#ifndef HUD_SKILL_H
#define HUD_SKILL_H

#include "../core/object_screen.h"

class Sprite;
class HUDSkill : public ObjectScreen
{
protected:
    Sprite* icon_ = nullptr;
    float percentage_ = 1.0f;
public:
    static HUDSkill* addHUDSkillChild(Object* parent, const std::string& file_path, glm::vec2 pos, float scale = 1.0f, Anchor anchor = Anchor::CENTER);
    virtual void render() override;
    // getters and setters
    Sprite* getIcon() const { return icon_; }
    void setIcon(Sprite* icon) { icon_ = icon; }
    float getPercentage() const { return percentage_; }
    void setPercentage(float percentage);
};

#endif // HUD_SKILL_H
```

`HUDSkill`类包含以下关键属性：

- `icon_`：技能图标的精灵组件
- `percentage_`：技能冷却完成的百分比（1.0表示完全冷却完毕，可以使用）

我们声明了几个关键方法：

- `addHUDSkillChild`：静态工厂方法，用于创建HUDSkill实例
- `render`：渲染技能图标和冷却效果
- `setPercentage`：设置冷却完成的百分比，用于更新显示

## 三、HUDSkill类实现

接下来，我们实现`HUDSkill`类的具体功能：

```cpp
// hud_skill.cpp
#include "hud_skill.h"
#include "../affiliate/sprite.h"

HUDSkill *HUDSkill::addHUDSkillChild(Object *parent, const std::string &file_path, glm::vec2 pos, float scale, Anchor anchor)
{
    auto hud_skill = new HUDSkill();
    hud_skill->init();
    hud_skill->icon_ = Sprite::addSpriteChild(hud_skill, file_path, scale, anchor);
    hud_skill->setRenderPosition(pos);
    if (parent) parent->addChild(hud_skill);
    return hud_skill;
}

void HUDSkill::render()
{
    // 先绘制浅色背景
    SDL_SetTextureColorModFloat(icon_->getTexture().texture, 0.3, 0.3, 0.3);
    auto pos = getRenderPosition() + icon_->getOffset();
    game_.renderTexture(icon_->getTexture(), pos, icon_->getSize());
    SDL_SetTextureColorModFloat(icon_->getTexture().texture, 1.0, 1.0, 1.0);
    // 然后正常绘制
    ObjectScreen::render();
}

void HUDSkill::setPercentage(float percentage) 
{ 
    percentage = glm::clamp(percentage, 0.0f, 1.0f);
    percentage_ = percentage; 
    if (icon_){
        icon_->setPercentage(glm::vec2(1.0f, percentage));
    }   
}
```

让我们详细分析这些方法：

1. **addHUDSkillChild**：工厂方法，用于创建和初始化一个`HUDSkill`实例。它创建了技能图标，设置了渲染位置，并将HUD添加为父对象的子对象。

2. **render**：渲染方法，实现了技能冷却的视觉效果。它首先以低亮度（30%）渲染整个图标作为背景，然后正常渲染图标的可用部分。这种两层渲染的方式可以清晰地显示技能的冷却状态。

3. **setPercentage**：设置冷却完成的百分比，并更新图标的显示。它会限制百分比在0到1之间，然后设置图标精灵的显示百分比。只有图标的上部分（完成冷却的部分）会被正常渲染，而下部分（仍在冷却中）会被隐藏。

这种实现创造了一个从下到上填充的冷却效果，随着冷却进度的增加，图标会逐渐从底部向上显示，直到完全显示表示冷却完成。

## 四、优化Game类的renderTexture方法

为了正确显示技能冷却效果，我们需要修改`Game`类的`renderTexture`方法，以支持从下到上的填充效果：

```cpp
// game.cpp（修改函数实现）
void Game::renderTexture(const Texture &texture, const glm::vec2 &position, const glm::vec2 &size, const glm::vec2 &mask)
{
    SDL_FRect src_rect = {
        texture.src_rect.x,
        texture.src_rect.y + texture.src_rect.h * (1 - mask.y),
        texture.src_rect.w * mask.x,
        texture.src_rect.h * mask.y
    };
    SDL_FRect dst_rect = {
        position.x,
        position.y + size.y * (1 - mask.y),
        size.x * mask.x,
        size.y * mask.y
    };
    SDL_RenderTextureRotated(renderer_, texture.texture, &src_rect, &dst_rect, texture.angle, nullptr, texture.is_flip ? SDL_FLIP_HORIZONTAL : SDL_FLIP_NONE);
}
```

与之前的实现相比，这个版本做了两处关键修改：

1. 修改了源矩形（`src_rect`）的`y`值，使其从纹理的底部而不是顶部开始裁剪
2. 修改了目标矩形（`dst_rect`）的`y`值，使图像从底部而不是顶部开始绘制

这些修改确保了当`mask.y`为0.5时，图标的上半部分（而不是左半部分）会被显示，从而实现了从下到上的填充效果。

## 五、在武器类中集成技能冷却HUD

最后，我们需要在雷电武器类（`WeaponThunder`）中集成技能冷却HUD：

```cpp
// weapon_thunder.h（修改类定义）
#ifndef WEAPON_THUNDER_H
#define WEAPON_THUNDER_H

#include "raw/weapon.h"
#include "screen/hud_skill.h"

class WeaponThunder : public Weapon
{
protected:
    HUDSkill* hud_skill_ = nullptr; 
public:
    virtual void init() override;
    virtual void update(float dt) override;
    static WeaponThunder* addWeaponThunderChild(Actor* parent, float cool_down, float mana_cost);

    virtual void handleEvents(SDL_Event& event) override;
};

#endif // WEAPON_THUNDER_H
```

```cpp
// weapon_thunder.cpp（添加初始化和更新方法）
void WeaponThunder::init()
{
    Weapon::init();
    auto scene = game_.getCurrentScene();
    auto pos = glm::vec2(game_.getScreenSize().x - 300, 30);
    hud_skill_ = HUDSkill::addHUDSkillChild(scene, "assets/UI/Electric-Icon.png", pos, 0.14f, Anchor::CENTER);
}

void WeaponThunder::update(float dt)
{
    Weapon::update(dt);
    if (hud_skill_) hud_skill_->setPercentage(cool_down_timer_ / cool_down_);   // 应该是0～1的值
}
```

在`WeaponThunder`类中，我们：

1. 添加了一个`hud_skill_`成员变量，用于存储技能冷却HUD
2. 重写了`init`方法，在初始化时创建技能冷却HUD
3. 重写了`update`方法，在每一帧更新技能冷却HUD的显示

注意，我们将HUD添加到当前场景而不是武器本身，这是因为HUD需要固定在屏幕上，而不是跟随武器移动。我们使用了游戏屏幕右上角的位置（`game_.getScreenSize().x - 300, 30`）来放置技能图标。

技能冷却进度的计算非常直观：`cool_down_timer_ / cool_down_`。当`cool_down_timer_`从0增长到`cool_down_`值时，百分比会从0增长到1，表示冷却完成。

## 六、最终效果

通过上述实现，我们创建了一个直观的技能冷却HUD，显示雷电武器的冷却状态。当技能在冷却中时，图标会部分显示；随着冷却的进行，图标会逐渐完全显示，表示技能已经可以再次使用。

<img src="https://theorhythm.top/gamedev/GE/23-技能冷却HUD截图.png" style='width: 600px;' />

## 总结

在本课中，我们实现了一个技能冷却HUD系统：

1. 设计并实现了`HUDSkill`类，用于显示技能冷却状态
2. 优化了`Game`类的`renderTexture`方法，支持从下到上的填充效果
3. 在雷电武器类中集成了技能冷却HUD，实现了冷却进度的实时显示
4. 探讨了系统的进一步改进和扩展可能性

技能冷却HUD的实现使得玩家可以直观地了解技能的可用性，从而做出更加明智的战斗决策。同时，我们的实现也为添加更多技能和视觉效果奠定了基础。

## 练习

1. **多技能UI**：实现一个支持多个技能的冷却界面，并为每个技能分配不同的快捷键
2. **数字倒计时**：为技能冷却添加数字倒计时显示
3. **视觉增强**：添加技能可用时的高亮或闪烁效果
4. **技能等级**：修改UI以显示技能的当前级别或威力
5. **布局优化**：实现可自定义的技能UI布局，让玩家可以调整技能图标的位置