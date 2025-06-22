# CMake 配置

<link rel="stylesheet" href="/css/videoStyles.css" />

<div class="video-container">
  <div class="video-tabs">
    <a href="#bilibili" class="video-tab bilibili-tab">哔哩哔哩</a>
    <a href="#youtube" class="video-tab youtube-tab">YouTube</a>
  </div>

  <div id="youtube" class="video-content">
    <iframe 
      class="video-frame"
      src="https://www.youtube.com/embed/a1WoPcbfg_Y?si=2M8FidFJOMjIP3Hw" 
      frameborder="0" 
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
      allowfullscreen>
    </iframe>
  </div>

  <div id="bilibili" class="video-content">
    <iframe 
      class="video-frame"
      src="//player.bilibili.com/player.html?bvid=BV19CCHYNEvQ&page=1&autoplay=0&danmaku=0&high_quality=1" 
      scrolling="no" 
      border="0" 
      frameborder="no" 
      framespacing="0" 
      allowfullscreen="true">
    </iframe>
  </div>
</div>

## 第一部分：C++编译原理

在开始学习如何使用CMake配置我们的游戏项目之前，我们需要先了解C++程序的编译原理。这将帮助我们理解为什么需要CMake以及它是如何工作的。

<img src="https://theorhythm.top/gamedev/SS/4 C++编译原理.PNG" style='width: 800px;' />

### C++编译过程

C++程序从源代码到可执行文件需要经过以下几个主要步骤：

#### 1. 预处理（Preprocessing）

在这个阶段，编译器会：
- 处理所有的预处理指令（如 `#include`、`#define`、`#ifdef` 等）
- 展开所有的宏定义
- 删除注释
- 包含所有的头文件

预处理器会查找所有以 `#` 开头的指令，并根据这些指令修改源代码。例如，当遇到 `#include <iostream>` 时，预处理器会找到 `iostream` 头文件，并将其内容插入到当前文件中。

**关键问题：头文件在哪找？**
- 系统头文件：在编译器的标准库目录中
- 自定义头文件：在项目目录或指定的包含路径中（通过Cmake指定）

#### 2. 编译（Compilation）

编译器将预处理后的代码转换为汇编代码或目标文件（.o 或 .obj 文件）。这个步骤主要是：
- 语法分析
- 语义分析
- 代码优化
- 生成特定于目标平台的汇编代码

**关键问题：哪些文件要编译？**
- 通常只编译 .cpp 文件 （通过Cmake指定）
- 头文件 (.h/.hpp) 不单独编译，而是通过 #include 指令包含到 .cpp 文件中

#### 3. 链接（Linking）

链接器将所有编译生成的目标文件和库文件链接在一起，生成最终的可执行文件：
- 解析外部符号引用
- 组合各个目标文件
- 链接所需的库文件
- 生成可执行文件（.exe、.out 等）

**关键问题：**
- **链接库哪找？** 在系统库目录或指定的库目录中
- **链接哪些库？** 程序依赖的所有外部库（如SDL2、标准库等），通过Cmake指定

### 编译过程中的常见问题

1. **预处理阶段问题**：
   - 找不到头文件（`#include` 找不到指定的文件）
   - 宏定义错误
   
2. **编译阶段问题**：
   - 语法错误
   - 类型不匹配
   - 未声明的变量或函数
   
3. **链接阶段问题**：
   - 未定义的引用（Undefined reference）
   - 重复定义（Multiple definition）
   - 找不到库文件

### 为什么需要构建系统（如CMake）

手动管理编译和链接过程在小型项目中可能还算简单，但在大型项目中会变得非常复杂：
- 需要管理大量的源文件
- 需要指定正确的编译选项
- 需要链接多个库
- 需要考虑跨平台兼容性

CMake作为一个跨平台的构建系统生成器，能够：
- 自动处理文件依赖关系
- 自动找到并配置外部库
- 生成适合不同平台和编译器的构建文件
- 提供统一的、跨平台的项目配置方式

## 第二部分：CMake主框架

在理解了C++编译原理后，我们现在来学习如何使用CMake配置我们的SDL2游戏项目。CMake使用一种特殊的配置文件`CMakeLists.txt`来定义项目的构建过程。

<img src="https://theorhythm.top/gamedev/SS/4 Cmake框架.PNG" style='width: 800px;' />

### CMake基本概念

