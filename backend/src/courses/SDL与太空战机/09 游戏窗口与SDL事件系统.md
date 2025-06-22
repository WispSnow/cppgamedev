# 游戏窗口与SDL事件系统

<link rel="stylesheet" href="/css/videoStyles.css" />

<div class="video-container">
  <div class="video-tabs">
    <a href="#bilibili" class="video-tab bilibili-tab">哔哩哔哩</a>
    <a href="#youtube" class="video-tab youtube-tab">YouTube</a>
  </div>

  <div id="youtube" class="video-content">
    <iframe 
      class="video-frame"
      src="https://www.youtube.com/embed/nHXq4DLc26I?si=Z9BNFoLq3oIb8Odl" 
      frameborder="0" 
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
      allowfullscreen>
    </iframe>
  </div>

  <div id="bilibili" class="video-content">
    <iframe 
      class="video-frame"
      src="//player.bilibili.com/player.html?bvid=BV1yj6gYVEWF&page=1&autoplay=0&danmaku=0&high_quality=1" 
      scrolling="no" 
      border="0" 
      frameborder="no" 
      framespacing="0" 
      allowfullscreen="true">
    </iframe>
  </div>
</div>

在上一课中，我们搭建了游戏的基本框架，创建了`Game`类、`Scene`基类和`SceneMain`子类。但是，这个框架还不能运行，因为我们没有实现SDL的初始化、窗口创建和事件处理。在本课中，我们将完善这些部分，使游戏框架能够正常运行。

## 完善Game类

首先，我们需要完善`Game`类，添加窗口和渲染器相关的成员变量和方法。

<img src="https://theorhythm.top/gamedev/SS/9 游戏窗口.PNG" style='width: 800px;' />

### 更新Game.h

在`Game.h`中，我们添加了窗口和渲染器相关的成员变量：

```cpp
// Game.h
#ifndef GAME_H
#define GAME_H

#include "Scene.h"
#include "SDL.h"

class Game
{
public:
    Game();
    ~Game();
    void run();
    void init();
    void clean();
    void changeScene(Scene* scene);

    void handleEvent(SDL_Event *event);
    void update();
    void render();
private:
    bool isRunning = true;
    Scene* currentScene = nullptr;
    SDL_Window* window = nullptr;
    SDL_Renderer* renderer = nullptr;
    int windowWidth = 600;
    int windowHeight = 800;
};

#endif
```

与上一课相比，我们添加了以下新成员：

1. **SDL_Window* window**: 指向SDL窗口的指针
2. **SDL_Renderer* renderer**: 指向SDL渲染器的指针
3. **windowWidth和windowHeight**: 窗口的宽度和高度
4. **三个新方法**: handleEvent(), update(), 和render()

这些新的方法对应于游戏循环的三个主要阶段，它们将在Game.cpp中实现，并在run()方法中调用。

### 更新Game.cpp

接下来，我们完善`Game.cpp`文件，实现SDL的初始化、窗口创建和事件处理：

```cpp
// Game.cpp
#include "Game.h"
#include "SceneMain.h"
#include <SDL.h>

Game::Game()
{
}

Game::~Game()
{
    clean();
}

void Game::run()
{
    while (isRunning)
    {
        SDL_Event event;
        handleEvent(&event);
        
        update();

        render();
    }
    
}

void Game::init()
{
    // SDL 初始化
    if (SDL_Init(SDL_INIT_EVERYTHING) != 0){
        SDL_LogError(SDL_LOG_CATEGORY_ERROR, "SDL could not initialize! SDL_Error: %s\n", SDL_GetError());
        isRunning = false;
    }
    // 创建窗口
    window = SDL_CreateWindow("SDL Tutorial", SDL_WINDOWPOS_CENTERED, SDL_WINDOWPOS_CENTERED, windowWidth, windowHeight, SDL_WINDOW_SHOWN);
    if (window == nullptr) {
        SDL_LogError(SDL_LOG_CATEGORY_ERROR, "Window could not be created! SDL_Error: %s\n", SDL_GetError());
        isRunning = false;
    }
    // 创建渲染器
    renderer = SDL_CreateRenderer(window, -1, SDL_RENDERER_ACCELERATED);
    if (renderer == nullptr) {
        SDL_LogError(SDL_LOG_CATEGORY_ERROR, "Renderer could not be created! SDL_Error: %s\n", SDL_GetError());
        isRunning = false;
    }
    currentScene = new SceneMain();
    currentScene->init();
}

void Game::clean()
{
    if (currentScene != nullptr)
    {
        currentScene->clean();
        delete currentScene;
    }

    SDL_DestroyRenderer(renderer);
    SDL_DestroyWindow(window);
    SDL_Quit();
}

void Game::changeScene(Scene *scene)
{
    if (currentScene != nullptr)
    {
        currentScene->clean();
        delete currentScene;
    }
    currentScene = scene;
    currentScene->init();
}

void Game::handleEvent(SDL_Event *event)
{
    while (SDL_PollEvent(event))
    {
        if (event->type == SDL_QUIT)
        {
            isRunning = false;
        }
        currentScene->handleEvent(event);
    }
}

void Game::update()
{
    currentScene->update();
}

void Game::render()
{
    // 清空
    SDL_RenderClear(renderer);

    currentScene->render();
    // 显示更新
    SDL_RenderPresent(renderer);
}
```

