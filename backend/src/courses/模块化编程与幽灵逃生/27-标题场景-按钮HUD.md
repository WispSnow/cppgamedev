# 标题场景-按钮HUD

<link rel="stylesheet" href="/css/videoStyles.css" />

<div class="video-container">
  <div class="video-tabs">
    <a href="#bilibili" class="video-tab bilibili-tab">哔哩哔哩</a>
    <a href="#youtube" class="video-tab youtube-tab">YouTube</a>
  </div>

  <div id="youtube" class="video-content">
    <iframe 
      class="video-frame"
      src="https://www.youtube.com/embed/dfKxYVCVwn0?si=2EcHHYM5GRGXjVJ4" 
      frameborder="0" 
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
      allowfullscreen>
    </iframe>
  </div>
  
  <div id="bilibili" class="video-content">
    <iframe 
      class="video-frame"
      src="//player.bilibili.com/player.html?bvid=BV13ddwYzEqB&page=1&autoplay=0&danmaku=0&high_quality=1" 
      scrolling="no" 
      border="0" 
      frameborder="no" 
      framespacing="0" 
      allowfullscreen="true">
    </iframe>
  </div>
</div>

在上一课中，我们实现了带有动态彩色边框的标题场景。本课将继续完善标题场景，添加交互式按钮，使玩家能够与游戏进行基本交互，比如退出游戏。我们将设计并实现一个通用的按钮HUD组件，它可以在不同的游戏状态下提供一致的用户交互体验。

<img src="https://theorhythm.top/gamedev/GE/27-标题场景-按钮HUD2.PNG" style='width: 800px;' />

## 一、按钮HUD的设计需求

交互式按钮是游戏界面中不可或缺的组件，它要满足以下设计需求：

1. **可视化状态反馈**：按钮应该有不同的视觉状态（正常、悬停、按下）
2. **事件响应**：能够响应鼠标悬停和点击事件
3. **声音反馈**：提供声音反馈，增强交互感
4. **可复用性**：设计为通用组件，可在游戏的不同部分使用
5. **简单的API**：提供简单明了的接口，方便其他类使用

## 二、设计HUDButton类

首先我们设计`HUDButton`类的结构：

```cpp
// hud_button.h
#ifndef HUD_BUTTON_H
#define HUD_BUTTON_H

#include "../core/object_screen.h"
#include "../affiliate/sprite.h"

class HUDButton : public ObjectScreen 
{
protected:
    Sprite* sprite_normal_ = nullptr;  // 正常状态下的精灵
    Sprite* sprite_hover_ = nullptr;   // 悬停状态下的精灵
    Sprite* sprite_press_ = nullptr;   // 按下状态下的精灵

    bool is_hover_ = false;  // 是否处于悬停状态
    bool is_press_ = false;  // 是否处于按下状态
    bool is_trigger_ = false;  // 是否触发了点击事件
public:
    // 创建按钮的静态工厂方法
    static HUDButton* addHUDButtonChild(Object* parent, glm::vec2 render_pos, 
        const std::string& file_path1, const std::string& file_path2, 
        const std::string& file_path3, float scale = 1.0f, 
        Anchor anchor = Anchor::CENTER);
    
    // 事件处理和更新方法
    virtual void handleEvents(SDL_Event& event) override;
    virtual void update(float dt) override;
    
    // 检查状态的方法
    void checkHover();
    void checkState();
    
    // 获取器和设置器
    Sprite* getSpriteNormal() const { return sprite_normal_; }
    Sprite* getSpriteHover() const { return sprite_hover_; }
    Sprite* getSpritePress() const { return sprite_press_; }
    bool getIsHover() const { return is_hover_; }
    bool getIsPress() const { return is_press_; }
    bool getIsTrigger();   // 只要触发一次，就会重置is_trigger_状态

    void setIsHover(bool is_hover) { is_hover_ = is_hover; }
    void setIsPress(bool is_press) { is_press_ = is_press; }
    void setIsTrigger(bool is_trigger) { is_trigger_ = is_trigger; }
};

#endif // HUD_BUTTON_H
```

`HUDButton`类继承自`ObjectScreen`，具有以下特点：

1. 使用三个不同的精灵（Sprite）表示按钮的三种状态：正常、悬停和按下
2. 通过布尔标志跟踪按钮的当前状态
3. 提供静态工厂方法简化按钮创建
4. 覆盖事件处理和更新方法以响应用户输入
5. 提供状态检查方法和访问器

