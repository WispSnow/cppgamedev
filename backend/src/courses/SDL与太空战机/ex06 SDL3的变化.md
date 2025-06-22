# SDL3的变化

<link rel="stylesheet" href="/css/videoStyles.css" />

<div class="video-container">
  <div class="video-tabs">
    <a href="#bilibili" class="video-tab bilibili-tab">哔哩哔哩</a>
    <a href="#youtube" class="video-tab youtube-tab">YouTube</a>
  </div>

  <div id="youtube" class="video-content">
    <iframe 
      class="video-frame"
      src="https://www.youtube.com/embed/KgaCqpcle-Q?si=98sUqRnvCoxsyKt3" 
      frameborder="0" 
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
      allowfullscreen>
    </iframe>
  </div>

  <div id="bilibili" class="video-content">
    <iframe 
      class="video-frame"
      src="//player.bilibili.com/player.html?bvid=BV1FcNEe9ERo&page=1&autoplay=0&danmaku=0&high_quality=1" 
      scrolling="no" 
      border="0" 
      frameborder="no" 
      framespacing="0" 
      allowfullscreen="true">
    </iframe>
  </div>
</div>

在前面的第6课中，我们学习了如何使用SDL2库及其扩展库（SDL_image、SDL_mixer和SDL_ttf）来开发游戏中的图像、音乐和文本功能。随着SDL3的发布，SDL库进行了一些重要的更新和改进。本附加课程将帮助你了解从SDL2迁移到SDL3时需要注意的主要变化。

## 回顾：SDL2基础

首先，让我们简要回顾一下我们在SDL2中是如何处理图像、音乐和文本的。以下是我们在第6课中使用SDL2实现的完整代码：

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

对应的CMakeLists.txt文件如下：

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

## SDL3的主要变化

SDL3相对于SDL2进行了许多变化，使API更加一致、灵活和现代化。让我们看看主要的区别：

### 1. 头文件路径和命名变化

在SDL3中，头文件的路径和库的命名发生了变化：

SDL2:
```cpp
#include <SDL.h>
#include <SDL_image.h>
#include <SDL_mixer.h>
#include <SDL_ttf.h>
```

SDL3:
```cpp
#include <SDL3/SDL.h>
#include <SDL3_image/SDL_image.h>
#include <SDL3_mixer/SDL_mixer.h>
#include <SDL3_ttf/SDL_ttf.h>
```

### 2. 初始化和错误处理逻辑相反

SDL3中初始化函数的返回值逻辑与SDL2相反，SDL3的初始化函数在成功时返回0，失败时返回非0：

SDL2:
```cpp
if (SDL_Init(SDL_INIT_EVERYTHING) != 0) {
    // 错误处理
}
```

SDL3:
```cpp
if (!SDL_Init(SDL_INIT_AUDIO | SDL_INIT_VIDEO)) {
    // 错误处理
}
```

注意SDL3中更推荐明确指定需要的子系统，而不是使用`SDL_INIT_EVERYTHING`。

### 3. 窗口创建参数变化

SDL3简化了窗口创建函数的参数：

SDL2:
```cpp
SDL_Window *window = SDL_CreateWindow("Hello World!", 100, 100, 800, 600, SDL_WINDOW_SHOWN);
```

SDL3:
```cpp
SDL_Window *window = SDL_CreateWindow("Hello World!", 800, 600, 0);
```

在SDL3中，创建窗口时只需指定标题、宽度和高度，窗口标志作为最后一个参数（这里是0，表示默认标志）。窗口位置变为自动居中。

### 4. 渲染器创建参数变化

渲染器创建函数的参数也有所简化：

SDL2:
```cpp
SDL_Renderer *renderer = SDL_CreateRenderer(window, -1, SDL_RENDERER_ACCELERATED);
```

SDL3:
```cpp
SDL_Renderer *renderer = SDL_CreateRenderer(window, NULL);
```

SDL3默认使用硬件加速，无需显式指定。

### 5. SDL_image不再需要手动初始化

在SDL3中，SDL_image不再需要手动调用`IMG_Init`函数：

SDL2:
```cpp
if (IMG_Init(IMG_INIT_PNG | IMG_INIT_JPG) != (IMG_INIT_PNG | IMG_INIT_JPG)) {
    // 错误处理
}
```

