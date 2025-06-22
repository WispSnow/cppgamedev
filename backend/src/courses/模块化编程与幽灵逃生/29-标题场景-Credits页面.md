# 标题场景-Credits页面

<link rel="stylesheet" href="/css/videoStyles.css" />

<div class="video-container">
  <div class="video-tabs">
    <a href="#bilibili" class="video-tab bilibili-tab">哔哩哔哩</a>
    <a href="#youtube" class="video-tab youtube-tab">YouTube</a>
  </div>

  <div id="youtube" class="video-content">
    <iframe 
      class="video-frame"
      src="https://www.youtube.com/embed/MWSEZiuadjo?si=2EcHHYM5GRGXjVJ4" 
      frameborder="0" 
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
      allowfullscreen>
    </iframe>
  </div>
  
  <div id="bilibili" class="video-content">
    <iframe 
      class="video-frame"
      src="//player.bilibili.com/player.html?bvid=BV1TrdGYfE7M&page=1&autoplay=0&danmaku=0&high_quality=1" 
      scrolling="no" 
      border="0" 
      frameborder="no" 
      framespacing="0" 
      allowfullscreen="true">
    </iframe>
  </div>
</div>

在前面的课程中，我们实现了带有动态彩色边框的标题场景，添加了交互式按钮HUD组件，并实现了安全的场景切换机制。本课将继续完善标题场景，为游戏添加一个Credits页面，展示游戏的制作团队、使用的资源和鸣谢信息，丰富游戏的完整度。

<img src="https://theorhythm.top/gamedev/GE/29-标题场景-Credits页面.PNG" style='width: 800px;' />

## 一、Credits页面的设计需求

Credits页面（制作人员页面）是商业游戏的标准组成部分，它有以下设计需求：

1. **信息展示**：清晰展示游戏的制作人员、使用资源和鸣谢信息
2. **界面整洁**：以易读的方式排版信息，避免杂乱
3. **用户控制**：用户可以方便地打开和关闭Credits页面
4. **适应内容**：页面大小应根据内容自动调整
5. **外部文件存储**：Credits信息最好存储在外部文件中，便于更新

## 二、优化TextLabel类

为了实现动态大小的Credits页面，我们需要对`TextLabel`类进行一些优化，确保文本内容变化时大小也随之更新：

```cpp
// text_label.cpp
void TextLabel::setFont(const std::string &font_path, int font_size)
{
    font_path_ = font_path;
    font_size_ = font_size;
    auto font = game_.getAssetStore()->getFont(font_path_, font_size_);
    if (!ttf_text_) ttf_text_ = game_.createTTF_Text("", font_path_, font_size_);
    TTF_SetTextFont(ttf_text_, font);
    updateSize();  // 更新大小
}

void TextLabel::setFontPath(const std::string &font_path)
{
    font_path_ = font_path;
    // 确保之前已加载字体
    // 然后设置TTF_text里的ttf_font
    auto font = game_.getAssetStore()->getFont(font_path_, font_size_);
    TTF_SetTextFont(ttf_text_, font);
    updateSize();  // 更新大小
}

void TextLabel::setFontSize(int font_size)
{
    font_size_ = font_size;
    auto font = game_.getAssetStore()->getFont(font_path_, font_size_);
    TTF_SetTextFont(ttf_text_, font);
    updateSize();  // 更新大小
}

void TextLabel::setText(std::string ttf_text)
{
    TTF_SetTextString(ttf_text_, ttf_text.c_str(), ttf_text.length());
    updateSize();  // 更新大小
}
```

我们在`TextLabel`类的关键方法中添加了对`updateSize()`的调用，确保在字体、大小或文本内容变化时，文本标签的大小会自动更新。此前，只有在初始化时才会计算大小，这个优化使得文本标签能够更好地适应动态内容变化。

## 三、增强HUDText组件

为了让HUD文本组件能够根据文本内容自动调整背景大小，我们添加一个新方法：

```cpp
// hud_text.h
class HUDText : public ObjectScreen
{
    // ... 已有代码 ...
public:
    // ... 已有方法 ...
    void setBgSizeByText(float margin = 50.0f);
};
```

```cpp
// hud_text.cpp
void HUDText::setBgSizeByText(float margin)
{
    auto text_size = text_label_->getSize();
    setSize(text_size + glm::vec2(margin, margin));
}
```