CMake是一个跨平台的构建系统生成器，它根据`CMakeLists.txt`文件生成原生构建系统（如Makefile、Visual Studio项目文件等）。CMake使我们能够用一套配置文件在不同平台上构建项目，而不必担心平台特定的细节。

### 创建基本的CMake项目

让我们先创建一个基本的CMake项目，该项目将使用SDL2库。我们的项目结构如下：

```
SDLShooter/
├── .vscode/
│   └── settings.json
├── assets/
│   └── (游戏资源文件)
├── CMakeLists.txt
└── main.cpp
```

#### 1. CMakeLists.txt

首先，我们修改`CMakeLists.txt`文件：

```cmake
# 标题
cmake_minimum_required(VERSION 3.5.0)
project(SDLShooter VERSION 0.1.0 LANGUAGES C CXX)

# 查找并载入Cmake预设
find_package(SDL2 REQUIRED)

# 添加可执行文件
add_executable(SDLShooter main.cpp)

# 链接库
target_link_libraries(SDLShooter 
                        SDL2::SDL2 
                        SDL2::SDL2main)
```

这个CMakeLists.txt文件的各部分解释如下：

- **cmake_minimum_required**：指定构建项目所需的最低CMake版本
- **project**：定义项目名称、版本和使用的编程语言
- **find_package**：查找并加载SDL2库的CMake配置
- **add_executable**：指定要构建的可执行文件及其源代码文件
- **target_link_libraries**：指定要链接的库

#### 2. main.cpp

接下来，我们更新`main.cpp`文件，包含SDL2的头文件：

```cpp
#include <iostream>
#include <SDL.h>

int main(int argc, char* argv[]) {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}
```

注意这里我们包含了`SDL.h`头文件，这表明我们的程序将使用SDL2库。

### CMake指令详解

让我们详细了解一下我们使用的CMake指令：

1. **cmake_minimum_required(VERSION 3.5.0)**
   - 设置构建项目所需的最低CMake版本
   - 如果用户的CMake版本低于指定版本，CMake将停止处理并显示错误

2. **project(SDLShooter VERSION 0.1.0 LANGUAGES C CXX)**
   - 设置项目名称、版本和使用的编程语言
   - `SDLShooter`：项目名称
   - `VERSION 0.1.0`：项目版本
   - `LANGUAGES C CXX`：项目使用C和C++语言

3. **find_package(SDL2 REQUIRED)**
   - 查找并加载SDL2库的CMake配置
   - `REQUIRED`表示SDL2是必需的，如果找不到，CMake将停止处理并显示错误
   - 这个命令会设置一些变量，如`SDL2_INCLUDE_DIRS`（SDL2头文件路径）和`SDL2_LIBRARIES`（SDL2库文件）

4. **add_executable(SDLShooter main.cpp)**
   - 定义一个名为`SDLShooter`的可执行目标
   - 指定构建该目标所需的源文件（这里是`main.cpp`）

5. **target_link_libraries(SDLShooter SDL2::SDL2 SDL2::SDL2main)**
   - 指定目标（`SDLShooter`）需要链接的库
   - `SDL2::SDL2`和`SDL2::SDL2main`是由`find_package(SDL2)`命令定义的目标

### 编译和运行

使用我们配置的CMake项目，可以按照以下方式编译和运行：

1. 在VSCode中，按下`Ctrl+Shift+P`打开命令面板，输入"CMake: Configure"并执行
2. 等待CMake配置完成
3. 再次打开命令面板，输入"CMake: Build"或直接按下F7
4. 成功构建后，输入"CMake: Run"或按下F5运行程序

如果一切正常，你应该能看到"Hello, World!"输出。

### 常见问题和解决方法

1. **找不到SDL2库**
   - 确保已正确安装SDL2开发库
   - 检查SDL2库的路径是否添加到环境变量中
   - 尝试使用绝对路径指定SDL2库的位置

2. **链接错误**
   - 检查`target_link_libraries`中指定的库名称是否正确
   - 确保所有依赖库都已正确链接

3. **编译错误**
   - 检查源代码中是否有语法错误
   - 确保头文件路径正确

> 常见问题：如果vscode不识别`sdl.h`，可以先按ctrl+Shift+p调出面板，查找点选 “C/C++：选择 IntelliSense配置”，然后选择“使用Cmake Tools“。 如果没有立刻生效可以刷新重启一下vscode

