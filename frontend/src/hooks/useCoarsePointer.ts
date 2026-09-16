import { useEffect, useState } from 'react';

const COARSE_POINTER = '(pointer: coarse)';

const matches = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia(COARSE_POINTER).matches;

/**
 * 主要靠触摸操作的设备返回 true。
 * 判断指针类型而不是屏幕宽度：窗口拉窄的台式机仍然有键盘，平板接了键鼠也照样能玩。
 */
export function useCoarsePointer(): boolean {
  const [isCoarse, setIsCoarse] = useState(matches);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const media = window.matchMedia(COARSE_POINTER);
    const handleChange = (event: MediaQueryListEvent) => setIsCoarse(event.matches);
    setIsCoarse(media.matches);
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  return isCoarse;
}

export default useCoarsePointer;