这个方法会获取文本标签的当前大小，并在其基础上添加一定的边距，作为背景精灵的大小。这确保背景能够完全包围文本内容，并留有美观的边距。

## 四、添加文本文件加载功能

为了从外部文件加载Credits信息，我们在`Game`类中添加一个工具方法：

```cpp
// game.h
public:
    // ... 已有方法 ...
    std::string loadTextFile(const std::string& file_path);
```

```cpp
// game.cpp
#include <fstream>

std::string Game::loadTextFile(const std::string &file_path)
{
    std::ifstream file(file_path);
    std::string line;
    std::string text;
    while (std::getline(file, line)){
        text += line + "\n";
    }
    return text;
}
```

这个方法使用C++的文件流功能，逐行读取文本文件的内容，并将所有行合并为一个字符串返回。这样，我们可以将Credits信息存储在一个易于编辑的外部文本文件中。

## 五、实现Credits页面

现在，我们可以在标题场景中实现Credits页面：

### 1. 扩展场景类

首先，我们在`SceneTitle`类中添加必要的成员变量和方法：

```cpp
// scene_title.h
class HUDText;  // 前向声明

class SceneTitle : public Scene
{
protected:
    // ... 已有成员 ...
    HUDText* credits_text_ = nullptr;  // Credits文本HUD

public:
    // ... 已有方法 ...

private:
    // ... 已有方法 ...
    void checkButtonCredits();  // 检查Credits按钮
};
```

### 2. 初始化Credits组件

在场景初始化方法中，我们加载Credits文本并创建HUD文本组件：

```cpp
// scene_title.cpp
void SceneTitle::init()
{
    Scene::init();
    // ... 创建标题和分数显示 ...
    
    // 创建按钮
    button_start_ = HUDButton::addHUDButtonChild(this, 
        game_.getScreenSize() / 2.0f + glm::vec2(-200, 200), 
        "assets/UI/A_Start1.png", "assets/UI/A_Start2.png", "assets/UI/A_Start3.png", 
        2.0f);
    button_credits_ = HUDButton::addHUDButtonChild(this, 
        game_.getScreenSize() / 2.0f + glm::vec2(0, 200), 
        "assets/UI/A_Credits1.png", "assets/UI/A_Credits2.png", "assets/UI/A_Credits3.png", 
        2.0f);
    button_quit_ = HUDButton::addHUDButtonChild(this, 
        game_.getScreenSize() / 2.0f + glm::vec2(200, 200), 
        "assets/UI/A_Quit1.png", "assets/UI/A_Quit2.png", "assets/UI/A_Quit3.png", 
        2.0f);

    // 加载并创建Credits文本
    auto text = game_.loadTextFile("assets/credits.txt");
    credits_text_ = HUDText::addHUDTextChild(this, text, 
        game_.getScreenSize() / 2.0f, glm::vec2(500, 500), 
        "assets/font/VonwaonBitmap-16px.ttf", 16);
    credits_text_->setBgSizeByText();  // 根据文本内容设置背景大小
    credits_text_->setActive(false);   // 初始时不显示
}
```

这段代码中，我们：
1. 创建了三个按钮：开始游戏、查看Credits和退出游戏
2. 加载了外部文本文件`assets/credits.txt`的内容
3. 创建了一个HUD文本组件显示Credits内容
4. 调用`setBgSizeByText()`自动调整背景大小
5. 将Credits组件设置为初始不可见

### 3. 处理Credits页面的显示和隐藏

我们需要修改事件处理和更新方法，以支持Credits页面的交互：

```cpp
// scene_title.cpp
void SceneTitle::handleEvents(SDL_Event &event)
{
    if (credits_text_->getActive()) {
        if (event.type == SDL_EVENT_MOUSE_BUTTON_UP) { 
            credits_text_->setActive(false);  // 点击任意位置关闭Credits
        }
        return;  // Credits显示时不处理其他事件
    }
    Scene::handleEvents(event);  // 正常处理事件
}

void SceneTitle::update(float dt)
{
    color_timer_ += dt;
    updateColor();
    
    if (credits_text_->getActive()) {
        return;  // Credits显示时不更新其他内容
    }
    
    Scene::update(dt);
    checkButtonQuit();
    checkButtonStart();
    checkButtonCredits();  // 检查Credits按钮
}
```

