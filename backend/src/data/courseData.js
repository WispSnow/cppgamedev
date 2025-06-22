/**
 * 课程数据模型
 * 
 * contentPath字段指向Markdown文件的路径
 */
const courses = [
  {
    id: "sdl-space-shooter",
    title: "SDL与太空战机",
    description: "通过SDL2图形库学习C++游戏开发基础，从零开始构建一款经典的太空射击游戏。掌握游戏循环、输入处理、图像渲染和音频播放等核心概念。",
    coverImage: "https://theorhythm.top/gamedev/screen_shooter_2.png",
    status: "已完成",
    parts: [
      {
        id: "intro",
        title: "课程简介",
        description: "了解本课程的学习内容和目标，以及太空射击游戏项目概览。",
        contentPath: "backend/src/courses/SDL与太空战机/00 SDL与太空战机.md"
      },
      {
        id: "environment-setup",
        title: "环境配置说明",
        description: "准备C++和SDL2开发环境，为游戏开发做好准备。",
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
        description: "创建游戏的基本架构，包括主循环和场景管理。",
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
        description: "使用单例模式设计玩家飞机类，并在游戏中显示。",
        contentPath: "backend/src/courses/SDL与太空战机/10 显示玩家飞机与单例模式.md"
      },
      {
        id: "keyboard-controls",
        title: "键盘控制飞机移动",
        description: "实现键盘输入处理，使玩家能够控制飞机移动。",
        contentPath: "backend/src/courses/SDL与太空战机/11 键盘控制飞机移动.md"
      },
      {
        id: "frame-independent-movement",
        title: "让速度不受帧率影响",
        description: "实现帧率独立的运动系统，确保游戏在不同性能的设备上表现一致。",
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
        description: "设计敌机系统，实现随机生成不同类型的敌机。",
        contentPath: "backend/src/courses/SDL与太空战机/14 随机生成敌机.md"
      },
      {
        id: "enemy-bullets",
        title: "敌机发射子弹",
        description: "为敌机添加射击能力，增加游戏挑战性。",
        contentPath: "backend/src/courses/SDL与太空战机/15 敌机发射子弹.md"
      },
      {
        id: "collision-detection",
        title: "碰撞检测与击杀",
        description: "实现游戏中的碰撞检测系统，处理子弹击中和飞机相撞。",
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
        description: "实现物品掉落系统，让玩家可以收集增强道具。",
        contentPath: "backend/src/courses/SDL与太空战机/18 物品掉落与拾取.md"
      },
      {
        id: "audio-effects",
        title: "添加音乐音效",
        description: "为游戏添加背景音乐和音效，提升游戏体验。",
        contentPath: "backend/src/courses/SDL与太空战机/19 添加音乐音效.md"
      },
      {
        id: "scrolling-background",
        title: "星空背景卷轴",
        description: "实现滚动的星空背景，增强游戏视觉效果。",
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
        description: "优化文本输入系统，正确处理中文字符和退格。",
        contentPath: "backend/src/courses/SDL与太空战机/26 正确处理中文退格.md"
      },
      {
        id: "blinking-cursor",
        title: "结束场景-闪烁光标",
        description: "为文本输入添加闪烁光标效果，提升用户体验。",
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
        description: "进行游戏的最终调整和优化，提升整体品质。",
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
        description: "相比SDL2，SDL3的变化与改进",
        contentPath: "backend/src/courses/SDL与太空战机/ex06 SDL3的变化.md"
      }
    ]
  },
  {
    id: "modular-ghost-escape",
    title: "模块化编程与幽灵逃生",
    description: "学习C++游戏开发中的模块化编程思想，使用SDL3、GLM数学库构建一款生存类游戏。掌握组件化设计、向量数学和资源管理等高级概念。",
    coverImage: "https://theorhythm.top/gamedev/GE/screen_ge_2.png",
    status: "已完成",
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
        description: "配置开发环境，包括SDL3和GLM数学库的安装与配置。",
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
        description: "深入探讨游戏框架的设计理念，包括模块化与分层设计、继承关系设计、自动挂载及清理机制。",
        contentPath: "backend/src/courses/模块化编程与幽灵逃生/03-游戏框架设计.md"
      },
      {
        id: "part-04",
        title: "基础框架的实现",
        description: "实现游戏框架的核心组件Game类，包括单例模式的设计、SDL3的初始化、游戏主循环的实现、事件处理系统等。",
        contentPath: "backend/src/courses/模块化编程与幽灵逃生/04-基础框架的实现.md"
      },
      {
        id: "part-05",
        title: "背景网格与视窗移动",
        description: "实现游戏的背景系统和视窗控制，包括网格背景的绘制和视窗的平滑移动。",
        contentPath: "backend/src/courses/模块化编程与幽灵逃生/05-背景网格与视窗移动.md"
      },
      {
        id: "part-06",
        title: "玩家角色与摄像机跟随",
        description: "设计和实现玩家角色系统，包括角色移动控制和摄像机跟随功能。",
        contentPath: "backend/src/courses/模块化编程与幽灵逃生/06-玩家角色与摄像机跟随.md"
      },
      {
        id: "part-07",
        title: "素材存储类",
        description: "设计高效的资源管理系统，实现游戏素材的统一加载和管理。",
        contentPath: "backend/src/courses/模块化编程与幽灵逃生/07-素材存储类.md"
      },
      {
        id: "part-08",
        title: "自动挂载功能",
        description: "实现组件的自动挂载系统，简化游戏对象的创建和管理过程。",
        contentPath: "backend/src/courses/模块化编程与幽灵逃生/08-自动挂载功能.md"
      },
      {
        id: "part-09",
        title: "精灵图类",
        description: "实现精灵图渲染系统，处理游戏中的图像显示。",
        contentPath: "backend/src/courses/模块化编程与幽灵逃生/09-精灵图类.md"
      },
      {
        id: "part-10",
        title: "精灵动画类",
        description: "开发精灵动画系统，为游戏对象添加动画效果。",
        contentPath: "backend/src/courses/模块化编程与幽灵逃生/10-精灵动画类.md"
      },
      {
        id: "part-11",
        title: "根据状态切换动画",
        description: "实现基于状态机的动画系统，使角色能够根据不同状态显示相应的动画。",
        contentPath: "backend/src/courses/模块化编程与幽灵逃生/11-根据状态切换动画.md"
      },
      {
        id: "part-12",
        title: "敌方类幽灵",
        description: "实现游戏的敌方AI系统，包括基础的追踪行为、状态管理和动画控制。",
        contentPath: "backend/src/courses/模块化编程与幽灵逃生/12-敌方类幽灵.md"
      },
      {
        id: "part-13",
        title: "碰撞盒组件",
        description: "设计和实现碰撞检测系统，处理游戏对象之间的物理交互。",
        contentPath: "backend/src/courses/模块化编程与幽灵逃生/13-碰撞盒组件.md"
      },
      {
        id: "part-14",
        title: "设置组件的锚点",
        description: "实现组件锚点系统，优化游戏对象的位置控制。",
        contentPath: "backend/src/courses/模块化编程与幽灵逃生/14-设置组件的锚点.md"
      },
      {
        id: "part-15",
        title: "战斗属性组件",
        description: "设计战斗系统的属性组件，管理生命值、攻击力等游戏数值。",
        contentPath: "backend/src/courses/模块化编程与幽灵逃生/15-战斗属性组件.md"
      },
      {
        id: "part-16",
        title: "特效类及安全添加",
        description: "实现游戏特效系统，并确保特效的安全创建和管理。",
        contentPath: "backend/src/courses/模块化编程与幽灵逃生/16-特效类及安全添加.md"
      },
      {
        id: "part-17",
        title: "敌方幽灵生成器",
        description: "实现敌人生成系统，控制游戏难度和节奏。",
        contentPath: "backend/src/courses/模块化编程与幽灵逃生/17-敌方幽灵生成器.md"
      },
      {
        id: "part-18",
        title: "鼠标显示类",
        description: "实现自定义鼠标光标系统，增强游戏的交互体验。",
        contentPath: "backend/src/courses/模块化编程与幽灵逃生/18-鼠标显示类.md"
      },
      {
        id: "part-19",
        title: "法术类",
        description: "实现游戏中的法术系统，为玩家提供多样的技能选择。",
        contentPath: "backend/src/courses/模块化编程与幽灵逃生/19-法术类.md"
      },
      {
        id: "part-20",
        title: "武器类",
        description: "设计和实现武器系统，管理技能释放。",
        contentPath: "backend/src/courses/模块化编程与幽灵逃生/20-武器类.md"
      },
      {
        id: "part-21",
        title: "敌方生命条标签",
        description: "实现敌人生命值显示系统，提供直观的战斗反馈。",
        contentPath: "backend/src/courses/模块化编程与幽灵逃生/21-敌方生命条标签.md"
      },
      {
        id: "part-22",
        title: "玩家状态HUD",
        description: "实现玩家状态界面，显示生命值、法力等关键信息。",
        contentPath: "backend/src/courses/模块化编程与幽灵逃生/22-玩家状态HUD.md"
      },
      {
        id: "part-23",
        title: "技能冷却HUD",
        description: "实现技能冷却显示系统，为玩家提供技能使用状态的反馈。",
        contentPath: "backend/src/courses/模块化编程与幽灵逃生/23-技能冷却HUD.md"
      },
      {
        id: "part-24",
        title: "文字HUD类",
        description: "设计并实现一个完整的文字HUD系统，包括基础文本标签TextLabel和高级文本控件HUDText。",
        contentPath: "backend/src/courses/模块化编程与幽灵逃生/24-文字HUD类.md"
      },
      {
        id: "part-25",
        title: "封装音频功能",
        description: "实现游戏的音频系统，管理音效和背景音乐。",
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
        description: "实现安全的场景切换机制，确保资源的正确释放和加载。",
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
        description: "实现游戏存档系统，支持游戏进度的保存和读取。",
        contentPath: "backend/src/courses/模块化编程与幽灵逃生/32-储存与读取二进制存档.md"
      },
      {
        id: "part-33",
        title: "视差滚动星空背景",
        description: "实现多层视差滚动背景效果，创造深度感。",
        contentPath: "backend/src/courses/模块化编程与幽灵逃生/33-视差滚动星空背景.md"
      },
      {
        id: "part-34",
        title: "窗口缩放与游戏变速",
        description: "实现窗口大小调整和游戏速度控制功能，提供灵活的游戏体验。",
        contentPath: "backend/src/courses/模块化编程与幽灵逃生/34-窗口缩放与游戏变速.md"
      },
      {
        id: "part-35",
        title: "最后的完善",
        description: "对游戏进行最终优化和完善，包括统一命名规范、改进碰撞检测系统、增强对象创建的安全性、优化边界检测等。通过细致的代码审查和改进，提升游戏的稳定性和可维护性。",
        contentPath: "backend/src/courses/模块化编程与幽灵逃生/35-最后的完善.md"
      },
      {
        id: "part-36",
        title: "结束",
        description: "总结整个课程的学习内容，回顾关键概念和技术要点。展望游戏开发的未来方向，为进一步学习提供指导。",
        contentPath: "backend/src/courses/模块化编程与幽灵逃生/36-结束.md"
      },
      {
        id: "ex1",
        title: "修正内存泄露问题",
        description: "解决游戏中的内存泄露问题。",
        contentPath: "backend/src/courses/模块化编程与幽灵逃生/ex1-修正内存泄露问题.md"
      }
    ]
  }
];

module.exports = { courses }; 