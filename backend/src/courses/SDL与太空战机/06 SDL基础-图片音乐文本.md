# SDL基础-图片音乐文本

<link rel="stylesheet" href="/css/videoStyles.css" />

<div class="video-container">
  <div class="video-tabs">
    <a href="#bilibili" class="video-tab bilibili-tab">哔哩哔哩</a>
    <a href="#youtube" class="video-tab youtube-tab">YouTube</a>
  </div>

  <div id="youtube" class="video-content">
    <iframe 
      class="video-frame"
      src="https://www.youtube.com/embed/h0ZgrCP8DhE?si=vu81bDvI2p_C72Uh" 
      frameborder="0" 
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
      allowfullscreen>
    </iframe>
  </div>
  <div id="bilibili" class="video-content">
    <iframe 
      class="video-frame"
      src="//player.bilibili.com/player.html?bvid=BV1Sg6WYREjp&page=1&autoplay=0&danmaku=0&high_quality=1" 
      scrolling="no" 
      border="0" 
      frameborder="no" 
      framespacing="0" 
      allowfullscreen="true">
    </iframe>
  </div>
</div>

在上一课中，我们学习了SDL的基本框架和原理，创建了一个简单的应用程序，它能显示一个红色矩形。在本课中，我们将扩展这个程序，学习如何使用SDL的扩展库来处理图片、音乐和文本，这些是游戏开发中不可或缺的元素。

<img src="https://theorhythm.top/gamedev/SS/6 SDL基础-图片音乐文本.PNG" style='width: 800px;' />

## 扩展库简介

SDL本身只提供基本的窗口管理和图形绘制功能，而通过其扩展库，我们可以实现更丰富的多媒体功能：

1. **SDL_image**：用于加载多种格式的图像文件（PNG、JPG、BMP等）
2. **SDL_mixer**：用于音效和音乐播放
3. **SDL_ttf**：用于字体渲染和文本显示

这些扩展库需要单独安装和初始化，但它们与SDL核心库共享相同的设计理念和API风格。

## 更新CMake配置

首先，我们需要更新`CMakeLists.txt`文件，添加对这些扩展库的依赖：

```cmake
# 查找并载入Cmake预设
find_package(SDL2 REQUIRED)
find_package(SDL2_image REQUIRED)
find_package(SDL2_mixer REQUIRED)
find_package(SDL2_ttf REQUIRED)

# 添加可执行文件
add_executable(${TARGET} main.cpp)

# 链接库
target_link_libraries(${TARGET}
                        ${SDL2_LIBRARIES}
                        SDL2_image::SDL2_image
                        SDL2_mixer::SDL2_mixer
                        SDL2_ttf::SDL2_ttf
                        )
```

与上一课相比，我们添加了三个新的`find_package`命令来查找SDL_image、SDL_mixer和SDL_ttf库，并在`target_link_libraries`中链接这些库。

## 图片处理 (SDL_image)

### 初始化SDL_image

在使用SDL_image之前，我们需要先初始化它：

```cpp
#include <SDL_image.h>

// SDL_Image初始化
if (IMG_Init(IMG_INIT_PNG | IMG_INIT_JPG) != (IMG_INIT_PNG | IMG_INIT_JPG)) {
    std::cerr << "IMG_Init Error: " << IMG_GetError() << std::endl;
    return 1;
}
```

`IMG_Init`函数用于初始化SDL_image库，参数指定了我们想要支持的图像格式。在这个例子中，我们初始化了对PNG和JPG格式的支持。

### 加载和显示图片

加载图片并创建纹理的代码如下：

```cpp
// 加载图片
SDL_Texture *texture = IMG_LoadTexture(renderer, "assets/image/bg.png");

// 在游戏循环中显示图片
SDL_Rect dstrect = {200, 200, 200, 200};
SDL_RenderCopy(renderer, texture, NULL, &dstrect);
```

`IMG_LoadTexture`函数从文件加载图像并直接创建一个纹理。我们需要提供渲染器和图像文件的路径。

