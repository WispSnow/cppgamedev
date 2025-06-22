# 文字HUD类

<link rel="stylesheet" href="/css/videoStyles.css" />

<div class="video-container">
  <div class="video-tabs">
    <a href="#bilibili" class="video-tab bilibili-tab">哔哩哔哩</a>
    <a href="#youtube" class="video-tab youtube-tab">YouTube</a>
  </div>

  <div id="youtube" class="video-content">
    <iframe 
      class="video-frame"
      src="https://www.youtube.com/embed/ZHixiJnvX7c?si=2EcHHYM5GRGXjVJ4" 
      frameborder="0" 
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
      allowfullscreen>
    </iframe>
  </div>
  
  <div id="bilibili" class="video-content">
    <iframe 
      class="video-frame"
      src="//player.bilibili.com/player.html?bvid=BV18rZSY3EyW&page=1&autoplay=0&danmaku=0&high_quality=1" 
      scrolling="no" 
      border="0" 
      frameborder="no" 
      framespacing="0" 
      allowfullscreen="true">
    </iframe>
  </div>
</div>

在游戏开发中，向玩家展示文字信息是一个基本需求，从游戏得分到提示信息，从对话文本到游戏状态，文字无处不在。在本课中，我们将设计并实现一个灵活的文字HUD系统，使得在游戏中显示各种文本信息变得简单而直观。这一系统由两个主要类组成：`TextLabel`提供基础文字渲染能力，而`HUDText`则将文字与背景结合，形成完整的文字HUD控件。

<img src="https://theorhythm.top/gamedev/GE/24-文字HUD类.PNG" style='width: 800px;' />

## 一、文字HUD系统的设计需求

我们的文字HUD系统需要满足以下几个基本需求：

1. **灵活性**：支持不同字体、大小、位置和样式的文本显示
2. **可读性**：确保文字清晰可读，可选择添加背景以增强对比度
3. **实时更新**：文本内容可以随游戏状态动态变化
4. **易于使用**：提供简单的接口，使得添加和更新文本显示变得容易
5. **性能优化**：文本渲染应该高效，不会对游戏性能造成明显影响

## 二、文字HUD的层次结构

我们设计了一个两层结构的文字HUD系统：

1. **TextLabel类**：基础文本标签，负责文字的渲染和管理
2. **HUDText类**：高级文本HUD，将文本标签与背景结合，并提供更丰富的定制功能

这种层次结构提供了良好的灵活性，可以根据需要使用简单的文本标签或完整的HUD控件。

## 三、TextLabel类设计与实现

首先，我们设计一个`TextLabel`类来处理基础的文本渲染：

```cpp
// text_label.h
#ifndef TEXT_LABEL_H
#define TEXT_LABEL_H

#include "../core/object_affiliate.h"
#include <string>

class TextLabel : public ObjectAffiliate
{
protected:
    TTF_Text* ttf_text_ = nullptr;
    std::string font_path_ ;
    int font_size_ = 16; 

public:
    static TextLabel* addTextLabelChild(ObjectScreen* parent, const std::string& text, const std::string& font_path, int font_size, Anchor anchor = Anchor::CENTER);
    virtual void render() override;
    virtual void clean() override;
    // setters and getters
    void setFont(const std::string& font_path, int font_size);      // init() 之后需要立刻调用
    void setFontPath(const std::string &font_path);
    void setFontSize(int font_size);
    void setText(std::string ttf_text) { TTF_SetTextString(ttf_text_, ttf_text.c_str(), ttf_text.length()); }
    std::string getText() const { return ttf_text_->text; }

private:
    void updateSize();  // 根据文字内容决定大小
};

#endif // TEXT_LABEL_H
```

`TextLabel`类继承自`ObjectAffiliate`，使其可以作为组件附加到游戏对象上。它包含以下关键属性：

- `ttf_text_`：底层的文本渲染对象
- `font_path_`：字体文件路径
- `font_size_`：字体大小

主要方法包括：

- `addTextLabelChild`：静态工厂方法，用于创建文本标签
- `render`：渲染文本
- `clean`：清理资源
- `setFont`、`setFontPath`、`setFontSize`：设置字体属性
- `setText`、`getText`：设置和获取文本内容
- `updateSize`：根据文本内容更新标签大小

