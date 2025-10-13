# EX SOLID - 编写优雅健壮代码的五大原则

<div class="video-container">
  <div id="bilibili" class="video-content">
    <iframe
      class="video-frame"
      src="https://player.bilibili.com/player.html?bvid=BV1Lpjjz8EJG&page=1&autoplay=0&danmaku=0&high_quality=1"
      width="100%"
      height="480"
      scrolling="no"
      frameborder="0"
      allowfullscreen>
    </iframe>
  </div>
</div>

在过去的课程中，我们学习了单例、组合、状态、原型、工厂方法等多种具体的设计模式。这些就像是武功中的一招一式，是“**术**”。

今天，我们将探讨一个更高层次的、类似于“内功心法”的东西——**SOLID原则**。它是五个面向对象设计原则的缩写，是无数软件工程师智慧的结晶。理解并遵循这些原则，可以帮助我们从根本上写出更健壮、更灵活、更易于维护的代码。

现在，你已经有了前面几节课的具体模式作为基础，正是对照代码、理解这些抽象原则的最佳时机。

---

## 🏛️ SOLID 五大原则概览

* **S** - **S**ingle Responsibility Principle (单一职责原则)
* **O** - **O**pen/Closed Principle (开闭原则)
* **L** - **L**iskov Substitution Principle (里氏替换原则)
* **I** - **I**nterface Segregation Principle (接口隔离原则)
* **D** - **D**ependency Inversion Principle (依赖倒置原则)

接下来，我们逐一解析，并看看它们在我们的 `GhostEscape` 项目中是如何体现的。

###  S - 单一职责原则 (Single Responsibility Principle)

> **官方定义**：一个类，应该只有一个引起它变化的原因。
> **通俗理解**：一个类应该只负责一项功能或任务，保持职责的纯粹性。

* ✅ **项目中的正面例子：`MoveControl` 类**
    在应用组合模式后，我们将移动控制逻辑从 `Player` 中剥离出来，创建了 `MoveControl` 类。这个类的职责极其单一：**只负责根据输入更新方向状态**。它不关心父对象是谁（`Player` 或 `Enemy`），也不关心如何渲染。这种设计使得 `MoveControl` 模块本身非常稳定，修改它不会影响到其他系统。

* ❌ **项目中有待改进的例子：`Game` 类**
    我们的 `Game` 类是一个典型的“上帝类”，它的职责过于繁多：播放音乐、提供随机数等工具函数、管理场景切换、执行渲染调用等等。理论上，这些功能都应该被拆分到各自独立的模块中（如 `AudioManager`, `RenderManager`, `SceneManager`）。这正是我们未来主线课程中需要继续优化的方向。

### O - 开闭原则 (Open/Closed Principle)

> **官方定义**：软件实体（类、模块、函数等）应该是可扩展的，但是不可修改的。
> **通俗理解**：当需要添加新功能时，我们应该通过**增加新代码**来实现，而不是**修改旧代码**。

* ✅ **项目中的正面例子：`SpellCreator` 工厂**
    在使用工厂方法模式后，我们的 `Weapon` 持有一个 `SpellCreator` 的抽象指针。如果想增加一种新的“冰霜法术”，我们**不需要修改**任何 `Weapon` 或 `SpellCreator` 的代码。我们只需要**新增**一个 `IceSpellCreator` 类即可。这就是对扩展开放（可以新增`Creator`），对修改关闭（`Weapon`类不用动）。

* ❌ **项目中有待改进的例子：`Player` 类**
    当前的 `Player` 类还不完全符合开闭原则。例如，它有两个固定的武器成员 `weapon_` 和 `weapon2_`。如果想添加第三把武器，就必须修改 `Player` 的头文件和源文件，增加 `weapon3_`。更理想的设计是将武器存储在一个容器里（如 `std::vector<Weapon*>`），这样就可以在不修改 `Player` 类的情况下，动态地增删武器。

### L - 里氏替换原则 (Liskov Substitution Principle)

> **官方定义**：子类型必须能够替换掉它们的基类型。
> **通俗理解**：在任何使用父类的地方，都应该可以安全地用其子类来替换，而程序的行为不会产生错误或异常。

* ✅ **项目中的正面例子：`Actor` 类**
    `Player` 和 `Enemy` 都继承自 `Actor`。在 `HUDStats` 中，它的 `target_` 指针类型是 `Actor*`。这意味着，这个UI组件既可以显示 `Player` 的状态，也可以无缝切换去显示任意一个 `Enemy` 的状态，因为 `Player` 和 `Enemy` 都完全遵循了 `Actor` 定义的“契约”。

