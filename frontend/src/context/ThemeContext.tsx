import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

const STORAGE_KEY = 'theme';
// 浏览器地址栏等界面的颜色，和导航栏背景（--card-bg-color）一致；public/index.html 的内联脚本里用的是同样的值
const THEME_COLORS: Record<Theme, string> = { light: '#ffffff', dark: '#1e1e1e' };

// 用户手动切换过的主题；没切换过或读不到 localStorage 时为 null
const getStoredTheme = (): Theme | null => {
  // 浏览器禁用站点数据时访问 localStorage 会抛异常，不能因此让整个应用崩掉
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'dark' || value === 'light' ? value : null;
  } catch {
    return null;
  }
};

const getSystemDarkQuery = () =>
  typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-color-scheme: dark)') : null;

interface ThemeProviderProps {
  children: React.ReactNode;
}

// 颜色变量定义在 index.css，按 <html data-theme> 切换。
// 首屏的 data-theme 由 public/index.html 的内联脚本在绘制前设置（切换过就用切换的，否则跟随系统），这里接着用
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const current = document.documentElement.getAttribute('data-theme');
    if (current === 'dark' || current === 'light') return current;
    return getStoredTheme() ?? (getSystemDarkQuery()?.matches ? 'dark' : 'light');
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[theme]);
  }, [theme]);

  // 没手动切换过时，系统切换深浅色，网站跟着变
  useEffect(() => {
    const query = getSystemDarkQuery();
    // Safari 14 以前的 MediaQueryList 没有 addEventListener
    if (!query || typeof query.addEventListener !== 'function') return;
    const handleChange = (event: MediaQueryListEvent) => {
      if (getStoredTheme() === null) {
        setTheme(event.matches ? 'dark' : 'light');
      }
    };
    query.addEventListener('change', handleChange);
    return () => query.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      try {
        localStorage.setItem(STORAGE_KEY, newTheme);
      } catch {
        // 存不下时只在本次访问内生效
      }
      return newTheme;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