## 三、实现HUDButton类的功能

### 1. 创建按钮

按钮的创建通过静态工厂方法实现：

```cpp
// hud_button.cpp
HUDButton *HUDButton::addHUDButtonChild(Object *parent, glm::vec2 render_pos, 
    const std::string &file_path1, const std::string &file_path2, 
    const std::string &file_path3, float scale, Anchor anchor)
{
    auto hud_button = new HUDButton();
    hud_button->init();
    hud_button->setRenderPosition(render_pos);
    
    // 创建三种状态的精灵
    hud_button->sprite_normal_ = Sprite::addSpriteChild(hud_button, file_path1, scale, anchor);
    hud_button->sprite_hover_ = Sprite::addSpriteChild(hud_button, file_path2, scale, anchor);
    hud_button->sprite_press_ = Sprite::addSpriteChild(hud_button, file_path3, scale, anchor);
    
    // 初始时只有正常状态的精灵是活跃的
    hud_button->sprite_hover_->setActive(false);
    hud_button->sprite_press_->setActive(false);
    
    if (parent) parent->addChild(hud_button);
    return hud_button;
}
```

这个方法接收三个图像路径，分别对应按钮的三种状态，并创建相应的精灵。初始时，只有正常状态的精灵是可见的。

### 2. 处理输入事件

按钮需要响应鼠标事件：

```cpp
void HUDButton::handleEvents(SDL_Event &event)
{
    if (event.type == SDL_EVENT_MOUSE_BUTTON_DOWN) {
        if (event.button.button == SDL_BUTTON_LEFT) {
            if (is_hover_){  // 只有当鼠标悬停在按钮上时，才会响应按下事件
                is_press_ = true;
                game_.playSound("assets/sound/UI_button08.wav");  // 播放按下音效
            }
        }
    } else if (event.type == SDL_EVENT_MOUSE_BUTTON_UP) {
        if (event.button.button == SDL_BUTTON_LEFT) {
            is_press_ = false;
            if (is_hover_){  // 只有当鼠标悬停在按钮上放开时，才视为触发按钮
                is_trigger_ = true;
            }
        }
    }
}
```

这个方法监听鼠标按下和释放事件，并相应地更新按钮状态。当按钮被点击时，会播放声音提供反馈。

### 3. 更新按钮状态

按钮的状态需要在每一帧更新：

```cpp
void HUDButton::update(float dt) {
    checkHover();  // 检查鼠标是否悬停在按钮上
    checkState();  // 根据当前状态更新精灵显示
}
```

### 4. 检测鼠标悬停

```cpp
void HUDButton::checkHover()
{
    bool new_hover_;
    auto pos = render_position_ + sprite_normal_->getOffset();
    auto size = sprite_normal_->getSize();
    
    // 检查鼠标是否在按钮区域内
    if (game_.isMouseInRect(pos, pos + size)){
        new_hover_ = true;
    } else {
        new_hover_ = false;
    }
    
    // 如果悬停状态发生变化，更新状态并播放音效
    if (new_hover_ != is_hover_){
        is_hover_ = new_hover_;
        if (is_hover_ && !is_press_) 
            game_.playSound("assets/sound/UI_button12.wav");  // 播放悬停音效
    }
}
```

这个方法使用了`Game`类中的`isMouseInRect`方法来检测鼠标是否在按钮区域内。我们稍后将详细介绍这个辅助方法。

### 5. 更新精灵显示

```cpp
void HUDButton::checkState()
{
    if (!is_press_ && !is_hover_){
        // 正常状态：显示正常精灵
        sprite_normal_->setActive(true);
        sprite_hover_->setActive(false);
        sprite_press_->setActive(false);
    }else if (!is_press_ && is_hover_){
        // 悬停状态：显示悬停精灵
        sprite_normal_->setActive(false);
        sprite_hover_->setActive(true);
        sprite_press_->setActive(false);
    }else {
        // 按下状态：显示按下精灵
        sprite_normal_->setActive(false);
        sprite_hover_->setActive(false);
        sprite_press_->setActive(true);
    }
}
```

根据当前的按钮状态（正常、悬停或按下），激活相应的精灵并禁用其他精灵。

### 6. 触发状态检测