`SDL_RenderCopy`函数将纹理渲染到指定的矩形区域。参数为：渲染器、纹理、源矩形（NULL表示整个纹理）和目标矩形。

### 清理图片资源

完成后，需要释放纹理资源并退出SDL_image：

```cpp
// 清理图片资源
SDL_DestroyTexture(texture);
IMG_Quit();
```

## 音乐处理 (SDL_mixer)

### 初始化SDL_mixer

在使用SDL_mixer之前，我们需要初始化音频系统：

```cpp
#include <SDL_mixer.h>

// SDL_Mixer初始化
if (Mix_OpenAudio(44100, MIX_DEFAULT_FORMAT, 2, 2048) < 0) {
    std::cerr << "Mix_OpenAudio Error: " << Mix_GetError() << std::endl;
    return 1;
}
```

`Mix_OpenAudio`函数初始化音频子系统，参数分别是：
- 采样率（44100Hz是CD音质）
- 音频格式（MIX_DEFAULT_FORMAT使用默认格式）
- 声道数（2表示立体声）
- 缓冲区大小（以字节为单位）

### 加载和播放音乐

加载和播放音乐的代码如下：

```cpp
// 读取音乐
Mix_Music *music = Mix_LoadMUS("assets/music/03_Racing_Through_Asteroids_Loop.ogg");
// 播放音乐
Mix_PlayMusic(music, -1);
```

`Mix_LoadMUS`函数从文件加载音乐。SDL_mixer支持多种音乐格式，包括MP3、OGG、FLAC等。

`Mix_PlayMusic`函数开始播放音乐。第二个参数是循环次数，-1表示无限循环。

### 清理音频资源

完成后，需要释放音乐资源并关闭音频系统：

```cpp
// 清理音乐资源
Mix_FreeMusic(music);
Mix_CloseAudio();
Mix_Quit();
```

## 文本处理 (SDL_ttf)

### 初始化SDL_ttf

在使用SDL_ttf之前，我们需要初始化字体系统：

```cpp
#include <SDL_ttf.h>

// SDL_TTF初始化
if (TTF_Init() != 0) {
    std::cerr << "TTF_Init Error: " << TTF_GetError() << std::endl;
    return 1;
}
```

### 加载字体和渲染文本

加载字体并渲染文本的代码如下：

```cpp
// 加载字体
TTF_Font *font = TTF_OpenFont("assets/font/VonwaonBitmap-16px.ttf", 24);
// 创建文本纹理
SDL_Color color = {255, 255, 255, 255};
SDL_Surface *surface = TTF_RenderUTF8_Solid(font, "Hello, SDL! 中文也可以", color);
SDL_Texture *textTexture = SDL_CreateTextureFromSurface(renderer, surface);
```

`TTF_OpenFont`函数加载TrueType字体文件，参数是字体文件路径和字体大小。

`TTF_RenderUTF8_Solid`函数使用指定的字体、文本内容和颜色渲染文本，生成一个表面（surface）对象。注意这里使用的是UTF-8编码，支持中文等非ASCII字符。

`SDL_CreateTextureFromSurface`函数将表面转换为纹理，以便使用渲染器绘制。

### 显示文本

在游戏循环中显示文本的代码如下：

```cpp
// 画文本
SDL_Rect textRect = {300, 300, surface->w, surface->h};
SDL_RenderCopy(renderer, textTexture, NULL, &textRect);
```

### 清理字体资源

完成后，需要释放字体和文本相关资源，并退出SDL_ttf：

```cpp
// 清理字体资源
SDL_FreeSurface(surface);
SDL_DestroyTexture(textTexture);
TTF_CloseFont(font);
TTF_Quit();
```

## 完整示例

下面是一个集成了图片、音乐和文本的完整示例程序：