接下来，我们实现`TextLabel`类的各个方法：

```cpp
// text_label.cpp
#include "text_label.h"

void TextLabel::render()
{
    ObjectAffiliate::render();
    auto pos = parrent_->getRenderPosition() + offset_;
    TTF_DrawRendererText(ttf_text_, pos.x, pos.y);
}

void TextLabel::clean()
{
    if (!ttf_text_) return;
    TTF_DestroyText(ttf_text_);
}

TextLabel *TextLabel::addTextLabelChild(ObjectScreen *parent, const std::string &text, const std::string &font_path, int font_size, Anchor anchor)
{
    auto text_label = new TextLabel();
    text_label->init();
    text_label->setFont(font_path, font_size);
    text_label->setText(text);
    text_label->setAnchor(anchor);
    text_label->updateSize();
    if (parent) {
        parent->addChild(text_label);
        text_label->setParent(parent);
    }
    return text_label;
}

void TextLabel::setFont(const std::string &font_path, int font_size)
{
    font_path_ = font_path;
    font_size_ = font_size;
    auto font = game_.getAssetStore()->getFont(font_path_, font_size_);
    if (!ttf_text_) ttf_text_ = game_.createTTF_Text("", font_path_, font_size_);
    TTF_SetTextFont(ttf_text_, font);
}

void TextLabel::setFontPath(const std::string &font_path)
{
    font_path_ = font_path;
    // 有可能是新的ttf_font，所以从AssetStore里载入，
    // 然后设置TTF_text里的ttf_font
    auto font = game_.getAssetStore()->getFont(font_path_, font_size_);
    TTF_SetTextFont(ttf_text_, font);
}

void TextLabel::setFontSize(int font_size)
{
    font_size_ = font_size;
    auto font = game_.getAssetStore()->getFont(font_path_, font_size_);
    TTF_SetTextFont(ttf_text_, font);
}

void TextLabel::updateSize()
{
    int w, h;
    TTF_GetTextSize(ttf_text_, &w, &h);
    setSize(glm::vec2(w, h));
}
```

这些方法的功能如下：

1. **render**：在父对象的位置上渲染文本
2. **clean**：释放文本渲染对象资源
3. **addTextLabelChild**：创建一个新的文本标签，设置字体、文本内容和锚点，并将其添加为父对象的子对象
4. **setFont**：设置字体文件和大小，从资源管理器获取或创建字体
5. **setFontPath/setFontSize**：分别更新字体路径和大小
6. **updateSize**：根据文本内容自动计算和更新标签的大小

## 四、扩展Game类支持文本渲染

为了支持文本渲染，我们需要在`Game`类中添加相关功能：

```cpp
// game.h（添加成员变量和方法）
private:
    TTF_TextEngine* ttf_engine_ = nullptr;
    int score_ = 0;
    int high_score_ = 0;

public:
    // 文字函数
    TTF_Text* createTTF_Text(const std::string& text, const std::string& font_path, int font_size = 16);
    
    // 得分函数
    void setScore(int score);
    int getScore() const { return score_; }
    void setHighScore(int high_score) { high_score_ = high_score; }
    int getHighScore() const { return high_score_; }
    void addScore(int score);
```

```cpp
// game.cpp（实现相关方法）
void Game::init(std::string title, int width, int height)
{
    // ... 其他初始化代码
    
    // 初始化文本引擎
    ttf_engine_ = TTF_CreateRendererTextEngine(renderer_);
    
    // ... 其他初始化代码
}

void Game::clean()
{
    // ... 其他清理代码
    
    // 释放文本引擎
    if (ttf_engine_){
        TTF_DestroyRendererTextEngine(ttf_engine_);
    }
    
    // ... 其他清理代码
}

TTF_Text *Game::createTTF_Text(const std::string &text, const std::string &font_path, int font_size)
{
    auto font = asset_store_->getFont(font_path, font_size);
    return TTF_CreateText(ttf_engine_, font, text.c_str(), 0);
}

void Game::setScore(int score) 
{ 
    score_ = score; 
    if (score_ > high_score_) {
        high_score_ = score_;
    }
}

void Game::addScore(int score)
{ 
    setScore(score_ + score);
}
```

这些修改包括：

