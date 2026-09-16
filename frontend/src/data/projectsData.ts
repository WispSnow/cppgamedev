// 个人作品：课程之外做的小游戏和实验，技术栈不限于 C++。
// 新增作品时在这里加一条，列表页和详情页会自动带上；
// sitemap 由 scripts/generate-sitemap.js 从本文件解析 id，不用另外登记。

export type ProjectKind = 'remake' | 'original' | 'experiment';
export type ProjectStatus = 'playable' | 'coming-soon' | 'archived';
export type ProjectPlatform = 'desktop' | 'mobile';

export interface ProjectImage {
  src: string;
  alt: string;
  caption?: string;
  /** 像素素材：放大时保持硬边缘，不做平滑 */
  pixelated?: boolean;
}

export interface ProjectLinks {
  /** 在线试玩地址 */
  play?: string;
  /** 源码仓库 */
  source?: string;
  /** 开发手记 */
  devlog?: string;
  /** 演示视频，手机上会代替试玩按钮 */
  video?: string;
}

export interface Project {
  id: string;
  title: string;
  /** 卡片上的一句话介绍 */
  tagline: string;
  kind: ProjectKind;
  status: ProjectStatus;
  techStack: string[];
  /** 支持的设备。不含 mobile 时，手机访客会看到「需要电脑」的提示 */
  platforms: ProjectPlatform[];
  cover: ProjectImage;
  /** 详情页的截图 */
  shots?: ProjectImage[];
  links: ProjectLinks;
  highlights: string[];
  /** 详情页正文，一段一条 */
  body: string[];
  /** 版权声明、AI 参与说明等需要写明的内容 */
  notice?: string;
  /** 以后收录他人作品时填写，留空表示站长本人 */
  author?: string;
  updatedAt: string;
}

export const projectKindLabels: Record<ProjectKind, string> = {
  remake: '复刻',
  original: '原创',
  experiment: '实验',
};

export const projectStatusLabels: Record<ProjectStatus, string> = {
  playable: '可试玩',
  'coming-soon': '即将上线',
  archived: '已归档',
};

export const projects: Project[] = [
  {
    id: 'angel2-web-remake',
    title: '天使帝国 II · Web 复刻',
    tagline: '从原版可执行文件逐项取证，把 1994 年的 DOS 战棋搬进浏览器，38 关全流程可玩。',
    kind: 'remake',
    status: 'playable',
    techStack: ['Phaser 4', 'TypeScript', 'Vite', 'Tauri'],
    platforms: ['desktop'],
    cover: {
      src: '/images/projects/angel2-cover.webp',
      alt: '《天使帝国 II》Web 复刻版的标题画面',
      pixelated: true,
    },
    shots: [
      {
        src: '/images/projects/angel2-battle.webp',
        alt: '战场画面：像素地图上排布着双方单位，右侧是命令选单',
        caption: '战场与命令选单，右栏由原版点阵字绘制',
        pixelated: true,
      },
      {
        src: '/images/projects/angel2-dialogue.webp',
        alt: '剧情对白画面：角色肖像与对白框',
        caption: '剧情对白与肖像动画',
        pixelated: true,
      },
    ],
    links: {
      play: 'https://angel2-web-remake.pages.dev/',
      source: 'https://github.com/WispSnow/angel2-web-remake',
    },
    highlights: [
      '每条规则、每个数值都能追溯到原版可执行文件的具体偏移',
      '模拟与表现分层，战斗结算不依赖渲染层',
      '影响战果的随机数来自可序列化的 PRNG，同一局操作可以复现',
      '38 关战役、过场、主线结局与制作人员表全流程可玩',
    ],
    body: [
      '《天使帝国 II》是大宇资讯 1994 年的 DOS 战棋游戏。这个复刻版不是凭记忆重做：规则、数值、剧情节奏、像素素材与 UI 构图都从原版可执行文件和资源文件里取证还原，仓库中同时保留反汇编笔记、机器可读的证据登记表和设计契约，任何一条玩法行为都能追回到原版的具体位置。',
      '代码分成两层。模拟层负责网格、合法行动、伤害、经验、AI、胜负与随机数，不依赖 Phaser 和 DOM；场景层只把模拟状态投影成精灵，再把语义化的输入送回来。动画加速、减少动态、关闭声音这些选项只改变表现，不影响结算顺序和存档语义。',
      '玩家可见的第 0–37 关、第 5 关后的过场、主线结局和制作人员表都已接入，另有 39 个单位职业与原版技术集。游戏没有后端，存档写在浏览器本地。想离线游玩的话，仓库说明里提供了 Windows 安装包，它没有代码签名，安装前建议先核对 SHA-256。',
    ],
    notice:
      '《天使帝国 II》的美术、音乐、音效与文本版权归大宇资讯（Softstar Entertainment Inc.）及其权利继承者所有。本项目是非商业的复刻研究，不分发原版素材，与大宇资讯没有隶属或授权关系。',
    updatedAt: '2026-09-15',
  },
  {
    id: 'little-yard',
    title: '小小庭院 · Little Yard',
    tagline: 'AI 协作开发的 3D 回收小游戏：四关入门、无尽远征、装备与排行榜，全程留有开发手记。',
    kind: 'experiment',
    status: 'coming-soon',
    techStack: ['Three.js', 'TypeScript', 'Vite', 'Blender', 'AI 协作'],
    platforms: ['desktop'],
    cover: {
      src: '/images/projects/little-yard-cover.webp',
      alt: '小小庭院的实机画面：机器人在等距视角的庭院里收集零件',
    },
    shots: [
      {
        src: '/images/projects/little-yard-levels.webp',
        alt: '关卡选择界面：四个关卡的最佳成绩与两枚可选挑战徽章',
        caption: '关卡选择与可分次收集的挑战徽章',
      },
      {
        src: '/images/projects/little-yard-complete.webp',
        alt: '通关结算画面：整座庭院都收拾好了',
        caption: '四关通关后的结算画面',
      },
    ],
    links: {},
    highlights: [
      '四关入门，之后解锁按种子生成的无尽远征',
      '每三关一次装备三选一，背包最多五格',
      '九件 Blender 资产，拾取、交付、充电都有动画反馈',
      '排行榜由服务端重放真实操作校验，而不是直接上传分数',
    ],
    body: [
      '小小庭院是一次「用 AI 协作做完一款小游戏」的尝试：玩法代码、Blender 建模与贴图、自动试玩截图、每一轮的开发手记归档，都在同一套流程里推进。',
      '四关入门教会移动、拾取、交付和充电，通关后解锁无尽远征：地图按种子生成，可以暂存进度、连续挑战更高关数；每三关一次装备三选一，背包最多扩到五格，形成不同的回收路线。',
      '排行榜不直接上传分数，而是由服务端按原始规则重放整局操作来校验，只记录每位玩家历史最高的通关关数。这部分需要一个独立的服务，会在游戏上线之后单独接入。',
      '目前正在准备上线，地址定下来之后，这里会补上试玩入口和开发手记。',
    ],
    notice: '开发过程由 AI 协作完成，包括玩法代码、美术资产与试玩验收，细节记录在项目的开发手记里。',
    updatedAt: '2026-09-15',
  },
];

export const getProjectById = (id?: string): Project | undefined =>
  projects.find(project => project.id === id);
