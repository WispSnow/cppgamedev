import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * 滚动位置：点链接进入新页面时回到顶部；浏览器后退 / 前进 / 刷新时回到离开时看到的内容。
 *
 * 页面组件按需加载、数据在组件里请求，浏览器自带的恢复发生在内容出来之前，恢复不了，所以改成自己管。
 * 只记 scrollY 也不准：正文图片是懒加载的，回来时上方的图片还没加载、高度是 0，同样的 scrollY 会落到更靠后的内容上。
 * 所以同时记下视口顶部是哪个元素、离视口顶部多远，回来后等这个元素渲染出来再对齐，不用等图片。
 */

const STORAGE_KEY = 'scroll-positions';
const MAX_SAVED = 50;
// 一直等不到原来的内容（比如内容改过了）就放弃，不在很久之后突然跳动
const RESTORE_TIMEOUT_MS = 10000;
// 对齐后再盯一会儿：附近的图片加载完把内容往下推时重新对齐（不支持滚动锚定的浏览器会跳）
const HOLD_MS = 1500;
// 用户自己开始操作页面后不再自动滚动
const USER_INPUT_EVENTS = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const;
// 找锚点时停在这些元素上，不再往里找
const ANCHOR_BLOCKS = new Set(['P', 'LI', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'PRE', 'TABLE', 'IMG', 'BLOCKQUOTE', 'A', 'BUTTON', 'IFRAME', 'svg']);

interface Anchor {
  /** 从 <main> 往下每一层的子元素下标 */
  path: number[];
  /** 元素顶部到视口顶部的距离 */
  offset: number;
  /** 标签名和开头的文字，确认找到的是同一个元素，而不是加载中的骨架屏 */
  signature: string;
}

interface SavedPosition {
  y: number;
  anchor?: Anchor;
}

const isSavedPosition = (value: unknown): value is SavedPosition => {
  const { y, anchor } = (value ?? {}) as Partial<SavedPosition>;
  if (typeof y !== 'number') return false;
  if (anchor === undefined) return true;
  return (
    Array.isArray(anchor.path) &&
    anchor.path.every(index => typeof index === 'number') &&
    typeof anchor.offset === 'number' &&
    typeof anchor.signature === 'string'
  );
};

const loadPositions = (): Map<string, SavedPosition> => {
  try {
    const saved: unknown = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '[]');
    if (!Array.isArray(saved)) return new Map();
    return new Map(
      saved.filter(
        (entry): entry is [string, SavedPosition] =>
          Array.isArray(entry) && typeof entry[0] === 'string' && isSavedPosition(entry[1])
      )
    );
  } catch {
    return new Map();
  }
};

// 历史记录 → 离开时的位置。存进 sessionStorage，刷新页面后也能回到原来的位置
const positions = loadPositions();

const savePositions = () => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(positions).slice(-MAX_SAVED)));
  } catch {
    // 存不下时只在本次访问内生效
  }
};

const signatureOf = (element: Element) =>
  `${element.tagName}:${(element.textContent || element.getAttribute('src') || '').trim().slice(0, 40)}`;

// 元素在文档里的纵向位置，不受 transform 影响（页面切换时 <main> 有 6px 的淡入位移，卡片悬停时会上移）
const documentTop = (element: Element): number => {
  let node: Element | null = element;
  // SVG 元素没有 offsetTop，用最近的 HTML 祖先
  while (node && !(node instanceof HTMLElement)) node = node.parentElement;
  let top = 0;
  for (let current = node as HTMLElement | null; current; current = current.offsetParent as HTMLElement | null) {
    top += current.offsetTop;
  }
  return top;
};

