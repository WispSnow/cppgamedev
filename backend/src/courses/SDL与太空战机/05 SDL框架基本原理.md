# SDL框架基本原理

<link rel="stylesheet" href="/css/videoStyles.css" />

<div class="video-container">
  <div class="video-tabs">
    <a href="#bilibili" class="video-tab bilibili-tab">哔哩哔哩</a>
    <a href="#youtube" class="video-tab youtube-tab">YouTube</a>
  </div>

  <div id="youtube" class="video-content">
    <iframe 
      class="video-frame"
      src="https://www.youtube.com/embed/9N5Lt1ZQ1-A?si=Rw8VpISsrQfIPVTC" 
      frameborder="0" 
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
      allowfullscreen>
    </iframe>
  </div>

  <div id="bilibili" class="video-content">
    <iframe 
      class="video-frame"
      src="//player.bilibili.com/player.html?bvid=BV1drCHYiERQ&page=1&autoplay=0&danmaku=0&high_quality=1" 
      scrolling="no" 
      border="0" 
      frameborder="no" 
      framespacing="0" 
      allowfullscreen="true">
    </iframe>
  </div>
</div>

在前面的课程中，我们完成了CMake的配置，使我们能够在不同的平台上构建项目。现在我们将开始学习SDL（Simple DirectMedia Layer）的基本原理，这是我们开发游戏的核心框架。

<img src="https://theorhythm.top/gamedev/SS/5 SDL框架原理.PNG" style='width: 800px;' />

## SDL简介

SDL（Simple DirectMedia Layer）是一个跨平台的开发库，旨在提供对音频、键盘、鼠标、游戏手柄和图形硬件的低级访问。SDL被广泛用于游戏开发、多媒体应用、模拟器等，它支持Windows、macOS、Linux、iOS和Android等多种平台。

SDL提供的主要功能包括：
- 窗口和渲染器管理
- 事件处理（键盘、鼠标等输入）
- 图形渲染
- 音频播放
- 计时器功能
- 多线程支持

### SDL的基本架构

SDL采用了分层架构设计，主要包括以下几个部分：

1. **SDL Core**：提供基本的窗口管理、事件处理和渲染功能
2. **SDL_image**：扩展库，用于加载多种格式的图像文件
3. **SDL_mixer**：扩展库，用于音效和音乐播放
4. **SDL_ttf**：扩展库，用于字体渲染
5. **SDL_net**：扩展库，提供网络功能

在本课程中，我们将从最基本的SDL Core开始，逐步引入其他扩展库。

## SDL基本流程

使用SDL开发游戏通常遵循以下基本流程：

1. **初始化**：初始化SDL及其子系统
2. **创建窗口和渲染器**：创建显示游戏内容的窗口和用于渲染的渲染器
3. **游戏循环**：
   - 处理输入事件（键盘、鼠标等）
   - 更新游戏状态
   - 渲染游戏画面
4. **清理和退出**：释放资源并退出SDL

让我们通过一个简单的例子来理解这个流程。

## 示例代码

下面是一个基本的SDL示例程序，它创建一个窗口并在其中绘制一个红色矩形：

```cpp
#include <iostream>
#include <SDL.h>

int main(int, char**) {
    std::cout << "Hello, World!" << std::endl;
    // SDL初始化
    if (SDL_Init(SDL_INIT_EVERYTHING) != 0) {
        std::cerr << "SDL_Init Error: " << SDL_GetError() << std::endl;
        return 1;
    }
    // 创建窗口
    SDL_Window *window = SDL_CreateWindow("Hello World!", 100, 100, 800, 600, SDL_WINDOW_SHOWN);
    // 创建渲染器
    SDL_Renderer *renderer = SDL_CreateRenderer(window, -1, SDL_RENDERER_ACCELERATED);

    // 渲染循环
    while (true) {
        SDL_Event event;
        if (SDL_PollEvent(&event)) {
            if (event.type == SDL_QUIT) {
                break;
            }
        }

        // 清屏
        SDL_RenderClear(renderer);
        // 画一个长方形
        SDL_Rect rect = {100, 100, 200, 200};
        SDL_SetRenderDrawColor(renderer, 255, 0, 0, 255);
        SDL_RenderFillRect(renderer, &rect);
        SDL_SetRenderDrawColor(renderer, 255, 255, 255, 255);

        // 更新屏幕
        SDL_RenderPresent(renderer);
    }

    // 清理并退出
    SDL_DestroyRenderer(renderer);
    SDL_DestroyWindow(window);
    SDL_Quit();

    return 0;
}
```

