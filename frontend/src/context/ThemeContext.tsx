import React, { createContext, useState, useEffect, useContext } from 'react';

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

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // 从本地存储获取主题设置，默认为light
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme as Theme) || 'light';
  });

  // 切换主题
  const toggleTheme = () => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      return newTheme;
    });
  };

  // 当主题变化时应用CSS变量
  useEffect(() => {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      // 深色主题变量
      root.style.setProperty('--background-color', '#121212');
      root.style.setProperty('--text-color', '#e0e0e0');
      root.style.setProperty('--secondary-text-color', '#aaaaaa');
      root.style.setProperty('--primary-color', '#4d9fff');
      root.style.setProperty('--border-color', '#333333');
      
      // 目录相关
      root.style.setProperty('--toc-bg-color', '#1e1e1e');
      root.style.setProperty('--toc-active-bg', 'rgba(77, 159, 255, 0.15)');
      root.style.setProperty('--toc-hover-bg', 'rgba(255, 255, 255, 0.05)');
      
      // 进度条相关
      root.style.setProperty('--progress-bg-color', '#1e1e1e');
      root.style.setProperty('--progress-bar-bg', '#333333');
      
      // 卡片和代码相关
      root.style.setProperty('--card-bg-color', '#1e1e1e');
      root.style.setProperty('--code-bg-color', 'transparent');
      root.style.setProperty('--code-block-bg', '#161b22');
      root.style.setProperty('--inline-code-bg', '#2d333b');
    } else {
      // 浅色主题变量
      root.style.setProperty('--background-color', '#ffffff');
      root.style.setProperty('--text-color', '#333333');
      root.style.setProperty('--secondary-text-color', '#666666');
      root.style.setProperty('--primary-color', '#0066cc');
      root.style.setProperty('--border-color', '#eaeaea');
      
      // 目录相关
      root.style.setProperty('--toc-bg-color', '#f8f9fa');
      root.style.setProperty('--toc-active-bg', 'rgba(0, 102, 204, 0.1)');
      root.style.setProperty('--toc-hover-bg', 'rgba(0, 0, 0, 0.05)');
      
      // 进度条相关
      root.style.setProperty('--progress-bg-color', '#f5f7fa');
      root.style.setProperty('--progress-bar-bg', '#e0e0e0');
      
      // 卡片和代码相关
      root.style.setProperty('--card-bg-color', '#ffffff');
      root.style.setProperty('--code-bg-color', 'transparent');
      root.style.setProperty('--code-block-bg', '#f6f8fa');
      root.style.setProperty('--inline-code-bg', '#f3f4f5');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext; 