// 这次整页加载是刷新或浏览器前进后退，而不是新打开的页面
const isReloadOrHistoryNavigation = () => {
  if (typeof performance.getEntriesByType !== 'function') return false;
  const [entry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
  return entry?.type === 'reload' || entry?.type === 'back_forward';
};

// 视口顶部（吸顶导航栏的下沿）那条线上的内容元素
const findAnchor = (): Anchor | undefined => {
  const main = document.querySelector('main');
  if (!main) return undefined;
  const lineY = Math.max(0, document.querySelector('header')?.getBoundingClientRect().bottom ?? 0) + 1;
  const path: number[] = [];
  let current: Element = main;
  while (path.length < 16) {
    const children = Array.from(current.children);
    // 第一个延伸到这条线以下的子元素：跨过这条线的，或者线下面紧挨着的那个。跳过浮在页面上的目录、按钮
    const index = children.findIndex(child => {
      const rect = child.getBoundingClientRect();
      if (rect.bottom <= lineY || (rect.width === 0 && rect.height === 0)) return false;
      const { position } = getComputedStyle(child);
      return position !== 'fixed' && position !== 'sticky';
    });
    if (index === -1) break;
    current = children[index];
    path.push(index);
    if (ANCHOR_BLOCKS.has(current.tagName) || current.getBoundingClientRect().top >= lineY) break;
  }
  if (current === main) return undefined;
  return { path, offset: documentTop(current) - window.scrollY, signature: signatureOf(current) };
};

const resolveAnchor = (anchor: Anchor): Element | null => {
  let current: Element | null = document.querySelector('main');
  for (const index of anchor.path) {
    current = current?.children[index] ?? null;
  }
  return current && signatureOf(current) === anchor.signature ? current : null;
};

// 等内容渲染出来后滚回保存的位置，返回停止函数
const restorePosition = (saved: SavedPosition, restoring: { current: boolean }) => {
  restoring.current = true;
  let observer: ResizeObserver | undefined;
  let holdTimer = 0;

  // 锚点元素已经渲染出来就按它对齐；没有锚点时按像素，页面够高了再滚
  const targetY = (): number | undefined => {
    if (saved.anchor) {
      const element = resolveAnchor(saved.anchor);
      return element ? documentTop(element) - saved.anchor.offset : undefined;
    }
    return document.documentElement.scrollHeight - window.innerHeight >= saved.y ? saved.y : undefined;
  };

  const align = () => {
    const y = targetY();
    if (y === undefined) return;
    if (Math.abs(window.scrollY - y) > 1) window.scrollTo(0, y);
    // 页面下方的内容还没出来时可能滚不到位，等页面再变高时继续
    if (!holdTimer && Math.abs(window.scrollY - y) <= 1) {
      holdTimer = window.setTimeout(stop, HOLD_MS);
    }
  };

  const stop = () => {
    restoring.current = false;
    observer?.disconnect();
    window.clearTimeout(timeoutTimer);
    window.clearTimeout(holdTimer);
    USER_INPUT_EVENTS.forEach(type => window.removeEventListener(type, stop));
    document.removeEventListener('load', align, true);
  };

  const timeoutTimer = window.setTimeout(stop, RESTORE_TIMEOUT_MS);
  USER_INPUT_EVENTS.forEach(type => window.addEventListener(type, stop, { passive: true }));
  // 图片的 load 事件不冒泡，在捕获阶段监听
  document.addEventListener('load', align, true);
  if (typeof ResizeObserver !== 'undefined') {
    observer = new ResizeObserver(align);
    observer.observe(document.body);
  }
  align();
  return stop;
};

export default function ScrollManager() {
  const location = useLocation();
  const navigationType = useNavigationType();
  // 直接打开的页面 key 都是 "default"，带上路径才能区分
  const entryId = `${location.key} ${location.pathname}${location.search}`;
  const currentEntryId = useRef(entryId);
  // 整页加载后的第一条记录，用来区分「刚打开页面」和「之后又回到了这条记录」
  const initialEntryId = useRef(entryId);
  const hasNavigated = useRef(false);
  // 正在恢复位置时不记录中间状态（骨架屏、页面还没长高时的位置）
  const restoring = useRef(false);

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const record = () => {
      if (restoring.current) return;
      const id = currentEntryId.current;
      // 删了再加：Map 里最近的记录排在后面，保存时只留最近的 MAX_SAVED 条
      positions.delete(id);
      positions.set(id, { y: window.scrollY, anchor: findAnchor() });
    };

    let frame = 0;
    const handleScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        record();
      });
    };
    const handlePageHide = () => {
      record();
      savePositions();
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') handlePageHide();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // 离开页面前（点链接、按键、浏览器后退）再记一次，锚点是最新的。捕获阶段，赶在路由处理之前
    window.addEventListener('pointerdown', record, { capture: true, passive: true });
    window.addEventListener('keydown', record, true);
    window.addEventListener('popstate', record, true);
    window.addEventListener('pagehide', handlePageHide);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('pointerdown', record, true);
      window.removeEventListener('keydown', record, true);
      window.removeEventListener('popstate', record, true);
      window.removeEventListener('pagehide', handlePageHide);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // 在新页面绘制前处理。之后因为页面变短触发的 scroll 事件会记到新页面名下，不会覆盖旧页面的位置
  useLayoutEffect(() => {
    currentEntryId.current = entryId;
    if (entryId !== initialEntryId.current) hasNavigated.current = true;
    savePositions();

    // 刚打开页面时，只有刷新和浏览器前进后退才恢复；新打开的（输入地址、从别处点进来）从顶部开始
    const restorable = navigationType === 'POP' && (hasNavigated.current || isReloadOrHistoryNavigation());
    const saved = restorable ? positions.get(entryId) : undefined;
    if (!saved || saved.y <= 0) {
      // 带锚点的地址交给浏览器和页面处理
      if (!location.hash && window.scrollY !== 0) window.scrollTo(0, 0);
      return;
    }
    return restorePosition(saved, restoring);
  }, [entryId, navigationType, location.hash]);

  return null;
}
