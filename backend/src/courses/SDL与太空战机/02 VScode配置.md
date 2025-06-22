# VSCode配置

<link rel="stylesheet" href="/css/videoStyles.css" />

<div class="video-container">
  <div class="video-tabs">
    <a href="#bilibili" class="video-tab bilibili-tab">哔哩哔哩</a>
    <a href="#youtube" class="video-tab youtube-tab">YouTube</a>
  </div>

  <div id="youtube" class="video-content">
    <iframe 
      class="video-frame"
      src="https://www.youtube.com/embed/LA5VMSERvbk?si=bsgF8lEduQ-MR4b5" 
      frameborder="0" 
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
      allowfullscreen>
    </iframe>
  </div>

  <div id="bilibili" class="video-content">
    <iframe 
      class="video-frame"
      src="//player.bilibili.com/player.html?bvid=BV17bCBYSEAY&page=1&autoplay=0&danmaku=0&high_quality=1" 
      scrolling="no" 
      border="0" 
      frameborder="no" 
      framespacing="0" 
      allowfullscreen="true">
    </iframe>
  </div>
</div>

在上一课中，我们完成了基本环境的配置。本课将学习如何正确配置VSCode以便我们能够高效地进行游戏开发工作。

<img src="https://theorhythm.top/gamedev/SS/vscode配置.PNG" style='width: 800px;' />

## 基本配置与功能

VSCode（Visual Studio Code）是一款轻量化、高效的代码编辑器，对C++项目的开发有着良好的支持。在上一课中我们已经完成了VSCode的安装以及必要插件的配置。接下来我们将设置一个简单的C++项目，并利用VSCode的CMake集成功能进行项目管理。

## 安装并配置Visual Studio Code编辑器
这一节所有平台都一样。
1. 打开[官网](https://code.visualstudio.com/)，选择对应平台的安装包下载安装

<img src="https://theorhythm.top/gamedev/f5a290cbf12c10e0feedd119034e5925.png" style='width: 800px;' />
2. 在插件页面搜索“C++”，然后安装插件：`C/C++ Extension Pack` 

<img src="https://theorhythm.top/gamedev/a6aa4619a9095f51649b4393cc7afd8c.png" style='width: 800px;' /> 至此配置已经完成，后面几步可任选是否执行。
3. 可选：再次搜索Chinese，安装插件 `Chinese (Simplified) (简体中文)` ，重启后即可改成中文界面。
4. 可选：打开“设置”并搜索“cmake status bar”，将“Status Bar Visibility” 改为“visible”。（此设置可方便地更改编译模式为debug或者release等）。

<img src="https://theorhythm.top/gamedev/aace361efb69b6c08ab5b783a27887af.png" style='width: 800px;' />
5. 可选：搜索安装AI辅助插件（选一个安装即可，以免冲突）。
	- 如果无法科学上网，推荐国内可用且下载量大的，例如 `CodeGeeX`，`fitten`等。
	- 如果能够科学上网，免费的推荐`Codeium`，付费的推荐 `Github Copilot`。

## 创建项目结构

1. 在你选择的目录下创建一个新的文件夹，命名为`SDLShooter`，这将是我们的项目根目录
2. 在项目根目录下创建以下两个文件：
   - `main.cpp`：主程序文件
   - `CMakeLists.txt`：CMake项目配置文件

## 编写基础文件

1. 编辑`main.cpp`，输入以下内容：

```cpp
#include <iostream>

int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}
```

2. 编辑`CMakeLists.txt`，输入以下内容：

```cmake
cmake_minimum_required(VERSION 3.5.0)
project(SDLShooter VERSION 0.1.0 LANGUAGES C CXX)

add_executable(SDLShooter main.cpp)

```

这个简单的CMakeLists.txt文件指定了：
- 要求的最低CMake版本
- 项目名称、版本和使用的语言
- 构建可执行文件的名称和源代码文件


## 编译和运行

1. 按下ctrl+shift+F5，或者调出命令面板（ctrl+shift+P）后搜索“Cmake Run”并执行，或者点击最下方的小三角按钮

<img src="https://theorhythm.top/gamedev/SS/cmakerun.png" />

2. 如果一切正常，你应该能在终端中看到"Hello, World!"的输出

## VSCode的常用功能介绍

1. **文件浏览器**：左侧的文件资源管理器可以方便地浏览和管理项目文件

2. **集成终端**：通过`Ctrl+` `（反引号）可以打开集成终端，执行命令行操作

3. **代码导航**：通过`Ctrl+P`可以快速打开文件，`F12`可以跳转到定义，`Shift+F12`可以查看引用

4. **扩展性**：可以通过安装各种插件扩展VSCode的功能，如Git集成、代码格式化等

5. **调试功能**：设置断点、单步执行、查看变量等调试功能都非常强大

## 下一步

现在我们已经完成了基本的VSCode项目配置。在下一课中，我们将开始通过CmakeLists.txt配置SDL2库，使我们能够开始进行游戏开发工作。

## 小练习

1. 尝试修改`main.cpp`文件，添加一些其他的代码并运行
2. 熟悉VSCode的界面和常用快捷键
3. 探索VSCode的扩展商店，寻找可能对C++开发有帮助的插件 