* ❌ **项目中有待改进的例子：`ObjectWorld` 与 `ObjectScreen` 的继承关系**
    在我们的设计中，`ObjectWorld`（世界对象）继承自 `ObjectScreen`（屏幕对象）。这在当时似乎很方便，但它违反了里氏替换原则。`Scene` 类中有一个 `children_screen_` 容器，其设计初衷是存放UI等屏幕元素。但由于继承关系，我们甚至可以把 `Player` 或 `Enemy` （它们是 `ObjectWorld` 的子类）放进这个只应存放屏幕元素的容器里，这显然会破坏程序的逻辑。
    **更好的设计**：`ObjectWorld` 和 `ObjectScreen` 不应该有直接的继承关系，而是可以共同继承自一个更底层的基类（比如我们现有的 `Object`），保持各自继承树的独立性。

### I - 接口隔离原则 (Interface Segregation Principle)

> **官方定义**：客户端不应该被迫依赖于它们不使用的方法。
> **通俗理解**：类的接口应该尽量“小而专”，而不是“大而全”。

* ✅ **项目中的正面例子：继承树的设计**
    我们整个项目的继承结构在很大程度上遵循了接口隔离。例如，`ObjectAffiliate`（附加件）拥有 `offset_` 和 `size_` 相关的接口，而 `ObjectWorld` 和 `ObjectScreen` 则没有，因为它们不需要。反之，`ObjectAffiliate` 的子类（如`Sprite`, `Collider`）也不需要关心世界坐标 `position_`。这种划分使得每个类的接口都与其自身职责紧密相关。

* ❌ **项目中有待改进的例子：`Scene` 类的 `saveData`/`loadData` 接口**
    我们在 `Scene` 基类中定义了 `saveData` 和 `loadData` 虚函数。但并非所有场景都需要存读档功能，比如 `SceneTitle` 就不需要。这使得 `SceneTitle` 继承了它根本用不上的接口，增加了开发者的认知负担。
    **更好的设计**：应该将存读档功能定义在一个更具体的接口或类中（例如 `ISaveable`），然后让真正需要该功能的场景（如`SceneMain`）去实现它。

### D - 依赖倒置原则 (Dependency Inversion Principle)

> **官方定义**：
> 1. 高层模块不应该依赖于低层模块。两者都应该依赖于抽象。
> 2. 抽象不应该依赖于细节。细节应该依赖于抽象。
> **通俗理解**：“面向接口编程，而不是面向实现编程”。

这个原则是实现许多设计模式（如工厂、策略、观察者）的理论基石。

* ✅ **项目中的正面例子：`Player` 与 `MoveControl`**
    `Player`（高层模块，关心游戏逻辑）不直接依赖于具体的键盘扫描码（低层模块，实现细节）。它只依赖于 `MoveControl` 这个**抽象接口**。而具体的 `MoveControl` 实现（细节）也依赖于这个抽象接口。这就实现了高层与低层的解耦，两者都依赖于抽象。

* ❌ **项目中有待改进的例子：`Sprite` 的渲染**
    在 `Sprite::render` 中，我们直接调用了 `game_.renderTexture(...)`。这里 `Sprite`（高层模块）直接依赖了 `Game` 这个具体类（低层模块）的**具体实现**。如果未来我们想把渲染引擎从 SDL 更换为 OpenGL，就必须修改 `Sprite` 类的代码。
    **更好的设计**：应该定义一个抽象的 `IRenderer` 接口，其中包含 `renderTexture` 方法。`Sprite` 只依赖于这个接口。然后我们可以创建 `SDLRenderer`, `OpenGLRenderer` 等具体实现（细节），并在程序启动时决定使用哪一个。这样，更换渲染引擎将不再需要修改 `Sprite` 的代码。

---

## 💡 补充原则：组合优于继承 (Composition Over Inheritance)

虽然不属于 SOLID，但这个原则在现代面向对象设计中至关重要，并且与 SOLID 精神一脉相承。在我们的重构过程中，`Weapon` 类的演变就是绝佳的例子：它通过**组合** `SpellCreator` 组件，而不是通过**继承**出 `WeaponThunder`, `WeaponFire` 等子类，获得了巨大的灵活性。

---

## 结语

SOLID 原则确实比较抽象，如果你暂时觉得有些模糊，完全没有关系。它们更像是指南针，而不是严格的法律。

本节课，可以看作是我们《游戏优化与设计模式》专题的一个里程碑。我们通过一系列实战，不仅学会了具体的“招式”，更领悟了背后的“心法”。

**接下来，我们将进入新一期的主线课程，开启全新的旅程。带着这些宝贵的经验，去构建更宏大、更优雅的游戏世界吧！**