在事件处理中，如果Credits页面是活跃的：
1. 我们监听鼠标点击事件，点击任意位置可以关闭Credits页面
2. 不再将事件传递给场景的其他组件

在更新方法中，如果Credits页面是活跃的：
1. 我们仍然更新彩色边框（updateColor）
2. 但不更新场景中的其他组件，也不检查按钮状态

### 4. 实现Credits按钮功能

最后，我们实现点击Credits按钮时的处理逻辑：

```cpp
// scene_title.cpp
void SceneTitle::checkButtonCredits()
{
    if (button_credits_->getIsTrigger()){
        credits_text_->setActive(true);  // 显示Credits页面
    }
}
```

这个方法检查Credits按钮是否被触发，如果是，就激活Credits文本组件，使其显示在屏幕上。

## 六、Credits文本文件

Credits信息已经放在了素材文件夹中：`assets/credits.txt`：

```text
游戏素材来自以下网址(作者)，在此一并致谢：

精灵图
https://caz-creates-games.itch.io/ghost
https://master-blazter.itch.io/ghostspritepack

特效
https://bdragon1727.itch.io/750-effect-and-fx-pixel-all
https://pimen.itch.io/fire-spell
https://pimen.itch.io/thunder-spell-effect-02

文字
https://www.fontspace.com/super-shiny-font-f126184

UI
https://kaboff.itch.io/160-cursors-crosshairs-pack-32x32
https://bdragon1727.itch.io/platformer-ui-buttons
https://adwitr.itch.io/pixel-health-bar-asset-pack-2
https://jaqmarti.itch.io/modern-mobile-ui
https://markiro.itch.io/hud-asset-pack
https://candycorrin.itch.io/fantasy-element-ui-icons
https://kenney-assets.itch.io/cursor-pack

音效
https://kasse.itch.io/ui-buttons-sound-effects-pack
https://pixabay.com/sound-effects/big-thunder-clap-99753/
https://pixabay.com/sound-effects/080167-female-scream-02-89290/

音乐
https://games-for-all-7.itch.io/spooky-music
https://poltergasm.itch.io/oh-my-ghost-music
```

这个文本文件包含使用的资源和鸣谢。文件内容可以根据实际需要进行调整。

<img src="https://theorhythm.top/gamedev/GE/29-标题场景-Credits页面截图.png" style='width: 800px;' />

## 七、运行时效果

当玩家点击Credits按钮时，会显示一个包含游戏制作信息的对话框。游戏其他部分将停止响应输入，直到玩家点击任意位置关闭Credits页面。这种模态对话框的设计确保了用户在阅读Credits信息时不会被其他游戏元素干扰。

## 八、设计要点

这个Credits页面实现涉及几个重要的设计要点：

1. **模态对话框**：Credits页面是一个模态对话框，显示时会阻止对底层UI的交互
2. **内容外部化**：将Credits信息存储在外部文本文件中，便于维护和更新
3. **自适应大小**：根据文本内容自动调整背景大小，确保所有内容可见
4. **简单交互**：提供直观的打开方式（按钮）和关闭方式（点击任意位置）
5. **分离关注点**：游戏逻辑和UI展示分离，确保代码的清晰性和可维护性

## 总结

在本课中，我们实现了游戏标题场景的Credits页面功能：

1. 优化了`TextLabel`类，使其在内容变化时自动更新大小
2. 增强了`HUDText`组件，添加了自动调整背景大小的功能
3. 添加了从外部文件加载文本内容的功能
4. 实现了Credits页面的显示、隐藏和交互逻辑
5. 创建了一个模态对话框设计，确保良好的用户体验

Credits页面是游戏完整性的重要组成部分，它不仅展示了游戏的制作信息，还是对所有参与游戏开发和提供支持的人员的一种尊重和感谢。通过本课的实现，我们的游戏UI系统更加完善，为用户提供了更全面的游戏体验。

## 练习

1. 为Credits页面添加滚动功能，以支持更长的内容展示
2. 实现Credits信息的淡入淡出动画效果
3. 扩展Credits页面，添加社交媒体链接或联系方式
4. 创建一个通用的弹出对话框类，能够显示不同类型的内容（文本、图像等）
5. 为Credits页面添加背景音乐，增强氛围