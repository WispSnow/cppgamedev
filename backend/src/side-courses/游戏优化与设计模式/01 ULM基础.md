# UML基础

<div class="video-container">
  <div id="bilibili" class="video-content">
    <iframe
      class="video-frame"
      src="https://player.bilibili.com/player.html?bvid=BV1vUL1z3EK1&page=1&autoplay=0&danmaku=0&high_quality=1"
      width="100%"
      height="480"
      scrolling="no"
      frameborder="0"
      allowfullscreen>
    </iframe>
  </div>
</div>

## 为什么需要UML？

在之前的课程中，我们通常用下图这样的方式来展示类之间的关系：

<img src="https://theorhythm.top/gamedev/opt/OPT7.webp" alt="以前的继承关系示意" style="display: block; margin: auto; width: 800px;" />

虽然看起来比较直观，但是感觉不太"专业"。那么，专业的类图关系是怎样的呢？可能很多同学已经见过，它大概是下面这个样子：

<img src="https://theorhythm.top/gamedev/opt/OPT8.webp" alt="UML类图范例" style="display: block; margin: auto; width: 800px;" />

这种图表的绘制规范叫做 **UML**，全称是 **统一建模语言** (Unified Modeling Language)。

> 既然我们要学习设计模式，UML就是必须要了解的基础知识。当然，UML是一个非常复杂的系统，但幸运的是，我们只需要掌握其中的基础内容就足够了。

具体来说，我们需要了解两部分内容：

1. **图中每个方框（代表类）的含义**
2. **连接方框的各种线条（代表关系）的含义**

掌握了这两部分，就足够我们应对这套专题课程了。

---

## UML类图的基本构成 - 类（Class）

在UML中，一个方框代表一个类。这个方框通常分为三部分，自上而下分别是：

1. **类的名称** (Name)
2. **成员变量** (Attributes / Properties)
3. **成员方法** (Methods / Operations)

### 可见性符号

在成员变量和方法前面，还会有 `+`、`-`、`#` 等符号，它们代表了成员的**可见性** (Visibility)：

| 符号 | 可见性 | 英文 |
|------|--------|------|
| `+` | 公有 | public |
| `-` | 私有 | private |
| `#` | 保护 | protected |

<img src="https://theorhythm.top/gamedev/opt/OPT9.webp" alt="UML类图结构" style="display: block; margin: auto; width: 800px;" />

### 实战绘制：《幽灵逃生》中的Object类

我们以《幽灵逃生》项目中的 `Object` 基类为例，亲手绘制它的UML类图。

打开项目代码，找到 `Object` 类的定义，我们可以画出如下的类图：

```
+--------------------------------+
|             Object             |
+--------------------------------+
| # game: Game&                  |
| # children: vector<Object*>    |
| ...                            |
+--------------------------------+
| + handleEvent(e: Event): bool  |
| + update(dt: float): void      |
| + render(renderer: Renderer): void |
| ...                            |
+--------------------------------+
```

**解析：**

- **第一层**：类名 `Object`
- **第二层**：成员变量。我们只列举了两个重要的 `protected` 成员（所以前面是 `#` 号）
  - `game` 的类型是 `Game&`（Game的引用）
  - `children` 的类型是 `vector<Object*>`
  - 省略号 `...` 表示还有其他成员变量，为了图表简洁，我们省略了
- **第三层**：成员函数。我们列举了三个核心的 `public` 虚函数（所以前面是 `+` 号），并标注了参数和返回类型

---

## 类与类之间的关系

搞定了单个类如何表示，接下来就是更重要的部分：如何表示类与类之间的关系。这些关系由不同样式的线条和箭头来表示。

### 1. 继承 (Inheritance / Generalization)

这是我们最熟悉的关系，表示一个类（子类）继承自另一个类（父类）。

**符号：** 一条实线，末端带一个指向父类的空心三角箭头 `▷`

**示例：** 在我们的项目中，`Scene` 类继承自 `Object` 类。

```
Scene --------▷ Object
```

### 2. 依赖 (Dependency)

表示一个类（客户端）在某个方法中**临时地**使用了另一个类（供应商），但这个类不是它的成员变量。通常表现为函数参数、局部变量或静态方法调用。这是一种**最弱**的关系。

**符号：** 一条虚线，末端带一个指向被使用类的普通箭头 `--->`

**示例：** `Game` 类中有一个 `renderText` 方法，这个方法会用到 `Texture` 类（或结构体），但 `Game` 类本身并没有 `Texture` 类型的成员变量。我们就说 `Game` 依赖于 `Texture`。