相比上一课，我们在`Game.cpp`中做了以下重要改进：

1. **初始化SDL**：在init()方法中，我们使用SDL_Init()初始化SDL，并检查是否成功。

2. **创建窗口和渲染器**：使用SDL_CreateWindow()和SDL_CreateRenderer()创建游戏窗口和渲染器。

3. **资源清理**：在clean()方法中，我们添加了对窗口和渲染器的清理代码。

4. **分离游戏循环**：将游戏循环中的三个主要步骤分离到单独的方法中：handleEvent(), update(), 和render()。

5. **处理SDL事件**：在handleEvent()方法中，我们使用SDL_PollEvent()获取并处理SDL事件，特别是检测SDL_QUIT事件以便正确关闭游戏。

6. **实例化主场景**：在init()方法的最后，我们创建了一个SceneMain实例作为初始场景。

## 更新main.cpp

最后，我们更新`main.cpp`文件，创建Game实例并运行游戏：

```cpp
// main.cpp
#include <iostream>
#include <SDL.h>
#include <SDL_image.h>
#include <SDL_mixer.h>
#include <SDL_ttf.h>
#include "Game.h"

int main(int, char**) {
    Game game;
    game.init();
    game.run();
    
    return 0;
}
```

这个main.cpp文件非常简单：创建一个Game实例，初始化它，然后运行游戏循环。所有的复杂性都被封装在Game类中，使主函数保持简洁。

## SDL事件系统

<img src="https://theorhythm.top/gamedev/SS/9 SDL事件系统.PNG" style='width: 800px;' />

SDL事件系统是SDL处理用户输入和系统通知的机制。它基于一个事件队列，当发生某些事件（如按键、鼠标移动、窗口调整大小等）时，相应的事件会被加入队列。我们的程序可以通过SDL_PollEvent()函数从队列中获取并处理这些事件。

### SDL_Event结构体

SDL_Event是一个联合体，可以表示多种不同类型的事件。它的定义大致如下：

```cpp
typedef union SDL_Event {
    Uint32 type;                // 事件类型
    SDL_WindowEvent window;     // 窗口事件
    SDL_KeyboardEvent key;      // 键盘事件
    SDL_MouseMotionEvent motion; // 鼠标移动事件
    SDL_MouseButtonEvent button; // 鼠标按钮事件
    SDL_MouseWheelEvent wheel;   // 鼠标滚轮事件
    // ... 其他事件类型
} SDL_Event;
```

通过检查事件的type字段，我们可以确定它是哪种类型的事件，然后使用相应的结构体成员来访问该事件的详细信息。

### 常见的SDL事件类型

以下是一些常见的SDL事件类型：

1. **SDL_QUIT**：当用户关闭窗口时触发。
2. **SDL_KEYDOWN/SDL_KEYUP**：键盘按键按下/释放事件。
3. **SDL_MOUSEMOTION**：鼠标移动事件。
4. **SDL_MOUSEBUTTONDOWN/SDL_MOUSEBUTTONUP**：鼠标按钮按下/释放事件。
5. **SDL_WINDOWEVENT**：窗口事件，如大小改变、获得/失去焦点等。

### 处理事件的示例

下面是如何处理键盘事件的示例：

```cpp
SDL_Event event;
while (SDL_PollEvent(&event)) {
    switch (event.type) {
        case SDL_QUIT:
            // 处理退出事件
            isRunning = false;
            break;
        case SDL_KEYDOWN:
            // 处理键盘按下事件
            if (event.key.keysym.sym == SDLK_ESCAPE) {
                isRunning = false;
            }
            break;
        case SDL_MOUSEBUTTONDOWN:
            // 处理鼠标按下事件
            int x = event.button.x;
            int y = event.button.y;
            // 使用鼠标位置...
            break;
    }
}
```

在我们的游戏框架中，我们在Game::handleEvent()方法中处理全局事件（如退出），然后将事件传递给当前场景进行更具体的处理。

## 测试运行

在完成以上修改后，我们的游戏框架已经可以正常运行了。当你编译并运行程序时，应该会看到一个窗口出现。虽然窗口中暂时没有任何内容，但这标志着我们的游戏框架已经成功搭建。

在接下来的课程中，我们将继续完善SceneMain类，添加游戏对象和实际的游戏逻辑。

## 总结

在本课中，我们完善了游戏框架，实现了以下关键功能：

1. **SDL初始化**：初始化SDL库，为游戏开发做准备。
2. **窗口和渲染器**：创建游戏窗口和渲染器，为显示游戏内容提供基础。
3. **事件处理**：实现SDL事件处理，使游戏能够响应用户输入。
4. **游戏循环分离**：将游戏循环的三个主要步骤分离到单独的方法中，使代码更清晰、更易于维护。

这些改进使我们的游戏框架更加完整，为后续添加具体的游戏功能打下了坚实的基础。

## 练习

1. 尝试修改窗口标题和大小，观察效果。

2. 实现更多类型的事件处理，例如，当按下特定键时，在控制台输出消息。

3. 添加SDL_Image、SDL_Mixer和SDL_TTF的初始化代码，为后续使用这些库做准备。

4. 思考：如何在Game类中提供对渲染器的访问，使场景类能够使用它进行绘制？

5. 挑战：修改Game类，使其成为一个单例模式（Singleton），确保整个程序中只有一个Game实例。
