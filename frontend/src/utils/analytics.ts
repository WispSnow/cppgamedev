// 页面浏览统计（GA4 + 百度统计）。
// public/index.html 只在生产构建里加载两边的脚本，并关掉了它们的自动 PV；
// 由 SEOHelmet 在页面标题确定后调用这里上报：首屏不会重复计数，SPA 跳转时标题也不会记成上一页的。

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    _hmt?: unknown[][];
  }
}

// 上一次上报的导航（react-router 的 location.key）。
// 同一次导航只报一次：开发模式的 StrictMode 会让 effect 执行两次，页面重新挂载 SEOHelmet 也会再次触发。
let lastTrackedKey: string | null = null;

export function trackPageView(locationKey: string, path: string, title: string) {
  if (locationKey === lastTrackedKey) return;
  lastTrackedKey = locationKey;

  if (process.env.NODE_ENV === 'development') {
    console.debug('[analytics] page_view', path, title);
  }

  window.gtag?.('event', 'page_view', {
    page_title: title,
    page_location: window.location.href,
  });
  window._hmt?.push(['_trackPageview', path]);
}

// 站外跳转：作品的试玩、源码、演示视频都在别的站点上，不记一笔就看不出哪个作品有人点
export function trackOutboundClick(label: string, url: string) {
  if (process.env.NODE_ENV === 'development') {
    console.debug('[analytics] outbound_click', label, url);
  }

  window.gtag?.('event', 'outbound_click', {
    event_category: '作品',
    event_label: label,
    link_url: url,
  });
  window._hmt?.push(['_trackEvent', '作品', label, url]);
}