让我们详细分析这段代码：

### 1. 初始化SDL

```cpp
if (SDL_Init(SDL_INIT_EVERYTHING) != 0) {
    std::cerr << "SDL_Init Error: " << SDL_GetError() << std::endl;
    return 1;
}
```

`SDL_Init`函数用于初始化SDL库。`SDL_INIT_EVERYTHING`参数表示初始化所有SDL子系统，包括视频、音频、计时器等。如果初始化失败，`SDL_Init`返回非零值，我们输出错误信息并退出程序。

### 2. 创建窗口和渲染器

```cpp
SDL_Window *window = SDL_CreateWindow("Hello World!", 100, 100, 800, 600, SDL_WINDOW_SHOWN);
SDL_Renderer *renderer = SDL_CreateRenderer(window, -1, SDL_RENDERER_ACCELERATED);
```

`SDL_CreateWindow`函数创建一个窗口，参数分别是：窗口标题、窗口x坐标、窗口y坐标、窗口宽度、窗口高度和窗口标志。`SDL_WINDOW_SHOWN`表示窗口创建后立即显示。

`SDL_CreateRenderer`函数创建一个渲染器，与指定的窗口关联。`-1`参数表示使用第一个支持的渲染驱动，`SDL_RENDERER_ACCELERATED`表示使用硬件加速的渲染。

### 3. 游戏循环

```cpp
while (true) {
    SDL_Event event;
    if (SDL_PollEvent(&event)) {
        if (event.type == SDL_QUIT) {
            break;
        }
    }

    // 清屏
    SDL_RenderClear(renderer);
    // 画一个长方形
    SDL_Rect rect = {100, 100, 200, 200};
    SDL_SetRenderDrawColor(renderer, 255, 0, 0, 255);
    SDL_RenderFillRect(renderer, &rect);
    SDL_SetRenderDrawColor(renderer, 255, 255, 255, 255);

    // 更新屏幕
    SDL_RenderPresent(renderer);
}
```

这是游戏的主循环，它执行以下操作：

- 事件处理：使用`SDL_PollEvent`检查是否有新的事件。如果收到`SDL_QUIT`事件（例如用户点击窗口的关闭按钮），则退出循环。
- 清屏：使用`SDL_RenderClear`清除渲染器的内容，准备绘制新的帧。
- 绘制内容：设置绘制颜色为红色（RGB：255,0,0，不透明度：255），然后绘制一个填充矩形。
- 更新屏幕：使用`SDL_RenderPresent`将渲染器的内容更新到屏幕上。

### 4. 清理和退出

```cpp
SDL_DestroyRenderer(renderer);
SDL_DestroyWindow(window);
SDL_Quit();
```

在程序结束时，我们需要释放所有SDL资源：
- `SDL_DestroyRenderer`销毁渲染器
- `SDL_DestroyWindow`销毁窗口
- `SDL_Quit`关闭SDL库

## 双缓冲渲染

SDL使用双缓冲渲染技术来避免画面闪烁。渲染器有两个缓冲区：
- 前缓冲区：当前显示在屏幕上的内容
- 后缓冲区：我们正在绘制的新帧

当我们调用`SDL_RenderPresent`时，前后缓冲区交换，后缓冲区的内容显示在屏幕上，而前缓冲区变成新的后缓冲区，用于绘制下一帧。

## 坐标系统

SDL使用的坐标系统以窗口的左上角为原点(0,0)，x轴向右增长，y轴向下增长。这与数学中常用的坐标系统（y轴向上增长）不同，需要特别注意。

## 更新CMake配置

与前一课相比，我们的CMakeLists.txt文件做了微小的调整，主要是修改了链接库的方式：

```cmake
target_link_libraries(${TARGET}
                        ${SDL2_LIBRARIES}
                        )
```

我们使用`${SDL2_LIBRARIES}`变量来链接SDL2库，这确保了我们在任何平台下都能正确链接所有必要的SDL2库文件。

## 小结

在本课中，我们学习了SDL的基本概念和架构，以及如何使用SDL创建一个简单的图形应用程序。我们了解了SDL的基本流程：初始化、创建窗口和渲染器、游戏循环以及清理和退出。

在下一课中，我们将学习如何使用SDL_image加载图像文件，以及如何在我们的游戏中显示图像。我们还将学习如何使用SDL_mixer播放音效和音乐，以及如何使用SDL_ttf显示文本。

## 练习

1. 尝试修改示例程序，改变矩形的位置、大小和颜色
2. 尝试绘制多个不同颜色的图形（矩形、直线等）