<img src="https://theorhythm.top/gamedev/SS/4-cmake问题1.png" style='width: 800px;' />
<img src="https://theorhythm.top/gamedev/SS/4-cmake问题2.png" style='width: 800px;' />


## 第三部分：CMake修补完善

在上一部分中，我们创建了一个基本的CMake配置。然而，在实际的游戏开发中，我们需要更多的配置来确保项目能够在不同平台上正常工作，并提供更好的开发体验。在这一部分中，我们将完善我们的CMake配置。

<img src="https://theorhythm.top/gamedev/SS/4 Cmake完善.PNG" style='width: 800px;' />

### 完善CMakeLists.txt

现在我们来进一步完善`CMakeLists.txt`文件，添加更多的配置选项：

```cmake
# 标题
cmake_minimum_required(VERSION 3.5.0)
project(SDLShooter VERSION 0.1.0 LANGUAGES C CXX)

# 设置C++标准
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED True)

# 设置编译选项
if (MSVC)
    add_compile_options(/W4)
else()
    add_compile_options(-Wall -Wextra -Wpedantic)
endif()

# 设置编译输出目录
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY_DEBUG ${CMAKE_SOURCE_DIR})
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY_RELEASE ${CMAKE_SOURCE_DIR})

set(TARGET ${PROJECT_NAME}-${CMAKE_SYSTEM_NAME})

# 查找并载入Cmake预设
find_package(SDL2 REQUIRED)

# 添加可执行文件
add_executable(${TARGET} main.cpp)

# 链接库
target_link_libraries(${TARGET} 
                        SDL2::SDL2 
                        SDL2::SDL2main)
```

让我们来看看新增的配置选项：

#### 1. C++标准设置

```cmake
# 设置C++标准
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED True)
```

这段代码指定了我们使用的C++标准。我们选择了C++17，这是一个相对较新的标准，提供了许多有用的语言特性。`CMAKE_CXX_STANDARD_REQUIRED`设置为`True`表示该标准是必需的，如果编译器不支持C++17，CMake将报错。

#### 2. 编译警告设置

```cmake
# 设置编译选项
if (MSVC)
    add_compile_options(/W4)
else()
    add_compile_options(-Wall -Wextra -Wpedantic)
endif()
```

这段代码设置了编译警告选项。对于Microsoft Visual C++编译器，我们使用`/W4`选项启用较高级别的警告；对于其他编译器（如GCC或Clang），我们使用`-Wall -Wextra -Wpedantic`选项启用全面的警告。这些警告可以帮助我们发现潜在的代码问题。

#### 3. 输出目录设置

```cmake
# 设置编译输出目录
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY_DEBUG ${CMAKE_SOURCE_DIR})
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY_RELEASE ${CMAKE_SOURCE_DIR})
```

这段代码设置了可执行文件的输出目录。我们将Debug和Release模式下的输出目录都设置为项目根目录（`${CMAKE_SOURCE_DIR}`）。这样，无论我们在哪种模式下构建项目，可执行文件都会放在项目根目录中，方便我们查找和运行。

#### 4. 目标名称设置

```cmake
set(TARGET ${PROJECT_NAME}-${CMAKE_SYSTEM_NAME})
```

这段代码定义了一个变量`TARGET`，它由项目名称和系统名称组成。例如，在Windows上，目标名称将是`SDLShooter-Windows`；在Linux上，目标名称将是`SDLShooter-Linux`。这样做可以帮助我们区分不同平台上的构建结果。

然后，我们使用这个变量作为可执行文件的名称：

```cmake
# 添加可执行文件
add_executable(${TARGET} main.cpp)

# 链接库
target_link_libraries(${TARGET} 
                      SDL2::SDL2 
                      SDL2::SDL2main)
```


### 完善CMake配置的好处

1. **C++标准设置**：
   - 可以使用最新的语言特性
   - 确保代码在不同编译器上有一致的行为
   - 避免使用已弃用的特性

2. **编译警告设置**：
   - 捕获潜在的代码问题
   - 提高代码质量
   - 强制执行良好的编程实践

3. **输出目录设置**：
   - 使可执行文件位置更加一致和可预测
   - 简化测试和部署过程

4. **平台特定名称**：
   - 区分不同平台的构建结果
   - 允许同时存在多个平台的构建

### 后续步骤

在接下来的课程中，我们将使用这个完善的CMake配置来进行游戏开发。