1. 添加一个`ttf_engine_`成员变量，用于管理文本渲染
2. 在`init`方法中初始化文本引擎
3. 在`clean`方法中释放文本引擎资源
4. 添加`createTTF_Text`方法，用于创建文本渲染对象
5. 添加得分相关的方法，用于管理和更新游戏得分

## 五、HUDText类设计与实现

<link rel="stylesheet" href="/css/videoStyles.css" />

<div class="video-container">
  <div class="video-tabs">
    <a href="#bilibili" class="video-tab bilibili-tab">哔哩哔哩</a>
    <a href="#youtube" class="video-tab youtube-tab">YouTube</a>
  </div>

  <div id="youtube" class="video-content">
    <iframe 
      class="video-frame"
      src="https://www.youtube.com/embed/3ZdUe9tMzqI?si=2EcHHYM5GRGXjVJ4" 
      frameborder="0" 
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
      allowfullscreen>
    </iframe>
  </div>
  
  <div id="bilibili" class="video-content">
    <iframe 
      class="video-frame"
      src="//player.bilibili.com/player.html?bvid=BV1N6ZRY7EV7&page=1&autoplay=0&danmaku=0&high_quality=1" 
      scrolling="no" 
      border="0" 
      frameborder="no" 
      framespacing="0" 
      allowfullscreen="true">
    </iframe>
  </div>
</div>

有了基础的文本渲染能力，我们可以设计一个更高级的`HUDText`类，它结合了文本和背景图像：

```cpp
// hud_text.h
#ifndef HUD_TEXT_H
#define HUD_TEXT_H

#include "../core/object_screen.h"
#include "../affiliate/text_label.h"
#include "../affiliate/sprite.h"

class HUDText : public ObjectScreen
{
protected:
    TextLabel *text_label_ = nullptr;
    Sprite *sprite_bg_ = nullptr;
    glm::vec2 size_ = glm::vec2(0, 0);      // 背景图片的大小
public:
    static HUDText* addHUDTextChild(Object* parent, const std::string& text, glm::vec2 render_pos, glm::vec2 size, const std::string& font_path = "assets/font/VonwaonBitmap-16px.ttf", int font_size = 32, const std::string& bg_path= "assets/UI/Textfield_01.png", Anchor anchor = Anchor::CENTER);

    // setters and getters
    void setTextLabel(TextLabel *text_label) { text_label_ = text_label; }
    void setSpriteBg(Sprite *sprite) { sprite_bg_ = sprite; }
    TextLabel* getTextLabel() const { return text_label_; }
    Sprite* getSpriteBg() const { return sprite_bg_; }

    void setText(const std::string& text) { text_label_->setText(text); }
    std::string getText() const { return text_label_->getText(); }
    void setSize(const glm::vec2& size);

    void setBackgroud(const std::string& file_path);
};

#endif // HUD_TEXT_H
```

`HUDText`类继承自`ObjectScreen`，这使它可以直接放置在屏幕上而不是游戏世界中。它包含以下关键属性：

- `text_label_`：文本标签组件
- `sprite_bg_`：背景精灵组件
- `size_`：背景大小

主要方法包括：

- `addHUDTextChild`：静态工厂方法，用于创建HUD文本控件
- 各种getter和setter方法，用于访问和修改组件属性
- `setText`/`getText`：设置和获取文本内容
- `setSize`：设置背景大小
- `setBackgroud`：设置背景图像

接下来，我们实现`HUDText`类的方法：

```cpp
// hud_text.cpp
#include "hud_text.h"

HUDText *HUDText::addHUDTextChild(Object *parent, const std::string &text, glm::vec2 render_pos, glm::vec2 size, const std::string &font_path, int font_size, const std::string &bg_path, Anchor anchor)
{
    auto hud_text = new HUDText();
    hud_text->init();
    hud_text->setRenderPosition(render_pos);
    hud_text->setSpriteBg(Sprite::addSpriteChild(hud_text, bg_path, 1, anchor));
    hud_text->setSize(size);
    hud_text->setTextLabel(TextLabel::addTextLabelChild(hud_text, text, font_path, font_size, anchor));
    if (parent) {
        parent->addChild(hud_text);
    }
    return hud_text;
}

void HUDText::setSize(const glm::vec2 &size)
{
    size_ = size;
    sprite_bg_->setSize(size);
}

void HUDText::setBackgroud(const std::string &file_path)
{
    if (sprite_bg_) sprite_bg_->setTexture(file_path);
    else sprite_bg_ = Sprite::addSpriteChild(this, file_path, 1, Anchor::CENTER);
}
```

