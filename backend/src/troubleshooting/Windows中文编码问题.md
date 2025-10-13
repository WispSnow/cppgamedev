## 问题根源

这是一个在 Windows 上进行 C++ 跨平台开发时非常经典且令人头疼的问题。核心原因在于：

- **Linux/macOS/现代工具链**：普遍默认使用 UTF-8 编码
- **中文 Windows 系统**：默认的本地编码（ANSI Code Page）是 GBK (代码页 936)
- **MSVC 编译器**：在不加任何设置时，会默认使用系统的本地编码 (GBK) 来解释源代码中的字符串字面量

这就导致了，你在一个 UTF-8 文件里写的 `const char* s = "你好";`，被 MSVC 用 GBK 编码去理解，最终在程序运行时变成了乱码。

> **解决方案的核心思想**：在整个工具链中，从源文件到编译器再到运行时，都统一使用 UTF-8。

下面是针对 **CMake + MSVC** 环境的最佳实践方案。

---

## 推荐的现代解决方案 (The "Golden Path")

这是目前最推荐、最一劳永逸的方案，遵循以下几个关键步骤：

### 1. 确保所有源文件都保存为 UTF-8 编码

这是第一步，也是最基础的一步。确保你的 `.cpp`、`.h` 等所有代码文件本身都是以 **UTF-8 (无 BOM)** 格式保存的。

大多数现代代码编辑器（如 VS Code、Visual Studio 2017+ 等）都默认使用这个格式。

### 2. 在 CMake 中为 MSVC 添加编译选项 `/utf-8`

这是**最关键的一步**。MSVC 提供了一个强大的编译选项 `/utf-8`，它的作用是告诉编译器：

- **源字符集 (Source Character Set)**：你的源代码文件是用 UTF-8 编码的
- **执行字符集 (Execution Character Set)**：你程序中的 `char` 类型字符串字面量，在编译后也应该被编码为 UTF-8

这样就统一了输入和输出。在 `CMakeLists.txt` 中，你可以这样添加：

```cmake
# CMakeLists.txt

cmake_minimum_required(VERSION 3.15)
project(MyProject CXX)

add_executable(my_app main.cpp)

# 关键部分：只为 MSVC 编译器添加 /utf-8 选项
if(MSVC)
  target_compile_options(my_app PRIVATE "/utf-8")
endif()
```

**为什么用 `target_compile_options`？**

这是现代 CMake 的推荐做法，它只会对指定的目标（这里是 `my_app`）生效，避免了对整个项目或第三方库产生不必要的副作用。

### 3. 在代码中明确使用 UTF-8 字符串字面量

为了代码的可移植性和明确性，推荐使用 `u8` 前缀来定义 UTF-8 字符串。

```cpp
// C++11/17
const char* s1 = u8"你好，世界！";

// C++20 引入了 char8_t 类型，更加类型安全
// const char8_t* s2 = u8"你好，世界！";
// std::u8string s3 = u8"你好，世界！";
```

结合第 2 步的 `/utf-8` 编译选项，即使你省略 `u8` 前缀，MSVC 也能正确处理。但加上 `u8` 是一个好习惯，因为它能让你的代码在其他编译器（如 GCC、Clang）上也保证行为一致，无论它们的默认设置是什么。

---

## 处理具体场景

仅仅统一编码还不够，在与 Windows 系统交互时，你还需要处理以下几个常见场景：

### 场景一：文件路径包含中文

Windows 的文件系统 API（尤其是底层 API）实际上使用的是 **UTF-16 编码**（`wchar_t`）。如果你直接使用一个 UTF-8 编码的 `const char*` 路径去创建文件流，很可能会失败。

#### 最佳解决方案：使用 C++17 的 `std::filesystem`

`std::filesystem::path` 被设计为可以处理编码问题。在 Windows 上，当你用一个 UTF-8 字符串去构造它时，它会在内部正确地转换为 UTF-16 `wstring`，然后再调用系统 API。

```cpp
#include <iostream>
#include <fstream>
#include <filesystem>

int main() {
    // 路径中包含中文
    // 使用 u8 前缀确保路径字符串是 UTF-8
    std::filesystem::path file_path(u8"D:\\测试目录\\你好.txt");

    // std::ofstream 会自动处理来自 std::filesystem::path 的正确编码
    std::ofstream ofs(file_path);
    if (ofs) {
        // 写入 UTF-8 编码的内容
        ofs << u8"这是一段写入文件的内容。\n";
        std::cout << u8"文件写入成功: " << file_path.u8string() << std::endl;
    } else {
        std::cerr << u8"文件打开失败: " << file_path.u8string() << std::endl;
    }
    return 0;
}
```

### 场景二：控制台（Console）输出中文乱码

这是另一个常见问题。即使你的程序内部全是正确的 UTF-8，但 Windows 的 `cmd.exe` 或 PowerShell 默认的代码页是 **GBK (936)**。你把 UTF-8 字节流输出到控制台，它会用 GBK 去解释，自然就是乱码。

#### 解决方案：在程序启动时修改控制台代码页

你可以在 `main` 函数的开头，通过调用 Windows API 来改变当前控制台的输入和输出代码页为 **UTF-8 (65001)**。

```cpp
#include <iostream>
#include <string>

#ifdef _WIN32
#include <Windows.h>
#endif

void setup_console() {
#ifdef _WIN32
    // 设置控制台输出代码页为 UTF-8
    SetConsoleOutputCP(CP_UTF8);
    // 可选：如果需要从控制台读取中文，也设置输入代码页
    SetConsoleCP(CP_UTF8);
#endif
}

int main() {
    setup_console();

    std::string s = u8"你好，控制台！";
    std::cout << s << std::endl;

    return 0;
}
```

> **注意**：用户还需要确保控制台使用的字体支持中文字符，例如 "Consolas"、"Cascadia Code" 或 "SimSun (宋体)"。幸运的是，现代 Windows 10/11 的默认终端字体支持已经很好了。

---

## 总结与最佳实践

总结一下最佳实践步骤：

1. **文件编码**：所有 `.cpp`、`.h` 文件保存为 UTF-8 格式
2. **CMake 配置**：在 `CMakeLists.txt` 中，为 MSVC 目标添加 `"/utf-8"` 编译选项
3. **C++ 代码**：
   - 使用 `u8"..."` 前缀来定义字符串字面量，增强可移植性
   - 处理文件路径时，优先使用 `std::filesystem::path`
   - 如果需要与 Windows Console 交互，在程序开始时调用 `SetConsoleOutputCP(CP_UTF8)`

### VS Code 输出面板问题

以上可以解决终端输出问题，但如果你使用 VS Code 进行 CMake 编译，很可能在输出面板中依然存在中文乱码。

**解决方法很简单**：在你的项目根目录下创建或编辑 `.vscode/settings.json` 文件，添加以下配置：

```json
{
  "cmake.outputLogEncoding": "utf-8"
}
```

保存后，重新配置 CMake（`Ctrl+Shift+P` → `CMake: Configure`）并构建（`CMake: Build`）。这会强制扩展使用 UTF-8 解码输出。
