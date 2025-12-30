/**
 * 课程数据模型
 * 
 * contentPath字段指向Markdown文件的路径
 */
const courses = [
  // Difficulty Levels:
  // 1: 入门级 (Entry)
  // 2: 初级 (Beginner)
  // 3: 进阶级 (Intermediate)
  // 4: 中级 (Advanced)
  // 5: 高级 (Expert)
  {
    id: "sdl-space-shooter",
    title: "SDL与太空战机",
    description: "通过SDL2图形库学习C++游戏开发基础,从零开始构建一款经典的太空射击游戏。掌握游戏循环、输入处理、图像渲染和音频播放等核心概念。",
    coverImage: "https://theorhythm.top/gamedev/screen_shooter_2.png",
    category: "mainline",
    difficulty: 1,
    updateAt: "2025-02-01",
    status: "已完成",
    resources: {
      githubLink: "https://github.com/WispSnow/SDLShooter",
      baiduLink: "https://pan.baidu.com/s/1aGyLFfrQQlOylKy03WLL-g?pwd=hmjz"
    },
    parts: [
      {
        id: "intro",
        title: "课程简介",
        description: "了解本课程的学习内容和目标,以及太空射击游戏项目概览。",
        contentPath: "backend/src/courses/SDL与太空战机/00 SDL与太空战机.md"
      },
      {
        id: "environment-setup",
        title: "环境配置说明",
        description: "准备C++和SDL2开发环境,为游戏开发做好准备。",
        contentPath: "backend/src/courses/SDL与太空战机/01 环境配置说明.md"
      },
      {
        id: "vscode-config",
        title: "VScode配置",
        description: "配置Visual Studio Code作为C++游戏开发IDE。",
        contentPath: "backend/src/courses/SDL与太空战机/02 VScode配置.md"
      },
      {
        id: "game-assets",
        title: "获取游戏素材",
        description: "下载并整理游戏开发所需的图像和音频资源。",
        contentPath: "backend/src/courses/SDL与太空战机/03 获取游戏素材.md"
      },
      {
        id: "cmake-setup",
        title: "Cmake配置",
        description: "使用CMake建立跨平台的项目构建系统。",
        contentPath: "backend/src/courses/SDL与太空战机/04 Cmake配置.md"
      },
      {
        id: "sdl-basics",
        title: "SDL框架基本原理",
        description: "了解SDL库的核心概念和基本工作原理。",
        contentPath: "backend/src/courses/SDL与太空战机/05 SDL框架基本原理.md"
      },
      {
        id: "sdl-fundamentals",
        title: "SDL基础-图片音乐文本",
        description: "学习如何在SDL中加载和渲染图像、播放音乐和显示文本。",
        contentPath: "backend/src/courses/SDL与太空战机/06 SDL基础-图片音乐文本.md"
      },
      {
        id: "game-logic",
        title: "游戏的基本逻辑",
        description: "设计并实现游戏的核心逻辑和流程控制。",
        contentPath: "backend/src/courses/SDL与太空战机/07 游戏的基本逻辑.md"
      },
      {
        id: "game-framework",
        title: "搭建游戏框架",
        description: "创建游戏的基本架构,包括主循环和场景管理。",
        contentPath: "backend/src/courses/SDL与太空战机/08 搭建游戏框架.md"
      },
      {
        id: "game-window-events",
        title: "游戏窗口与SDL事件系统",
        description: "实现游戏窗口和事件处理系统。",
        contentPath: "backend/src/courses/SDL与太空战机/09 游戏窗口与SDL事件系统.md"
      },
      {
        id: "player-ship-singleton",
        title: "显示玩家飞机与单例模式",
        description: "使用单例模式设计玩家飞机类,并在游戏中显示。",
        contentPath: "backend/src/courses/SDL与太空战机/10 显示玩家飞机与单例模式.md"
      },
      {
        id: "keyboard-controls",
        title: "键盘控制飞机移动",
        description: "实现键盘输入处理,使玩家能够控制飞机移动。",
        contentPath: "backend/src/courses/SDL与太空战机/11 键盘控制飞机移动.md"
      },
      {
        id: "frame-independent-movement",
        title: "让速度不受帧率影响",
        description: "实现帧率独立的运动系统,确保游戏在不同性能的设备上表现一致。",
        contentPath: "backend/src/courses/SDL与太空战机/12 让速度不受帧率影响.md"
      },
      {
        id: "player-bullets",
        title: "玩家子弹与射击控制",
        description: "实现玩家射击功能和子弹系统。",
        contentPath: "backend/src/courses/SDL与太空战机/13 玩家子弹与射击控制.md"
      },
      {
        id: "enemy-generation",
        title: "随机生成敌机",
        description: "设计敌机系统,实现随机生成不同类型的敌机。",
        contentPath: "backend/src/courses/SDL与太空战机/14 随机生成敌机.md"
      },
      {
        id: "enemy-bullets",
        title: "敌机发射子弹",
        description: "为敌机添加射击能力,增加游戏挑战性。",
        contentPath: "backend/src/courses/SDL与太空战机/15 敌机发射子弹.md"
      },
      {
        id: "collision-detection",
        title: "碰撞检测与击杀",
        description: "实现游戏中的碰撞检测系统,处理子弹击中和飞机相撞。",
        contentPath: "backend/src/courses/SDL与太空战机/16 碰撞检测与击杀.md"
      },
      {
        id: "explosion-animation",
        title: "爆炸序列帧动画",
        description: "为击毁敌机添加精美的爆炸动画效果。",
        contentPath: "backend/src/courses/SDL与太空战机/17 爆炸序列帧动画.md"
      },
      {
        id: "item-drops",
        title: "物品掉落与拾取",
        description: "实现物品掉落系统,让玩家可以收集增强道具。",
        contentPath: "backend/src/courses/SDL与太空战机/18 物品掉落与拾取.md"
      },
      {
        id: "audio-effects",
        title: "添加音乐音效",
        description: "为游戏添加背景音乐和音效,提升游戏体验。",
        contentPath: "backend/src/courses/SDL与太空战机/19 添加音乐音效.md"
      },
      {
        id: "scrolling-background",
        title: "星空背景卷轴",
        description: "实现滚动的星空背景,增强游戏视觉效果。",
        contentPath: "backend/src/courses/SDL与太空战机/20 星空背景卷轴.md"
      },
      {
        id: "ui-health",
        title: "UI-血量图标",
        description: "显示玩家生命值的用户界面元素。",
        contentPath: "backend/src/courses/SDL与太空战机/21 UI-血量图标.md"
      },
      {
        id: "ui-score",
        title: "UI-得分纪录",
        description: "实现游戏得分系统和显示。",
        contentPath: "backend/src/courses/SDL与太空战机/22 UI-得分纪录.md"
      },
      {
        id: "title-scene",
        title: "标题场景",
        description: "设计和实现游戏的标题屏幕。",
        contentPath: "backend/src/courses/SDL与太空战机/23 标题场景.md"
      },
      {
        id: "game-over-delay",
        title: "结束场景-延时切换",
        description: "实现游戏结束场景和延时切换效果。",
        contentPath: "backend/src/courses/SDL与太空战机/24 结束场景-延时切换.md"
      },
      {
        id: "text-input",
        title: "结束场景-文字输入",
        description: "在游戏结束场景添加玩家名称输入功能。",
        contentPath: "backend/src/courses/SDL与太空战机/25 结束场景-文字输入.md"
      },
      {
        id: "chinese-input",
        title: "正确处理中文退格",
        description: "优化文本输入系统,正确处理中文字符和退格。",
        contentPath: "backend/src/courses/SDL与太空战机/26 正确处理中文退格.md"
      },
      {
        id: "blinking-cursor",
        title: "结束场景-闪烁光标",
        description: "为文本输入添加闪烁光标效果,提升用户体验。",
        contentPath: "backend/src/courses/SDL与太空战机/27 结束场景-闪烁光标.md"
      },
      {
        id: "scoreboard",
        title: "结束场景-得分榜",
        description: "实现游戏得分榜显示功能。",
        contentPath: "backend/src/courses/SDL与太空战机/28 结束场景-得分榜.md"
      },
      {
        id: "save-load-scores",
        title: "得分榜的保存与读取",
        description: "实现得分数据的持久化存储和加载。",
        contentPath: "backend/src/courses/SDL与太空战机/29 得分榜的保存与读取.md"
      },
      {
        id: "final-polish",
        title: "最后的完善",
        description: "进行游戏的最终调整和优化,提升整体品质。",
        contentPath: "backend/src/courses/SDL与太空战机/30 最后的完善.md"
      },
      {
        id: "end",
        title: "结束",
        description: "课程总结与未来展望。",
        contentPath: "backend/src/courses/SDL与太空战机/31 结束.md"
      },
      {
        id: "sd3-changes",
        title: "SDL3的变化",
        description: "相比SDL2,SDL3的变化与改进",
        contentPath: "backend/src/courses/SDL与太空战机/ex06 SDL3的变化.md"
      }
    ]
  },
  {
    id: "modular-ghost-escape",
    title: "模块化编程与幽灵逃生",
    description: "学习C++游戏开发中的模块化编程思想,使用SDL3、GLM数学库构建一款生存类游戏。掌握组件化设计、向量数学和资源管理等高级概念。",
    coverImage: "https://theorhythm.top/gamedev/GE/screen_ge_2.png",
    category: "mainline",
    difficulty: 2,
    updateAt: "2025-06-01",
    status: "已完成",
    resources: {
      githubLink: "https://github.com/WispSnow/GhostEscape",
      baiduLink: "https://pan.baidu.com/s/16OuMaAqehGjzSoMS19zNcA?pwd=5brp"
    },
    parts: [
      {
        id: "intro",
        title: "课程简介",
        description: "深入了解本课程的学习内容和目标。",
        contentPath: "backend/src/courses/模块化编程与幽灵逃生/00 模块化编程与幽灵逃生.md"
      },
      {
        id: "part-01",
        title: "环境配置",
        description: "配置开发环境,包括SDL3和GLM数学库的安装与配置。",
        contentPath: "backend/src/courses/模块化编程与幽灵逃生/01-环境配置.md"
      },
      {
        id: "part-02",
        title: "SDL3新的文本绘制",
        description: "探索SDL3中新增的文本渲染API和GLM数学库的基础使用。",
        contentPath: "backend/src/courses/模块化编程与幽灵逃生/02-SDL3新的文本绘制.md"
      },
      {
        id: "part-03",
        title: "游戏框架设计",
        description: "深入探讨游戏框架的设计理念,包括模块化与分层设计、继承关系设计、自动挂载及清理机制。",
        contentPath: "backend/src/courses/模块化编程与幽灵逃生/03-游戏框架设计.md"
      },
      {
        id: "part-04",
        title: "基础框架的实现",
        description: "实现游戏框架的核心组件Game类,包括单例模式的设计、SDL3的初始化、游戏主循环的实现、事件处理系统等。",
        contentPath: "backend/src/courses/模块化编程与幽灵逃生/04-基础框架的实现.md"
      },
      {
        id: "part-05",
        title: "背景网格与视窗移动",
        description: "实现游戏的背景系统和视窗控制,包括网格背景的绘制和视窗的平滑移动。",
        contentPath: "backend/src/courses/模块化编程与幽灵逃生/05-背景网格与视窗移动.md"
      },
      {
        id: "part-06",
        title: "玩家角色与摄像机跟随",
        description: "设计和实现玩家角色系统,包括角色移动控制和摄像机跟随功能。",
        contentPath: "backend/src/courses/模块化编程与幽灵逃生/06-玩家角色与摄像机跟随.md"
      },
      {
        id: "part-07",
        title: "素材存储类",
        description: "设计高效的资源管理系统,实现游戏素材的统一加载和管理。",
        contentPath: "backend/src/courses/模块化编程与幽灵逃生/07-素材存储类.md"
      },
      {
        id: "part-08",
        title: "自动挂载功能",
        description: "实现组件的自动挂载系统,简化游戏对象的创建和管理过程。",
        contentPath: "backend/src/courses/模块化编程与幽灵逃生/08-自动挂载功能.md"
      },
      {
        id: "part-09",
        title: "精灵图类",
        description: "实现精灵图渲染系统,处理游戏中的图像显示。",
        contentPath: "backend/src/courses/模块化编程与幽灵逃生/09-精灵图类.md"
      },
      {
        id: "part-10",
        title: "精灵动画类",
        description: "开发精灵动画系统,为游戏对象添加动画效果。",
        contentPath: "backend/src/courses/模块化编程与幽灵逃生/10-精灵动画类.md"
      },
      {
        id: "part-11",
        title: "根据状态切换动画",
        description: "实现基于状态机的动画系统,使角色能够根据不同状态显示相应的动画。",
        contentPath: "backend/src/courses/模块化编程与幽灵逃生/11-根据状态切换动画.md"
      },
      {
        id: "part-12",
        title: "敌方类幽灵",
        description: "实现游戏的敌方AI系统,包括基础的追踪行为、状态管理和动画控制。",
        contentPath: "backend/src/courses/模块化编程与幽灵逃生/12-敌方类幽灵.md"
      },
      {
        id: "part-13",
        title: "碰撞盒组件",
        description: "设计和实现碰撞检测系统,处理游戏对象之间的物理交互。",
        contentPath: "backend/src/courses/模块化编程与幽灵逃生/13-碰撞盒组件.md"
      },
      {
        id: "part-14",
        title: "设置组件的锚点",
        description: "实现组件锚点系统,优化游戏对象的位置控制。",
        contentPath: "backend/src/courses/模块化编程与幽灵逃生/14-设置组件的锚点.md"
      },
      {
        id: "part-15",
        title: "战斗属性组件",
        description: "设计战斗系统的属性组件,管理生命值、攻击力等游戏数值。",
        contentPath: "backend/src/courses/模块化编程与幽灵逃生/15-战斗属性组件.md"
      },
      {
        id: "part-16",
        title: "特效类及安全添加",
        description: "实现游戏特效系统,并确保特效的安全创建和管理。",
        contentPath: "backend/src/courses/模块化编程与幽灵逃生/16-特效类及安全添加.md"
      },
      {
        id: "part-17",
        title: "敌方幽灵生成器",
        description: "实现敌人生成系统,控制游戏难度和节奏。",
        contentPath: "backend/src/courses/模块化编程与幽灵逃生/17-敌方幽灵生成器.md"
      },
      {
        id: "part-18",
        title: "鼠标显示类",
        description: "实现自定义鼠标光标系统,增强游戏的交互体验。",
        contentPath: "backend/src/courses/模块化编程与幽灵逃生/18-鼠标显示类.md"
      },
      {
        id: "part-19",
        title: "法术类",
        description: "实现游戏中的法术系统,为玩家提供多样的技能选择。",
        contentPath: "backend/src/courses/模块化编程与幽灵逃生/19-法术类.md"
      },
      {
        id: "part-20",
        title: "武器类",
        description: "设计和实现武器系统,管理技能释放。",
        contentPath: "backend/src/courses/模块化编程与幽灵逃生/20-武器类.md"
      },
      {
        id: "part-21",
        title: "敌方生命条标签",
        description: "实现敌人生命值显示系统,提供直观的战斗反馈。",
        contentPath: "backend/src/courses/模块化编程与幽灵逃生/21-敌方生命条标签.md"
      },
      {
        id: "part-22",
        title: "玩家状态HUD",
        description: "实现玩家状态界面,显示生命值、法力等关键信息。",
        contentPath: "backend/src/courses/模块化编程与幽灵逃生/22-玩家状态HUD.md"
      },
      {
        id: "part-23",
        title: "技能冷却HUD",
        description: "实现技能冷却显示系统,为玩家提供技能使用状态的反馈。",
        contentPath: "backend/src/courses/模块化编程与幽灵逃生/23-技能冷却HUD.md"
      },
      {
        id: "part-24",
        title: "文字HUD类",
        description: "设计并实现一个完整的文字HUD系统,包括基础文本标签TextLabel和高级文本控件HUDText。",
        contentPath: "backend/src/courses/模块化编程与幽灵逃生/24-文字HUD类.md"
      },
      {
        id: "part-25",
        title: "封装音频功能",
        description: "实现游戏的音频系统,管理音效和背景音乐。",
        contentPath: "backend/src/courses/模块化编程与幽灵逃生/25-封装音频功能.md"
      },
      {
        id: "part-26",
        title: "标题场景-变化颜色的外框",
        description: "实现游戏标题场景的动态外框效果。",
        contentPath: "backend/src/courses/模块化编程与幽灵逃生/26-标题场景-变化颜色的外框.md"
      },
      {
        id: "part-27",
        title: "标题场景-按钮HUD",
        description: "实现标题场景的交互按钮系统。",
        contentPath: "backend/src/courses/模块化编程与幽灵逃生/27-标题场景-按钮HUD.md"
      },
      {
        id: "part-28",
        title: "安全切换场景",
        description: "实现安全的场景切换机制,确保资源的正确释放和加载。",
        contentPath: "backend/src/courses/模块化编程与幽灵逃生/28-安全切换场景.md"
      },
      {
        id: "part-29",
        title: "标题场景-Credits页面",
        description: "实现游戏制作人员名单页面。",
        contentPath: "backend/src/courses/模块化编程与幽灵逃生/29-标题场景-Credits页面.md"
      },
      {
        id: "part-30",
        title: "暂停重启与事件穿透",
        description: "实现游戏的暂停系统和事件处理机制。",
        contentPath: "backend/src/courses/模块化编程与幽灵逃生/30-暂停重启与事件穿透.md"
      },
      {
        id: "part-31",
        title: "计时器与死亡画面",
        description: "实现游戏计时系统和死亡场景。",
        contentPath: "backend/src/courses/模块化编程与幽灵逃生/31-计时器与死亡画面.md"
      },
      {
        id: "part-32",
        title: "储存与读取二进制存档",
        description: "实现游戏存档系统,支持游戏进度的保存和读取。",
        contentPath: "backend/src/courses/模块化编程与幽灵逃生/32-储存与读取二进制存档.md"
      },
      {
        id: "part-33",
        title: "视差滚动星空背景",
        description: "实现多层视差滚动背景效果,创造深度感。",
        contentPath: "backend/src/courses/模块化编程与幽灵逃生/33-视差滚动星空背景.md"
      },
      {
        id: "part-34",
        title: "窗口缩放与游戏变速",
        description: "实现窗口大小调整和游戏速度控制功能,提供灵活的游戏体验。",
        contentPath: "backend/src/courses/模块化编程与幽灵逃生/34-窗口缩放与游戏变速.md"
      },
      {
        id: "part-35",
        title: "最后的完善",
        description: "对游戏进行最终优化和完善,包括统一命名规范、改进碰撞检测系统、增强对象创建的安全性、优化边界检测等。通过细致的代码审查和改进,提升游戏的稳定性和可维护性。",
        contentPath: "backend/src/courses/模块化编程与幽灵逃生/35-最后的完善.md"
      },
      {
        id: "part-36",
        title: "结束",
        description: "总结整个课程的学习内容,回顾关键概念和技术要点。展望游戏开发的未来方向,为进一步学习提供指导。",
        contentPath: "backend/src/courses/模块化编程与幽灵逃生/36-结束.md"
      },
      {
        id: "ex1",
        title: "修正内存泄露问题",
        description: "解决游戏中的内存泄露问题。",
        contentPath: "backend/src/courses/模块化编程与幽灵逃生/ex1-修正内存泄露问题.md"
      }
    ]
  },
  {
    id: "layer-sunny-land",
    title: "分层架构与阳光岛",
    description: "学习C++游戏开发中的分层架构设计,使用SDL3、glm、nlohmann-json、Tiled构建一款平台跳跃游戏。掌握现代游戏引擎的设计理念与现代C++的特性。",
    coverImage: "https://theorhythm.top/gamedev/SL/SL_screenshot_3.png",
    category: "mainline",
    difficulty: 3,
    updateAt: "2025-09-01",
    status: "已完成",
    resources: {
      githubLink: "https://github.com/WispSnow/SunnyLand",
      baiduLink: "https://pan.baidu.com/s/1pmz0GCXpDr2d79ieTXkt5g?pwd=23n8"
    },
    parts: [
      {
        id: "intro",
        title: "课程简介",
        description: "了解分层架构与阳光岛的学习内容和目标。",
        contentPath: "backend/src/courses/分层架构与阳光岛/00 分层架构与阳光岛.md"
      },
      {
        id: "environment-setup",
        title: "环境安装及测试",
        description: "搭建开发环境,配置SDL3、glm、nlohmann-json、spdlog等库,为后续开发做好准备。",
        contentPath: "backend/src/courses/分层架构与阳光岛/01 环境安装及测试.md"
      },
      {
        id: "spdlog-json-basics",
        title: "spdlog与json基础",
        description: "学习使用spdlog日志库进行调试信息输出,掌握nlohmann/json进行数据管理的基础方法。",
        contentPath: "backend/src/courses/分层架构与阳光岛/02 spdlog与json基础.md"
      },
      {
        id: "game-architecture",
        title: "游戏架构设计",
        description: "深入理解分层架构与组件化设计思想,为构建清晰、可扩展的游戏引擎奠定理论基础。",
        contentPath: "backend/src/courses/分层架构与阳光岛/03 游戏架构设计.md"
      },
      {
        id: "main-loop-framerate",
        title: "主循环与帧率控制",
        description: "构建游戏的心脏——主循环,实现稳定的帧率控制和delta time计算。",
        contentPath: "backend/src/courses/分层架构与阳光岛/04 主循环与帧率控制.md"
      },
      {
        id: "resource-manager",
        title: "资源管理模块",
        description: "设计并实现完整的资源管理系统,包括纹理、音频和字体的自动化加载与管理。",
        contentPath: "backend/src/courses/分层架构与阳光岛/05 资源管理模块.md"
      },
      {
        id: "renderer-camera-sprite",
        title: "渲染器、相机与精灵",
        description: "建立完整的2D渲染管线,实现精灵渲染、相机系统与坐标转换。",
        contentPath: "backend/src/courses/分层架构与阳光岛/06 渲染器、相机与精灵.md"
      },
      {
        id: "config-file",
        title: "读取保存配置文件",
        description: "使用JSON格式管理游戏配置,支持外部配置文件的读取与保存。",
        contentPath: "backend/src/courses/分层架构与阳光岛/07 读取保存配置文件.md"
      },
      {
        id: "input-manager",
        title: "输入管理类",
        description: "构建强大且可配置的输入管理系统,支持键盘、鼠标的多种状态检测与动作绑定。",
        contentPath: "backend/src/courses/分层架构与阳光岛/08 输入管理类.md"
      },
      {
        id: "gameobject-component",
        title: "游戏对象与组件",
        description: "实现GameObject和Component基类,建立面向组件的游戏编程架构。",
        contentPath: "backend/src/courses/分层架构与阳光岛/09 游戏对象与组件.md"
      },
      {
        id: "transform-sprite-component",
        title: "变换与精灵组件",
        description: "创建TransformComponent和SpriteComponent,赋予游戏对象位置、旋转、缩放和视觉表现。",
        contentPath: "backend/src/courses/分层架构与阳光岛/10 变换与精灵组件.md"
      },
      {
        id: "scene-management",
        title: "场景与场景管理",
        description: "设计场景系统和场景管理器,实现游戏不同状态的切换与管理。",
        contentPath: "backend/src/courses/分层架构与阳光岛/11 场景与场景管理.md"
      },
      {
        id: "level-loader-image",
        title: "关卡载入器-图片层",
        description: "使用Tiled地图编辑器,实现从JSON文件加载图片层的功能。",
        contentPath: "backend/src/courses/分层架构与阳光岛/12 关卡载入器-图片层.md"
      },
      {
        id: "level-loader-tile",
        title: "关卡载入器-瓦片层",
        description: "实现瓦片地图层的加载与渲染,构建游戏世界的基础地形。",
        contentPath: "backend/src/courses/分层架构与阳光岛/13 关卡载入器-瓦片层.md"
      },
      {
        id: "level-loader-object",
        title: "关卡载入器-对象层",
        description: "从Tiled地图加载对象层,动态生成游戏对象。",
        contentPath: "backend/src/courses/分层架构与阳光岛/14 关卡载入器-对象层.md"
      },
      {
        id: "physics-engine",
        title: "物理引擎与物理组件",
        description: "实现2D物理系统,包括重力、速度和加速度的物理组件。",
        contentPath: "backend/src/courses/分层架构与阳光岛/15 物理引擎与物理组件.md"
      },
      {
        id: "collider-component",
        title: "碰撞器组件与碰撞检测",
        description: "设计碰撞器组件,实现AABB碰撞检测算法。",
        contentPath: "backend/src/courses/分层架构与阳光岛/16 碰撞器组件与碰撞检测.md"
      },
      {
        id: "tilemap-collision",
        title: "瓦片地图层碰撞解析",
        description: "实现玩家与瓦片地图的碰撞检测与物理响应,让角色能在平台上行走。",
        contentPath: "backend/src/courses/分层架构与阳光岛/17 瓦片地图层碰撞解析.md"
      },
      {
        id: "object-collision",
        title: "对象间的碰撞解析",
        description: "处理游戏对象之间的碰撞检测与响应,实现复杂的交互逻辑。",
        contentPath: "backend/src/courses/分层架构与阳光岛/18 对象间的碰撞解析.md"
      },
      {
        id: "oneway-platform-slope",
        title: "瓦片层单向平台与斜坡",
        description: "实现单向平台(可从下方穿过)和斜坡地形的碰撞处理。",
        contentPath: "backend/src/courses/分层架构与阳光岛/19 瓦片层单向平台与斜坡.md"
      },
      {
        id: "player-state-machine",
        title: "玩家组件与状态机",
        description: "设计玩家控制组件,实现基于状态机的复杂角色行为管理。",
        contentPath: "backend/src/courses/分层架构与阳光岛/20 玩家组件与状态机.md"
      },
      {
        id: "animation-component",
        title: "动画组件与动画载入",
        description: "实现动画系统,支持序列帧动画的播放与状态切换。",
        contentPath: "backend/src/courses/分层架构与阳光岛/21 动画组件与动画载入.md"
      },
      {
        id: "health-component",
        title: "生命组件与死伤状态",
        description: "添加生命值系统,处理角色的受伤与死亡逻辑。",
        contentPath: "backend/src/courses/分层架构与阳光岛/22 生命组件与死伤状态.md"
      },
      {
        id: "player-interaction",
        title: "玩家与其他对象交互",
        description: "实现玩家与游戏世界中各种对象的交互机制,如收集道具、触发事件等。",
        contentPath: "backend/src/courses/分层架构与阳光岛/23 玩家与其他对象交互.md"
      },
      {
        id: "ai-component",
        title: "AI组件与AI行为",
        description: "设计AI组件,为敌人添加巡逻、追逐等智能行为。",
        contentPath: "backend/src/courses/分层架构与阳光岛/24 AI组件与AI行为.md"
      },
      {
        id: "climbing-state",
        title: "攀爬状态切换",
        description: "实现角色的攀爬机制,包括梯子检测和攀爬状态的流畅切换。",
        contentPath: "backend/src/courses/分层架构与阳光岛/25 攀爬状态切换.md"
      },
      {
        id: "coyote-time-invincibility",
        title: "土狼时间与无敌闪烁",
        description: "实现土狼时间(Coyote Time)提升跳跃手感,添加受伤后的无敌闪烁效果。",
        contentPath: "backend/src/courses/分层架构与阳光岛/26 土狼时间与无敌闪烁.md"
      },
      {
        id: "audio-engine",
        title: "音频引擎与音频组件",
        description: "封装SDL_mixer,实现音效和背景音乐的播放管理系统。",
        contentPath: "backend/src/courses/分层架构与阳光岛/27 音频引擎与音频组件.md"
      },
      {
        id: "level-switch-new-map",
        title: "关卡切换-新地图",
        description: "实现关卡之间的切换机制,加载新的地图和游戏对象。",
        contentPath: "backend/src/courses/分层架构与阳光岛/28 关卡切换-新地图.md"
      },
      {
        id: "level-switch-shared-data",
        title: "关卡切换-共享游戏数据",
        description: "在场景切换时保持玩家状态和游戏数据的连续性。",
        contentPath: "backend/src/courses/分层架构与阳光岛/29 关卡切换-共享游戏数据.md"
      },
      {
        id: "text-rendering",
        title: "文字渲染引擎",
        description: "实现文字渲染系统,支持多种字体和文本样式的显示。",
        contentPath: "backend/src/courses/分层架构与阳光岛/30 文字渲染引擎.md"
      },
      {
        id: "ui-manager",
        title: "UI管理器与UI元素",
        description: "设计UI系统的基础架构,实现UI元素的管理与渲染。",
        contentPath: "backend/src/courses/分层架构与阳光岛/31 UI管理器与UI元素.md"
      },
      {
        id: "health-icon-score",
        title: "生命图标与得分记录",
        description: "创建游戏HUD,显示玩家生命值和得分等关键信息。",
        contentPath: "backend/src/courses/分层架构与阳光岛/32 生命图标与得分记录.md"
      },
      {
        id: "button-interactive-ui",
        title: "按钮及可交互UI元素",
        description: "实现可交互的UI按钮系统,处理鼠标悬停和点击事件。",
        contentPath: "backend/src/courses/分层架构与阳光岛/33 按钮及可交互UI元素.md"
      },
      {
        id: "title-scene-overlay",
        title: "标题场景及场景重叠",
        description: "创建游戏标题场景,实现场景的层叠显示功能。",
        contentPath: "backend/src/courses/分层架构与阳光岛/34 标题场景及场景重叠.md"
      },
      {
        id: "pause-menu-scene",
        title: "暂停与菜单场景",
        description: "实现游戏暂停功能和暂停菜单界面。",
        contentPath: "backend/src/courses/分层架构与阳光岛/35 暂停与菜单场景.md"
      },
      {
        id: "ending-scene",
        title: "结束场景与最终完成",
        description: "实现游戏结束场景,完善游戏的最终细节,完成整个项目。",
        contentPath: "backend/src/courses/分层架构与阳光岛/36 结束场景与最终完成.md"
      }
    ]
  },
  {
    id: "side-game-optimization-and-design-patterns",
    title: "游戏优化与设计模式",
    description: "学习在真实项目中优化与重构的技巧与关键设计模式。以动手实践为核心,理论简明扼要,强调'学即能用,改即见效'。",
    coverImage: "https://theorhythm.top/gamedev/opt/opt-cover.webp",
    category: "side",
    difficulty: 2,
    updateAt: "2025-08-01",
    status: "更新中",
    parts: [
      {
        id: "intro",
        title: "课程简介",
        description: "了解本课程的学习内容和目标,聚焦'在真实项目中优化与重构',帮助你系统掌握常用的游戏优化技巧与关键设计模式。",
        contentPath: "backend/src/side-courses/游戏优化与设计模式/00 开篇.md"
      },
      {
        id: "uml-basics",
        title: "UML基础",
        description: "学习UML类图的基本概念,掌握类的表示方法和类与类之间的关系(继承、依赖、关联、聚合、组合、实现)。",
        contentPath: "backend/src/side-courses/游戏优化与设计模式/01 ULM基础.md"
      },
      {
        id: "singleton-pattern",
        title: "单例模式",
        description: "理解单例模式的核心思想与设计意图,掌握C++中实现单例模式的几种典型方式,分析项目中Game类的Meyers' Singleton实现。",
        contentPath: "backend/src/side-courses/游戏优化与设计模式/02 单例模式.md"
      },
      {
        id: "composite-pattern",
        title: "组合模式",
        description: "应用组合模式重构Player类,将输入控制逻辑从Player中分离出来形成独立组件,掌握'组合优于继承'的设计原则。",
        contentPath: "backend/src/side-courses/游戏优化与设计模式/03 组合模式.md"
      },
      {
        id: "chain-of-responsibility",
        title: "职责链模式",
        description: "学习如何利用游戏场景图这一天然的树形结构来实现责任链模式,将输入事件处理的责任从Player下放给MoveControl组件。",
        contentPath: "backend/src/side-courses/游戏优化与设计模式/04 职责链模式.md"
      },
      {
        id: "template-method",
        title: "模板方法模式",
        description: "理解模板方法模式的核心思想,掌握控制反转(IoC)的概念,分析从main()函数驱动到SDL3回调驱动的转变。",
        contentPath: "backend/src/side-courses/游戏优化与设计模式/05 模版方法模式.md"
      },
      {
        id: "prototype-pattern",
        title: "原型模式",
        description: "理解原型模式的核心思想,掌握如何在C++中实现clone()方法,应用原型模式将Weapon和Spell的创建过程解耦。",
        contentPath: "backend/src/side-courses/游戏优化与设计模式/06 原型模式.md"
      },
      {
        id: "factory-method",
        title: "工厂方法模式",
        description: "学习如何将对象的创建逻辑从使用者代码中分离出来,封装到专门的'工厂'类中,对比工厂方法与原型模式的优缺点。",
        contentPath: "backend/src/side-courses/游戏优化与设计模式/07 工厂方法模式.md"
      },
      {
        id: "state-pattern",
        title: "状态模式",
        description: "掌握如何将基于if-else和布尔标志的复杂状态管理重构为面向对象的状态机,应用状态模式彻底重构HUDButton类。",
        contentPath: "backend/src/side-courses/游戏优化与设计模式/08 状态模式.md"
      },
      {
        id: "view-frustum-culling",
        title: "视窗裁剪",
        description: "理解视窗裁剪的核心原理及其在游戏性能优化中的重要性,掌握如何通过包围盒检测来判断对象是否在屏幕可视范围内。",
        contentPath: "backend/src/side-courses/游戏优化与设计模式/09 视窗裁剪.md"
      },
      {
        id: "object-pool",
        title: "对象池模式",
        description: "理解性能瓶颈,认识频繁使用new和delete导致的性能开销与内存碎片问题,掌握对象池原理并实现泛用的模板类。",
        contentPath: "backend/src/side-courses/游戏优化与设计模式/10 对象池模式.md"
      },
      {
        id: "solid-principles",
        title: "SOLID原则",
        description: "学习编写优雅健壮代码的五大原则:单一职责、开闭原则、里氏替换、接口隔离、依赖倒置,以及'组合优于继承'原则。",
        contentPath: "backend/src/side-courses/游戏优化与设计模式/10ex SOLID原则.md"
      },
      {
        id: "facade-strategy",
        title: "外观模式与策略模式",
        description: "学习如何为复杂的子系统提供统一简化的接口(外观模式),以及如何将不同的行为算法封装成独立对象(策略模式)。",
        contentPath: "backend/src/side-courses/游戏优化与设计模式/11 外观模式与策略模式.md"
      },
      {
        id: "builder-pattern",
        title: "生成器模式",
        description: "学习如何将复杂对象的构建过程与其表示分离,通过生成器模式分解臃肿的对象构建逻辑,实现数据驱动的对象创建。",
        contentPath: "backend/src/side-courses/游戏优化与设计模式/12 生成器模式.md"
      },
      {
        id: "command-pattern",
        title: "命令模式",
        description: "学习如何将一个请求封装为一个对象,从而实现请求的参数化、排队、记录和撤销等功能,轻松实现双人同屏控制切换。",
        contentPath: "backend/src/side-courses/游戏优化与设计模式/13 命令模式.md"
      },
      {
        id: "observer-pattern",
        title: "观察者模式",
        description: "理解发布-订阅模型的核心思想,学习如何定义对象间的一对多依赖关系,实现UI的自动、响应式更新。",
        contentPath: "backend/src/side-courses/游戏优化与设计模式/14 观察者模式.md"
      },
      {
        id: "observer-dangling-pointer",
        title: "观察者模式:解决悬垂指针",
        description: "理解悬垂指针风险,学习通过在Observer和Subject之间建立双向联系来解决此问题,构建更健壮、更安全的观察者系统。",
        contentPath: "backend/src/side-courses/游戏优化与设计模式/15 观察者模式-悬垂指针.md"
      },
      {
        id: "dirty-flag",
        title: "脏标识模式",
        description: "掌握脏标识模式,学习如何使用布尔标志跟踪对象状态以延迟或避免昂贵的计算,实现延迟计算和按需更新。",
        contentPath: "backend/src/side-courses/游戏优化与设计模式/16 脏标识模式.md"
      },
      {
        id: "service-locator",
        title: "服务定位器模式",
        description: "学习如何通过静态中心注册点提供对全局服务的访问,解耦具体实现,告别繁琐的依赖注入链条。",
        contentPath: "backend/src/side-courses/游戏优化与设计模式/17 服务定位器.md"
      },
      {
        id: "decorator-pattern",
        title: "装饰模式",
        description: "学习如何在运行时动态地向对象添加新的功能或行为,通过'包装'对象的方式为其附加额外职责,结合CMake实现条件编译。",
        contentPath: "backend/src/side-courses/游戏优化与设计模式/18 装饰模式.md"
      },
      {
        id: "ecs-framework",
        title: "ECS框架详解",
        description: "深入理解Entity Component System架构模式,学习从面向对象到面向数据的思维转变,掌握稀疏集数据结构的高效实现。",
        contentPath: "backend/src/side-courses/游戏优化与设计模式/19 ECS框架详解.md"
      }
    ]
  }
];

module.exports = { courses }; 
