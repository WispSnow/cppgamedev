import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// index.html 里的默认 description / keywords 是留给不执行 JS 的抓取方的。每个页面都会用 SEOHelmet 渲染自己的一份，
// React 不会替换 head 里已有的同名标签，所以启动时先移除默认的，保证只有一份
document.querySelectorAll('meta[data-default-seo]').forEach(meta => meta.remove());

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
