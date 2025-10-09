# spdlog与json基础

<div class="video-container">
  <div id="bilibili" class="video-content">
    <!-- B站嵌入：使用 https 明确协议（避免 file:// 或 http 导致被浏览器拦截） -->
    <iframe
      class="video-frame"
      src="https://player.bilibili.com/player.html?bvid=BV1YFNnzrEiv&page=1&autoplay=0&danmaku=0&high_quality=1"
      width="100%"
      height="480"
      scrolling="no"
      frameborder="0"
      allowfullscreen>
    </iframe>
  </div>
</div>

[在 Bilibili 上观看](https://www.bilibili.com/video/BV1YFNnzrEiv)

## 📖 概述

在上一节课中，我们成功搭建了"阳光岛"项目的开发环境，并对所需的库进行了配置。现在，我们将学习两个在现代C++开发中至关重要的工具库：**spdlog** 和 **nlohmann/json**。它们将分别成为我们调试信息输出和游戏数据管理的得力助手。

### 🤔 为什么需要这些工具？

在复杂的项目中，使用 `std::cout` 来打印信息会变得混乱不堪。我们需要一个能够分级、格式化、并且能轻松开关的日志系统。同样，当涉及到游戏存档、关卡配置或角色属性时，直接在代码中硬编码数据是不可维护的，我们需要一种结构化的数据格式。

本节课，我们将解决这两个痛点，为后续的引擎开发扫清障碍。

## 📝 1. spdlog：专业且高效的日志库

**spdlog** 是一个非常快速、仅需头文件的C++日志库。它提供了丰富的功能，让我们的调试工作事半功倍。

### 💻 基础用法

让我们看看在上一课最终的 `main.cpp` 中的基础用法：

```cpp
#include <spdlog/spdlog.h>

int main(int, char**) {
    // 设置日志等级，不设置的话默认为 info
    spdlog::set_level(spdlog::level::err);

    // 不同等级的log
    spdlog::trace("最低级别log!");
    spdlog::debug("调试信息!");
    spdlog::info("你好，世界!");
    spdlog::warn("警告!，很可能会出错");
    spdlog::error("程序出错啦!");
    spdlog::critical("最高级别的log!, 比error还严重!");

    // 格式化输出
    spdlog::info("日志格式化输出: {} {} {}", 1, "hello", 3.14);

    return 0;
}
```

### 🎯 核心概念

#### 📊 1. 日志级别 (Log Levels)

`spdlog` 定义了多个日志级别，从低到高依次为：`trace`, `debug`, `info`, `warn`, `error`, `critical`。这允许我们根据信息的重要性来分类输出。

- 🔍 **`trace`/`debug`** - 用于输出详细的、仅在开发调试时需要的信息
- ℹ️ **`info`** - 用于输出常规的、有意义的运行时信息，比如"游戏已启动"、"关卡加载成功"
- ⚠️ **`warn`** - 用于输出潜在的问题，程序仍可继续运行
- ❌ **`error`/`critical`** - 用于输出严重错误，这些错误可能会导致程序行为异常甚至崩溃

#### ⚙️ 2. 设置输出等级

通过 `spdlog::set_level()`，我们可以控制程序实际输出的日志级别。例如，`spdlog::set_level(spdlog::level::info)` 意味着只有 `info` 及以上级别（`warn`, `error`, `critical`）的日志才会被显示，而 `trace` 和 `debug` 信息将被忽略。这在发布游戏时非常有用，可以轻松地关闭所有调试信息。

#### 📝 3. 格式化输出

`spdlog` 使用与 Python 的 `format` 或 C++20 的 `std::format` 类似的语法，通过 `{}` 作为占位符，可以安全、高效地格式化各种类型的变量。

## 📦 2. nlohmann/json：现代C++的JSON处理利器

**JSON**（JavaScript Object Notation）是一种轻量级的数据交换格式，在游戏开发中被广泛用于配置文件、存档数据、关卡设计等场景。**nlohmann/json** 是C++社区中最受欢迎的JSON库之一，它提供了直观、类型安全的API，让JSON操作变得如同操作原生C++对象一样简单。

### 🎯 核心概念

在深入代码之前，让我们先了解JSON的基本数据类型：

#### 🔤 基本类型

- 📝 **`string`（字符串）** - 用双引号括起的文本
- 🔢 **`number`（数字）** - 整数或浮点数
- ✅ **`boolean`（布尔值）** - `true` 或 `false`
- ⭕ **`null`** - 空值

#### 🎁 复合类型

- 📂 **`object`（对象）** - 键值对的集合，用 `{}` 括起
- 📋 **`array`（数组）** - 值的有序列表，用 `[]` 括起

### 💻 基础用法示例

让我们通过 `main.cpp` 中的完整示例来学习如何使用这个库：

```cpp
#include <nlohmann/json.hpp>
#include <fstream>

int main() {
    try {
        // 1. 载入JSON文件
        std::ifstream input_file("assets/json_example.json");
        nlohmann::ordered_json json_data = nlohmann::ordered_json::parse(input_file);
        input_file.close();
        spdlog::info("JSON 成功载入!");

        // 2. 获取不同类型的数据
        // 2.1 字符串 (String)
        std::string name = json_data["name"].get<std::string>();
        spdlog::info("Name: {}", name);

        // 2.2 数字 (Number)
        int age = json_data["age"].get<int>();
        double height = json_data["height_meters"].get<double>();
        spdlog::info("Age: {}, Height: {}", age, height);

        // 2.3 布尔值 (Boolean)
        bool isStudent = json_data["isStudent"].get<bool>();
        spdlog::info("Is Student: {}", isStudent);

        // 2.4 null 值检查
        if (json_data["middleName"].is_null()) {
            spdlog::info("Middle Name: null");
        } else {
            spdlog::info("Middle Name: {}", json_data["middleName"].get<std::string>());
        }

        // 2.5 使用 .at() 方法访问（推荐用于必须存在的键）
        std::string email = json_data.at("email").get<std::string>();
        spdlog::info("Email: {}", email);

    } catch (const std::exception &e) {
        spdlog::error("Exception: {}", e.what());
    }
    
    return 0;
}
```

### 🛡️ 安全访问策略

在实际项目中，我们经常需要处理可能缺失的数据。`nlohmann/json` 提供了多种安全访问方法：

```cpp
// 3. 安全访问的方法
// 3.1 使用 .contains() 检查键是否存在
if (json_data.contains("email")) {
    std::string email = json_data.at("email").get<std::string>();
    spdlog::info("Email: {}", email);
}

if (json_data.contains("nonExistentKey")) {
    spdlog::info("nonExistentKey found!"); // 不会执行
} else {
    spdlog::info("'nonExistentKey' not found.");
}

// 3.2 使用 .value() 获取值并提供默认值
std::string optional_value = json_data.value("optionalKey", "default_string_value");
int optional_int = json_data.value("optionalNumber", 42);
spdlog::info("Optional Key (string): {}", optional_value);
spdlog::info("Optional Key (int): {}", optional_int);
```

### 🏗️ 处理复杂数据结构

JSON的强大之处在于它能够表示复杂的嵌套数据结构：

```cpp
// 4. 对象 (Object)
nlohmann::ordered_json address_obj = json_data["address"];
std::string street = address_obj["street"].get<std::string>();
std::string city = address_obj.value("city", "Unknown City");
bool isPrimaryAddr = address_obj.value("isPrimary", false);
spdlog::info("Address: {}, {}", street, city);
spdlog::info("Is Primary Address: {}", isPrimaryAddr);

// 5.1 数组 (Array) - 字符串数组
spdlog::info("Hobbies:");
nlohmann::ordered_json hobbies_array = json_data["hobbies"];
for (const auto &hobby : hobbies_array) {
    spdlog::info("  - {}", hobby.get<std::string>());
}

// 5.2 数组 (Array) - 混合类型数组
spdlog::info("Scores:");
for (const auto &score_item : json_data["scores"]) {
    if (score_item.is_number_integer()) {
        spdlog::info("  - {} (integer)", score_item.get<int>());
    } else if (score_item.is_number_float()) {
        spdlog::info("  - {} (float)", score_item.get<double>());
    }
}

// 5.3 对象数组 - 处理复杂的嵌套结构
spdlog::info("Projects:");
nlohmann::ordered_json projects_array = json_data["projects"];
for (const auto &project : projects_array) {
    std::string projectName = project["projectName"].get<std::string>();
    std::string status = project["status"].get<std::string>();
    double budget = project.value("budget", 0.0);
    bool isActive = project.value("isActive", false);

    spdlog::info("  ProjectName: {}", projectName);
    spdlog::info("  Status: {}", status);
    spdlog::info("  Budget: {}", budget);
    spdlog::info("  Is Active: {}", isActive);
    
    if (project.contains("deadline") && project["deadline"].is_null()) {
        spdlog::info("  Deadline: null");
    } else if (project.contains("deadline")) {
        spdlog::info("  Deadline: {}", project["deadline"].get<std::string>());
    }
    spdlog::info("--------------------------------");
}
```

### 🔗 深层嵌套访问与数据保存

```cpp
// 5.4 直接访问深层嵌套的数据
double metadata_version = json_data["metadata"]["version"].get<double>();
spdlog::info("Metadata Version: {}", metadata_version);

spdlog::info("Metadata Tags:");
for (const auto &tag_json : json_data["metadata"]["tags"]) {
    std::string tag = tag_json.get<std::string>();
    spdlog::info("  - {}", tag);
}

// 6. 将json数据保存为文件
std::ofstream output_file("assets/save_json.json");
output_file << json_data.dump(4); // 使用 dump(4) 进行格式化输出，缩进为4个空格
output_file.close();
spdlog::info("JSON 数据已保存到文件 assets/save_json.json");
```

### 🔑 关键特性解析

#### 1. `nlohmann::ordered_json` vs `nlohmann::json`

- 📑 **`ordered_json`** - 保持键的插入顺序，适合需要固定顺序的场景
- ⚡ **`json`** - 性能更高，但不保证键的顺序

#### 2. 类型检查方法

提供了丰富的类型检查函数：`.is_null()`, `.is_string()`, `.is_number_integer()`, `.is_number_float()`, `.is_boolean()`, `.is_array()`, `.is_object()`

#### 3. 错误处理

- 🛡️ 使用 `try-catch` 包裹JSON操作，捕获解析错误和类型转换错误
- ⚠️ 在生产环境中，应该对所有JSON操作进行适当的错误处理

### 🎮 在游戏开发中的应用

在"阳光岛"项目中，我们将广泛使用JSON来处理：

- ⚙️ **游戏配置** - 窗口大小、音效音量、控制键设置等
- 🗺️ **关卡数据** - Tiled地图编辑器导出的关卡文件
- 💾 **游戏存档** - 玩家进度、分数记录、解锁状态等
- 👾 **游戏对象属性** - 敌人血量、移动速度、攻击力等

通过结合 `spdlog` 的日志功能和 `nlohmann/json` 的数据处理能力，我们就拥有了构建复杂游戏系统所需的两个重要工具。在接下来的课程中，你将看到它们如何与我们的游戏引擎无缝集成，为"阳光岛"的开发提供强大的支撑。

---

## 📋 总结

本节课我们学习了两个现代C++开发中的重要工具：

- ✅ **spdlog** - 为我们提供专业的日志输出功能，让调试和信息跟踪变得简单高效
- ✅ **nlohmann/json** - 让JSON数据的读取、处理和保存变得直观易用

这两个库将成为我们后续开发"阳光岛"游戏引擎的基石。在下一节课中，我们将开始设计整体的游戏架构，并看到这些工具如何在实际项目中发挥作用。