SDL3中可以直接使用图像加载功能，不需要上述代码。

### 6. 音频系统初始化变化

SDL3的音频初始化参数大幅简化：

SDL2:
```cpp
if (Mix_OpenAudio(44100, MIX_DEFAULT_FORMAT, 2, 2048) < 0) {
    // 错误处理
}
```

SDL3:
```cpp
if (!Mix_OpenAudio(0, NULL)) {
    // 错误处理
}
```

在SDL3中，使用0和NULL参数表示使用默认的音频配置。

### 7. 文本渲染函数变化

文本渲染函数添加了额外的参数：

SDL2:
```cpp
SDL_Surface *surface = TTF_RenderUTF8_Solid(font, "Hello, SDL! 中文也可以", color);
```

SDL3:
```cpp
SDL_Surface *surface = TTF_RenderText_Solid(font, "Hello, SDL! 中文也可以", 0, color);
```

注意SDL3中使用了`TTF_RenderText_Solid`并增加了一个参数，这个额外的参数用于指定文本渲染的长度（这里是0，表示不限制长度）。

### 8. 使用浮点矩形进行渲染

SDL3引入了浮点矩形(SDL_FRect)替代整数矩形(SDL_Rect)，提供更精确的定位：

SDL2:
```cpp
SDL_Rect rect = {100, 100, 200, 200};
SDL_RenderFillRect(renderer, &rect);

SDL_Rect dstrect = {200, 200, 200, 200};
SDL_RenderCopy(renderer, texture, NULL, &dstrect);
```

SDL3:
```cpp
SDL_FRect rect = {100, 100, 200, 200};
SDL_RenderFillRect(renderer, &rect);

SDL_FRect dstrect = {200, 200, 200, 200};
SDL_RenderTexture(renderer, texture, NULL, &dstrect);
```

### 9. 纹理渲染函数改名

SDL3中，`SDL_RenderCopy`函数改名为`SDL_RenderTexture`：

SDL2:
```cpp
SDL_RenderCopy(renderer, texture, NULL, &textRect);
```

SDL3:
```cpp
SDL_RenderTexture(renderer, texture, NULL, &textRect);
```

### 10. 表面销毁函数改名

SDL3中，销毁表面的函数从`SDL_FreeSurface`改为`SDL_DestroySurface`：

SDL2:
```cpp
SDL_FreeSurface(surface);
```

SDL3:
```cpp
SDL_DestroySurface(surface);
```

### 11. 事件类型常量改名

SDL3中，事件类型常量采用了新的命名约定：

SDL2:
```cpp
if (event.type == SDL_QUIT) {
    break;
}
```

SDL3:
```cpp
if (event.type == SDL_EVENT_QUIT) {
    break;
}
```

### 12. SDL3中CMakeLists.txt的变化

CMakeLists.txt文件中库的名称也相应更改：

```cmake
# 查找并载入Cmake预设
find_package(SDL3 REQUIRED)
find_package(SDL3_image REQUIRED)
find_package(SDL3_mixer REQUIRED)
find_package(SDL3_ttf REQUIRED)

# 链接库
target_link_libraries(${TARGET}
                      ${SDL3_LIBRARIES}
                      SDL3_image::SDL3_image
                      SDL3_mixer::SDL3_mixer
                      SDL3_ttf::SDL3_ttf
                      )
```

## SDL3版本的完整代码

以下是使用SDL3的完整代码：