```
Game - - - -> Texture
```

### 3. 关联 (Association)

表示一个类**持续地**拥有另一个类的对象作为其成员变量。这比依赖关系更强。关联可以是单向的，也可以是双向的。

**符号：** 一条实线，末端带一个指向被引用类的普通箭头 `---->`。如果是双向关联，则两端都有箭头 `<---->`

**示例：**

- **单向关联**：`Object` 类中有一个 `Game&` 成员变量，所以 `Object` 关联到 `Game`。但 `Game` 类中没有 `Object` 的成员，所以是单向的。

- **双向关联**：`Game` 类中有一个 `Scene*` 成员变量来表示当前场景，而 `Scene`（继承自 `Object`）中又有关联到 `Game` 的成员。因此 `Game` 和 `Scene` 之间是双向关联。

```
Object ------> Game
Scene  <------> Game
```

### 4. 聚合 (Aggregation) 与 组合 (Composition)

这两种都是关联关系的特殊形式，都表示**"整体与部分"**的关系（whole-part），但强度不同。

#### 4.1 聚合 (Aggregation)

表示一种**"拥有"**（has-a）的关系，但部分的生命周期独立于整体。整体被销毁，部分不一定被销毁。

**符号：** 一条实线，在"整体"那一端有一个空心菱形 `◇`

**示例：** `Player` 类拥有一个 `Effect`（特效）对象作为组件。当 `Player` 对象被销毁时，这个特效对象并不会立即被销毁，因为它的生命周期是由 `Scene` 来管理的（特效被添加到了场景中）。因此，`Player` 和 `Effect` 是聚合关系。

```
Player ◇------> Effect
```

#### 4.2 组合 (Composition)

表示一种更强的**"包含"**（contains-a）关系，部分的生命周期完全由整体控制。整体被销毁，部分也必须被销毁。

**符号：** 一条实线，在"整体"那一端有一个实心菱形 `◆`

**示例：** `Scene` 类包含一个 `Object` 的容器，这些 `Object` 都是场景的组成部分。当 `Scene` 被销毁时，它所包含的所有 `Object` 也应该被销毁。因此，`Scene` 和 `Object` 是组合关系。

```
Scene ◆------> Object
```

> **有趣的情况 - 自组合：** `Object` 类自身就包含一个 `children` 容器（`vector<Object*>`），用于构建场景树。一个 `Object` 可以包含其他 `Object`，这是一种典型的自组合关系。

### 5. 实现 (Realization / Implementation)

特指一个类（实现类）实现了某个**抽象类** (Abstract Class) 或 **接口** (Interface) 的所有方法。

**符号：** 一条虚线，末端带一个指向接口或抽象类的空心三角箭头 `- - - -▷`（和继承很像，但线是虚的）

**示例：** 在《太空战机》项目中，我们有一个 `Scene` 抽象基类（包含纯虚函数），而 `SceneMain` 等具体的场景类继承了它并实现了所有纯虚函数。我们就说 `SceneMain` 实现了 `Scene` 接口。

```
SceneMain - - - -▷ Scene (Abstract)
```

> **C++中的接口：** C++本身没有 `interface` 关键字，但我们通常将"没有成员变量，只有纯虚函数"的抽象类视为接口。

---

## 关系总结

依赖、关联、聚合、组合这四种关系很容易混淆。你可以根据**关系的强弱**来理解它们：

```
依赖 < 关联 < 聚合 < 组合
```

| 关系类型 | 强度 | 说明 |
|---------|------|------|
| **依赖** | 最弱 | 偶尔用到（如函数传参） |
| **关联** | 较弱 | 持续用到（成员变量引用），但彼此独立 |
| **聚合** | 较强 | 拥有，但不控制其生命周期 |
| **组合** | 最强 | 拥有，并且完全控制其生命周期 |

<img src="https://theorhythm.top/gamedev/opt/OPT10.webp" alt="UML关系总结" style="display: block; margin: auto; width: 800px;" />

> **实用建议：** 在实际绘制UML图时，不必过于纠结于绝对的定义。UML图的核心目的是清晰地表达你的设计思路。有时，即便两个类是组合关系，为了突出它们之间的双向通信，画成双向关联也完全可以。**实用性永远是第一位的。**

---

## 结语

到这里，UML的基础知识就介绍完了。如果还有些模糊的地方也不用担心，在后续的课程中，我们会频繁地使用这些类图来分析和设计代码，你会在不断的实践中加深对它们的理解。