# 修正内存泄露问题

<link rel="stylesheet" href="/css/videoStyles.css" />

<div class="video-container">
  <div class="video-tabs">
    <a href="#bilibili" class="video-tab bilibili-tab">哔哩哔哩</a>
    <a href="#youtube" class="video-tab youtube-tab">YouTube</a>
  </div>

  <div id="youtube" class="video-content">
    <iframe 
      class="video-frame"
      src="https://www.youtube.com/embed/RWjvUs9IoKQ?si=2EcHHYM5GRGXjVJ4" 
      frameborder="0" 
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
      allowfullscreen>
    </iframe>
  </div>
  
  <div id="bilibili" class="video-content">
    <iframe 
      class="video-frame"
      src="//player.bilibili.com/player.html?bvid=BV1Xg5jzDEj9&page=1&autoplay=0&danmaku=0&high_quality=1" 
      scrolling="no" 
      border="0" 
      frameborder="no" 
      framespacing="0" 
      allowfullscreen="true">
    </iframe>
  </div>
</div>

在前一课中，我们对游戏代码进行了各种优化和完善，包括命名规范统一、碰撞器设计改进、添加空指针检查等。这些改进提高了代码的可读性和健壮性，但游戏中仍然存在一个严重的问题——内存泄漏。本课将着重解决游戏中的内存泄漏问题，确保资源能够正确释放。

## 一、什么是内存泄漏

内存泄漏（Memory Leak）是指程序在运行过程中分配了内存空间，但在不再需要这些内存时没有正确释放它们，导致这些内存一直被占用，无法被其他程序使用。长时间运行的程序如果存在内存泄漏，会导致可用内存逐渐减少，最终可能导致程序崩溃或系统变得缓慢。

在C++中，内存泄漏通常有以下几种情况：

1. 使用`new`分配内存但没有对应的`delete`
2. 使用`new[]`分配数组但没有对应的`delete[]`
3. 循环引用导致的智能指针（如`shared_ptr`）无法自动释放

在我们的游戏中，主要是第一种情况：我们使用`new`创建了大量对象，但没有在适当的时机调用`delete`来释放它们。

## 二、我们游戏中的内存泄漏问题

通过分析代码，我们发现游戏中有几处主要的内存泄漏：

### 1. 对象清理时没有释放子对象

在游戏对象的层次结构中，父对象应该负责清理其子对象。但在原有的`Object::clean()`方法中，只调用了子对象的`clean()`方法，没有真正删除子对象：

```cpp
// 修改前
void Object::clean() {
    for (auto& child : children_) {
        child->clean();
    }
    children_.clear();
}
```

这段代码只是从容器中移除了子对象的指针，但并没有释放这些对象占用的内存，导致内存泄漏。

### 2. 场景对象的清理不完整

类似地，`Scene`类管理着两种子对象（世界对象和屏幕对象），但在清理时也没有释放它们：

```cpp
// 修改前
void Scene::clean()
{
    for (auto &child : children_world_)
    {
        child->clean();
    }
    children_world_.clear();
    for (auto &child : children_screen_)
    {
        child->clean();
    }
    children_screen_.clear();
}
```

### 3. 特效对象的资源管理问题

`Effect`类有一个特殊的成员`next_object_`，它可能在特效完成后添加到场景中。但如果特效被清理时，`next_object_`尚未添加到场景，则会导致该对象泄漏。

### 4. 玩家死亡特效的处理不当

在玩家死亡时，会创建一个死亡特效。原来的实现是每次死亡都创建一个新的特效对象，但旧的特效对象没有被正确清理：

```cpp
// 修改前
void Player::checkIsDead()
{
    if (!stats_->getIsAlive()){
        game_.getCurrentScene()->safeAddChild(effect_);
        effect_->setPosition(getPosition());
        setActive(false);
        game_.playSound("assets/sound/female-scream-02-89290.mp3");
    }
}
```

## 三、解决内存泄漏的方法

为了解决上述内存泄漏问题，我们进行了以下修改：

### 1. 完善对象清理方法

修改`Object::clean()`方法，确保子对象不仅被清理，还被正确删除：

```cpp
// 修改后
void Object::clean() {
    for (auto& child : children_) {
        child->clean();
        delete child;
        child = nullptr;
    }
    children_.clear();
}
```

这个改动确保了每个子对象都被正确删除，并将指针设置为`nullptr`防止悬挂指针（dangling pointer）。

### 2. 同样完善场景的清理方法

对`Scene::clean()`方法进行类似修改：

```cpp
// 修改后
void Scene::clean()
{
    for (auto &child : children_world_)
    {
        child->clean();
        delete child;
        child = nullptr;
    }
    children_world_.clear();
    for (auto &child : children_screen_)
    {
        child->clean();
        delete child;
        child = nullptr;
    }
    children_screen_.clear();
}
```

### 3. 增强特效对象的资源管理

为`Effect`类添加`clean()`方法，确保`next_object_`被正确处理：

```cpp
void Effect::clean()
{
    ObjectWorld::clean();
    if (next_object_){      // 如果next_object_已经添加到场景中，就不应该再去删除
        next_object_->clean();
        delete next_object_;
        next_object_ = nullptr;
    }
}
```

并且在特效完成时将`next_object_`设为`nullptr`，防止多次删除同一对象：