```cpp
#include <iostream>
#include <SDL3/SDL.h>
#include <SDL3_image/SDL_image.h>
#include <SDL3_mixer/SDL_mixer.h>
#include <SDL3_ttf/SDL_ttf.h>

int main(int, char**) {
    std::cout << "Hello, World!" << std::endl;
    // SDL初始化
    if (!SDL_Init(SDL_INIT_AUDIO | SDL_INIT_VIDEO)) {
        std::cerr << "SDL_Init Error: " << SDL_GetError() << std::endl;
        return 1;
    }
    // 创建窗口
    SDL_Window *window = SDL_CreateWindow("Hello World!", 800, 600, 0);
    // 创建渲染器
    SDL_Renderer *renderer = SDL_CreateRenderer(window, NULL);

    // SDL3_Image不需要手动初始化

    // 加载图片
    SDL_Texture *texture = IMG_LoadTexture(renderer, "assets/image/bg.png");

    // SDL_Mixer初始化
    if (!Mix_OpenAudio(0, NULL)) {
        std::cerr << "Mix_OpenAudio Error: " << SDL_GetError() << std::endl;
        return 1;
    }

    // 读取音乐
    Mix_Music *music = Mix_LoadMUS("assets/music/03_Racing_Through_Asteroids_Loop.ogg");
    // 播放音乐
    Mix_PlayMusic(music, -1);

    // SDL_TTF初始化
    if (!TTF_Init()) {
        std::cerr << "TTF_Init Error: " << SDL_GetError() << std::endl;
        return 1;
    }
    // 加载字体
    TTF_Font *font = TTF_OpenFont("assets/font/VonwaonBitmap-16px.ttf", 24);

    // 创建文本纹理
    SDL_Color color = {255, 255, 255, 255};
    SDL_Surface *surface = TTF_RenderText_Solid(font, "Hello, SDL! 中文也可以", 0, color);
    SDL_Texture *textTexture = SDL_CreateTextureFromSurface(renderer, surface);

    // 渲染循环
    while (true) {
        SDL_Event event;
        if (SDL_PollEvent(&event)) {
            if (event.type == SDL_EVENT_QUIT) {
                break;
            }
        }

        // 清屏
        SDL_RenderClear(renderer);
        // 画一个长方形
        SDL_FRect rect = {100, 100, 200, 200};
        SDL_SetRenderDrawColor(renderer, 255, 0, 0, 255);
        SDL_RenderFillRect(renderer, &rect);
        
        // 画图片
        SDL_FRect dstrect = {200, 200, 200, 200};
        SDL_RenderTexture(renderer, texture, NULL, &dstrect);

        // 画文本
        SDL_FRect textRect = {300, 300, static_cast<float>(surface->w), static_cast<float>(surface->h)};
        SDL_RenderTexture(renderer, textTexture, NULL, &textRect);
        SDL_SetRenderDrawColor(renderer, 0, 0, 0, 255); 

        // 更新屏幕
        SDL_RenderPresent(renderer);
    }

    // 清理图片资源
    SDL_DestroyTexture(texture);

    // 清理音乐资源
    Mix_FreeMusic(music);
    Mix_CloseAudio();
    Mix_Quit();

    // 清理字体资源
    SDL_DestroySurface(surface);
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

## 总结：SDL3的优势

SDL3相对于SDL2做出了许多改进，让库更加现代化和易用：

1. **更一致的API设计**：函数命名更加一致（如`SDL_DestroyXXX`替代了`SDL_FreeXXX`），使API更易于记忆和使用。

2. **简化的参数**：许多函数的参数被简化，采用更合理的默认值，减少了开发者需要了解的细节。

3. **浮点数渲染**：使用`SDL_FRect`代替`SDL_Rect`，支持亚像素精度的渲染。

4. **更少的手动初始化**：例如，SDL_image不再需要手动初始化。

5. **更清晰的错误处理**：初始化函数的返回值逻辑更加直观。

6. **头文件组织更清晰**：引入了命名空间式的包含路径，减少了名称冲突的可能性。

通过这些改进，SDL3使游戏开发变得更加简单和直观，同时保持了SDL一贯的高性能和跨平台特性。

## 从SDL2迁移到SDL3的建议

如果你正在考虑将现有的SDL2项目迁移到SDL3，以下是一些建议：

1. **逐步迁移**：不要尝试一次性替换所有代码，而是逐个模块地进行测试和迁移。

2. **注意初始化逻辑**：特别注意初始化函数的返回值逻辑已经相反。

3. **使用浮点矩形**：尽可能使用`SDL_FRect`代替`SDL_Rect`，以利用SDL3的亚像素渲染能力。

4. **更新事件处理**：检查所有事件处理代码，更新事件类型常量。

5. **谨慎处理音频初始化**：音频初始化的参数有重大变化，确保正确配置。

通过理解和适应这些变化，你可以充分利用SDL3带来的新特性和改进，使你的游戏开发更加高效和现代化。