这些方法的功能如下：

1. **addHUDTextChild**：创建一个新的HUD文本控件，包括背景和文本标签，并设置其位置、大小和锚点
2. **setSize**：设置控件大小，同时更新背景精灵的大小
3. **setBackgroud**：设置背景图像，如果已存在则更新纹理，否则创建新的背景精灵

## 六、在游戏中应用文字HUD

有了`TextLabel`和`HUDText`类，我们可以在游戏中轻松添加各种文本显示。最常见的应用是显示玩家得分，我们将在主场景中实现这一功能：

```cpp
// scene_main.h（添加成员变量）
class HUDText;
class SceneMain: public Scene
{
    // ... 其他成员
    HUDText* hud_text_score_ = nullptr;
    
    // ... 其他方法声明
private:
    void updateScore();
};
```

```cpp
// scene_main.cpp（实现相关方法）
#include "screen/hud_text.h"

void SceneMain::init()
{
    // ... 其他初始化代码
    
    hud_stats_ = HUDStats::addHUDStatsChild(this, player_, glm::vec2(30.f));
    hud_text_score_ = HUDText::addHUDTextChild(this, "Score: 0", glm::vec2(game_.getScreenSize().x - 120.f, 30.f), glm::vec2(200, 50));
    
    // ... 其他初始化代码
}

void SceneMain::update(float dt)
{
    Scene::update(dt);
    updateScore();
}

void SceneMain::updateScore()
{
    hud_text_score_->setText("Score: " + std::to_string(game_.getScore()));
}
```

在主场景中，我们：

1. 在屏幕右上角添加一个得分显示（`hud_text_score_`）
2. 在每一帧更新得分显示，使其反映当前游戏得分

## 七、与得分系统集成

为了使得分显示有意义，我们需要在适当的时机更新游戏得分。最典型的例子是敌人被击败时增加得分：

```cpp
// enemy.h（添加成员变量）
class Enemy : public Actor
{
    // ... 其他成员
    int score_ = 10;  // 击败敌人获得的分数
    
    // ... 其他方法
};
```

```cpp
// enemy.cpp（在适当的方法中更新得分）
void Enemy::changeState(State new_state)
{
    // ... 其他代码
    
    switch (new_state)
    {
    // ... 其他状态处理
    
    case State::DIE:
        current_anim_ = anim_die_;
        current_anim_->setActive(true);
        game_.addScore(score_);  // 敌人死亡时增加得分
        break;
    }
    
    // ... 其他代码
}
```

这样，每当敌人被击败（进入死亡状态）时，玩家的得分就会增加，并且屏幕上的得分显示会实时更新。

## 八、最终效果

通过实现`TextLabel`和`HUDText`类，我们创建了一个灵活的文字HUD系统，可以在游戏中显示各种文本信息。在我们的示例中，我们使用它来显示玩家得分，但它可以用于显示任何类型的文本，如对话、提示、计时器等。

<img src="https://theorhythm.top/gamedev/GE/24-文字HUD类截图.png" style='width: 600px;' />

## 总结

在本课中，我们实现了一个文字HUD系统：

1. 设计并实现了`TextLabel`类，提供基础文本渲染能力
2. 扩展了`Game`类，添加文本引擎和得分管理功能
3. 设计并实现了`HUDText`类，将文本与背景结合
4. 在游戏中应用文字HUD，实现得分显示
5. 讨论了系统的进一步改进和扩展可能性

文字HUD系统的实现使得我们可以在游戏中轻松显示各种文本信息，增强了游戏的可玩性和用户体验。这一系统为后续添加更多游戏功能（如教程、对话、状态显示等）奠定了基础。

## 练习

1. **多样式文本**：扩展`TextLabel`类，支持不同颜色、大小和样式的文本显示
2. **动画文本**：实现一个文本淡入淡出效果
3. **多行文本**：添加对多行文本和自动换行的支持