```cpp
#include <iostream>
#include <SDL.h>
#include <SDL_image.h>
#include <SDL_mixer.h>
#include <SDL_ttf.h>

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

    // SDL_Image初始化
    if (IMG_Init(IMG_INIT_PNG | IMG_INIT_JPG) != (IMG_INIT_PNG | IMG_INIT_JPG)) {
        std::cerr << "IMG_Init Error: " << IMG_GetError() << std::endl;
        return 1;
    }
    // 加载图片
    SDL_Texture *texture = IMG_LoadTexture(renderer, "assets/image/bg.png");

    // SDL_Mixer初始化
    if (Mix_OpenAudio(44100, MIX_DEFAULT_FORMAT, 2, 2048) < 0) {
        std::cerr << "Mix_OpenAudio Error: " << Mix_GetError() << std::endl;
        return 1;
    }

    // 读取音乐
    Mix_Music *music = Mix_LoadMUS("assets/music/03_Racing_Through_Asteroids_Loop.ogg");
    // 播放音乐
    Mix_PlayMusic(music, -1);

    // SDL_TTF初始化
    if (TTF_Init() != 0) {
        std::cerr << "TTF_Init Error: " << TTF_GetError() << std::endl;
        return 1;
    }
    // 加载字体
    TTF_Font *font = TTF_OpenFont("assets/font/VonwaonBitmap-16px.ttf", 24);
    // 创建文本纹理
    SDL_Color color = {255, 255, 255, 255};
    SDL_Surface *surface = TTF_RenderUTF8_Solid(font, "Hello, SDL! 中文也可以", color);
    SDL_Texture *textTexture = SDL_CreateTextureFromSurface(renderer, surface);

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
        

        // 画图片
        SDL_Rect dstrect = {200, 200, 200, 200};
        SDL_RenderCopy(renderer, texture, NULL, &dstrect);

        // 画文本
        SDL_Rect textRect = {300, 300, surface->w, surface->h};
        SDL_RenderCopy(renderer, textTexture, NULL, &textRect);
        SDL_SetRenderDrawColor(renderer, 0, 0, 0, 255); 

        // 更新屏幕
        SDL_RenderPresent(renderer);
    }

    // 清理图片资源
    SDL_DestroyTexture(texture);
    IMG_Quit();

    // 清理音乐资源
    Mix_FreeMusic(music);
    Mix_CloseAudio();
    Mix_Quit();

    // 清理字体资源
    SDL_FreeSurface(surface);
    SDL_DestroyTexture(textTexture);
    TTF_CloseFont(font);
    TTF_Quit();

    // 清理并退出
    SDL_DestroyRenderer(renderer);
    SDL_DestroyWindow(window);
    SDL_Quit();

    return 0;
}
```

> 常见问题：如果你无法正确显示中文，一方面是文件编码要选择`utf8`，另一方面是Windows区域设置的地方也要勾选`utf8`
<div style="display: flex; gap: 10px;">
  <img src="https://theorhythm.top/gamedev/SS/6-utf8问题1.png" width="500" />
  <img src="https://theorhythm.top/gamedev/SS/6-utf8问题2.png" width="300" />
</div>

## 资源管理的重要性

在游戏开发中，正确管理资源（图片、音乐、字体等）至关重要：

1. **加载时机**：根据需要加载资源，避免一次性加载所有资源导致启动缓慢
2. **释放时机**：不再需要的资源应及时释放，避免内存泄漏
3. **错误处理**：应检查资源加载是否成功，并提供适当的错误处理

## 小结

在本课中，我们学习了如何使用SDL的三个重要扩展库：

- **SDL_image**：加载和显示各种格式的图像
- **SDL_mixer**：播放背景音乐和音效
- **SDL_ttf**：渲染文本和显示字体

这些功能是几乎所有游戏都必需的。通过组合这些库，我们可以创建具有丰富多媒体内容的游戏。

在下一课中，我们将开始构建我们的游戏框架，使用面向对象的方法组织代码，为开发复杂的游戏奠定基础。

## 练习

1. 尝试加载不同格式的图像文件（PNG、JPG、BMP等）
2. 实验不同的文本渲染方法（Solid、Shaded、Blended）并观察差异
3. 添加音效播放功能（使用Mix_LoadWAV和Mix_PlayChannel函数）
4. 尝试改变文本颜色、大小和字体
5. 创建一个简单的动画，使图像在屏幕上移动