```cpp
void Effect::checkFinish()
{
    if (!sprite_anim_ || sprite_anim_->isFinish()){
        setActive(false);
        need_remove_ = true;
        if (next_object_){
            game_.getCurrentScene()->safeAddChild(next_object_);
            next_object_ = nullptr;
        }
    }
}
```

### 4. 改进玩家死亡特效处理

改变处理玩家死亡特效的方式，不再每次创建新特效，而是重用同一个特效对象：

```cpp
// 在Player::init()中
effect_ = Effect::addEffectChild(game_.getCurrentScene(), "assets/effect/1764.png", glm::vec2(0), 2.0f);
effect_->setActive(false);

// 在Player::checkIsDead()中
void Player::checkIsDead()
{
    if (!stats_->getIsAlive()){
        effect_->setActive(true);
        effect_->setPosition(getPosition());
        setActive(false);
        game_.playSound("assets/sound/female-scream-02-89290.mp3");
    }
}
```

这样，特效对象在初始化时就创建好并添加到场景中，但默认是不激活的。当玩家死亡时，只需激活该特效并设置位置即可，避免了多次创建和删除特效对象的开销。

## 四、内存泄漏的防范策略

除了修复已发现的内存泄漏外，我们还可以采取一些策略来防止未来出现类似问题：

### 1. 使用智能指针

C++11引入了智能指针，如`std::unique_ptr`和`std::shared_ptr`，它们可以自动管理内存。在未来的开发中，考虑使用智能指针替代原始指针：

```cpp
// 使用智能指针的示例
std::unique_ptr<Sprite> sprite_idle_;
std::unique_ptr<Collider> collider_;

// 创建对象
sprite_idle_ = std::make_unique<Sprite>();
```

### 2. 遵循RAII原则

RAII（Resource Acquisition Is Initialization）是C++中资源管理的一种模式，它将资源的生命周期与对象的生命周期绑定在一起。例如：

```cpp
class ResourceOwner {
private:
    Resource* resource_;
    
public:
    ResourceOwner() : resource_(new Resource()) {}
    ~ResourceOwner() { delete resource_; }
    
    // 禁止拷贝
    ResourceOwner(const ResourceOwner&) = delete;
    ResourceOwner& operator=(const ResourceOwner&) = delete;
};
```

### 3. 使用内存泄漏检测工具

在开发过程中，可以使用工具如Valgrind（Linux）、Dr. Memory（Windows）或Xcode的Instruments（macOS）来检测内存泄漏。

### 4. 明确所有权关系

在设计类时，应明确每个对象的所有权关系：哪个对象负责创建，哪个对象负责删除。这样可以避免责任不清导致的内存泄漏或重复删除。

## 五、内存泄漏的监测与调试

在实际开发中，如何发现和定位内存泄漏也是一项重要技能。以下是几种常用方法：

### 1. 使用专业工具

- **Valgrind**：Linux平台上的强大工具，可以检测内存泄漏和其他内存错误
- **Dr. Memory**：跨平台工具，适用于Windows、Linux和Mac
- **Instruments**：macOS上Xcode附带的性能分析工具，包含Leaks工具
- **Visual Studio的内存分析器**：适用于Windows平台

### 2. 手动监控内存使用

在关键位置添加计数器，跟踪对象的创建和销毁：

```cpp
// 在类的静态变量中跟踪
class MyClass {
private:
    static int instance_count_;
    
public:
    MyClass() { ++instance_count_; }
    ~MyClass() { --instance_count_; }
    
    static int getInstanceCount() { return instance_count_; }
};

int MyClass::instance_count_ = 0;

// 在游戏退出前检查
void Game::cleanup() {
    std::cout << "Remaining MyClass instances: " << MyClass::getInstanceCount() << std::endl;
    // 如果不为0，则可能存在泄漏
}
```

### 3. 观察长时间运行的行为

有些内存泄漏只在长时间运行后才会显现。可以让程序运行较长时间，并监控其内存使用情况，看是否有持续增长的趋势。

## 六、我们游戏中的内存管理模型

通过这次修复，我们的游戏采用了一个清晰的内存管理模型：

1. **层次化所有权**：父对象拥有并负责清理其子对象
2. **显式生命周期**：对象的创建和销毁由明确的函数（init和clean）控制
3. **集中式资源管理**：场景对象作为顶层容器，最终负责清理所有游戏对象

这种模型虽然不如现代C++的智能指针自动化程度高，但对于理解对象生命周期和资源管理非常有教育意义，也足够简单和直观。

## 总结

在这一课中，我们：

1. **了解了内存泄漏的概念**：程序分配内存后没有正确释放，导致资源浪费
2. **识别了游戏中的内存泄漏问题**：对象清理不完整、特效对象管理不当等
3. **修复了这些问题**：改进clean方法、重用特效对象等
4. **学习了防范内存泄漏的策略**：使用智能指针、遵循RAII原则等
5. **了解了内存泄漏的监测方法**：专业工具、手动监控等

内存管理是C++游戏开发中一个重要且挑战性的方面。通过正确处理内存分配和释放，我们不仅可以避免资源浪费和程序崩溃，还可以提高游戏的稳定性和性能。在未来的游戏开发中，我们应该将内存管理视为基础工作的一部分，从设计阶段就考虑对象的所有权和生命周期。

## 练习

1. 使用Valgrind或其他内存检测工具，检查修改后的游戏是否还存在内存泄漏
2. 尝试将游戏中的某个类（如Sprite）改为使用智能指针管理
3. 为游戏添加一个简单的内存使用统计功能，显示创建的对象数量