```cpp
bool HUDButton::getIsTrigger()
{
    if (is_trigger_){
        is_trigger_ = false;  // 读取后自动重置
        return true;
    }
    return false;
}
```

这个方法用于检查按钮是否被触发，并在读取后自动重置触发状态，确保每次点击只触发一次事件。

## 四、Game类中的辅助函数

为了支持按钮功能，我们在`Game`类中添加了一个辅助方法`isMouseInRect`：

```cpp
// game.h
bool isMouseInRect(const glm::vec2& top_left, const glm::vec2& botton_right);
```

```cpp
// game.cpp
bool Game::isMouseInRect(const glm::vec2 &top_left, const glm::vec2 &botton_right)
{
    if (mouse_position_.x >= top_left.x && mouse_position_.x <= botton_right.x && 
        mouse_position_.y >= top_left.y && mouse_position_.y <= botton_right.y){
        return true;
    }
    return false;
}
```

这个方法检查当前鼠标位置是否在指定的矩形区域内，用于按钮的碰撞检测。此外，我们还在`Game`类中添加了一个方便的方法来退出游戏：

```cpp
// game.h
void quit() { is_running_ = false; }
```

## 五、在标题场景中使用按钮

现在，我们可以在标题场景中添加退出按钮：

```cpp
// scene_title.h
class HUDButton;  // 前向声明

class SceneTitle : public Scene
{
protected:
    SDL_FColor boundary_color_ = {0.5, 0.5, 0.5, 1};
    float color_timer_ = 0;
    HUDButton* button_start_ = nullptr;    // 开始按钮（预留）
    HUDButton* button_credits_ = nullptr;  // 制作人员按钮（预留）
    HUDButton* button_quit_ = nullptr;     // 退出按钮
    
    // ...
private:
    // ...
    void checkButtonQuit();  // 检查退出按钮是否被触发
};
```

在场景初始化中创建按钮：

```cpp
// scene_title.cpp
#include "screen/hud_button.h"

void SceneTitle::init()
{
    Scene::init();
    // ... 创建文本显示 ...
    
    // 创建退出按钮
    button_quit_ = HUDButton::addHUDButtonChild(this, 
        game_.getScreenSize() / 2.0f + glm::vec2(200, 200), 
        "assets/UI/A_Quit1.png",   // 正常状态
        "assets/UI/A_Quit2.png",   // 悬停状态
        "assets/UI/A_Quit3.png",   // 按下状态
        2.0f);                     // 缩放倍数
}
```

在更新方法中检查按钮状态：

```cpp
void SceneTitle::update(float dt)
{
    Scene::update(dt);
    color_timer_ += dt;
    updateColor();
    checkButtonQuit();  // 检查退出按钮
}
```

实现按钮检查方法：

```cpp
void SceneTitle::checkButtonQuit()
{
    if (button_quit_->getIsTrigger()){
        game_.quit();  // 如果退出按钮被触发，退出游戏
    }
}
```

## 六、按钮设计与用户体验

设计良好的按钮对游戏的用户体验至关重要。我们的按钮实现考虑了几个重要方面：

1. **视觉反馈**：通过不同的图像表示不同状态，让用户直观地了解按钮的当前状态
2. **声音反馈**：在悬停和点击时播放声音，加强用户的反馈感
3. **状态管理**：明确定义按钮的状态转换逻辑，确保行为一致性
4. **可扩展性**：设计支持不同的按钮外观和行为，便于在游戏中添加各种按钮

<img src="https://theorhythm.top/gamedev/GE/27-标题场景-按钮HUD截图.png" style='width: 800px;' />

## 总结

在本课中，我们设计并实现了一个交互式按钮HUD组件：

1. 创建了`HUDButton`类，支持三种视觉状态和声音反馈
2. 实现了鼠标悬停检测和点击触发机制
3. 在`Game`类中添加了辅助方法支持按钮功能
4. 在标题场景中添加了退出按钮，实现了基本的用户交互

按钮组件是游戏UI系统的基础部分，通过本课的实现，我们可以在游戏中添加各种交互元素，提升游戏的可用性和用户体验。

## 练习

1. 为标题场景添加"开始游戏"按钮，点击后切换到主游戏场景
2. 添加一个"音效开关"按钮，点击后切换游戏音效的开/关状态
3. 扩展`HUDButton`类，支持禁用状态，当按钮不可用时显示灰色