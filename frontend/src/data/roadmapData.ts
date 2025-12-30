export interface RoadmapItem {
  id: number;
  title: string;
  techStack: string;
  gameType: string;
  status: 'completed' | 'in-progress' | 'planned';
  description: string;
  courseId?: string; // If the course exists, link to it
}

export const roadmapData: RoadmapItem[] = [
  {
    id: 1,
    title: "游戏开发入门概念",
    techStack: "SDL",
    gameType: "弹幕射击",
    status: "completed",
    description: "通过SDL2图形库学习C++游戏开发基础，从零开始构建一款经典的太空射击游戏。掌握游戏循环、输入处理、图像渲染和音频播放等核心概念。",
    courseId: "sdl-space-shooter"
  },
  {
    id: 2,
    title: "模块化编程",
    techStack: "glm, SDL3",
    gameType: "生存游戏",
    status: "completed",
    description: "学习组件化设计、向量数学、模块化架构与资源管理。构建幽灵逃生游戏的核心系统。",
    courseId: "modular-ghost-escape"
  },
  {
    id: 3,
    title: "瓦片地图与分层架构",
    techStack: "Tiled, nlohmann-json, SDL3",
    gameType: "平台跳跃",
    status: "completed",
    description: "学习现代游戏引擎架构设计，包括资源管理、2D物理引擎实现、Tiled地图解析、玩家状态机与动画系统。",
    courseId: "layer-sunny-land"
  },
  {
    id: 4,
    title: "ECS与怪物战争",
    techStack: "entt, imgui",
    gameType: "塔防游戏",
    status: "planned",
    description: "深入学习ECS架构（实体、组件、系统）与事件驱动设计，设计一款高性能的塔防游戏。"
  },
  {
    id: 5,
    title: "OpenGL",
    techStack: "Lua, opengl",
    gameType: "农场游戏",
    status: "planned",
    description: "掌握将Lua脚本语言集成到C++游戏中的技术，实现数据驱动设计与逻辑分离。"
  },
  {
    id: 6,
    title: "物理系统",
    techStack: "Box2D",
    gameType: "日式RPG",
    status: "planned",
    description: "专注于物理模拟、刚体动力学、约束与关节，使用Box2D开发具有真实物理交互的游戏。"
  },
  {
    id: 7,
    title: "高级主题 (RPG)",
    techStack: "待定",
    gameType: "策略RPG",
    status: "planned",
    description: "探索更复杂的RPG游戏系统开发，包括剧情系统、回合制战斗等。"
  },
  {
    id: 8,
    title: "高级主题 (策略)",
    techStack: "待定",
    gameType: "策略RPG",
    status: "planned",
    description: "挑战策略RPG开发，涉及复杂的AI、网格寻路与战棋系统。"
  }
];
