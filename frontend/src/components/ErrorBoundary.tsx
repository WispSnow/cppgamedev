import React from 'react';
import styled from 'styled-components';
import ErrorState from './ErrorState';

const RELOAD_KEY = 'cppgamedev_chunk_reload_at';
const RELOAD_COOLDOWN_MS = 10000;

const Wrapper = styled.div`
  max-width: 720px;
  margin: 3rem auto;
  padding: 0 1rem;
  text-align: center;
  color: var(--secondary-text-color, #666);
`;

// 发版时旧 chunk 会被删除，还开着旧页面的读者再按需加载页面就会失败。
function isChunkLoadError(error: Error): boolean {
  return (
    error.name === 'ChunkLoadError' ||
    /Loading (CSS )?chunk [\w-]+ failed/i.test(error.message) ||
    /Failed to fetch dynamically imported module|Importing a module script failed/i.test(error.message)
  );
}

// 自动刷新一次拿到新版本；短时间内再次失败就不再刷新，避免死循环。
function reloadOnce(): boolean {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) || 0);
    if (Date.now() - last < RELOAD_COOLDOWN_MS) return false;
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch {
    // sessionStorage 不可用时无法防止循环刷新，交给读者手动刷新
    return false;
  }
  window.location.reload();
  return true;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
  reloading: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null, reloading: false };

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('页面渲染出错:', error, info.componentStack);
    if (isChunkLoadError(error) && reloadOnce()) {
      this.setState({ reloading: true });
    }
  }

  render() {
    const { error, reloading } = this.state;
    if (!error) return this.props.children;
    if (reloading) return <Wrapper>网站刚刚更新，正在刷新页面…</Wrapper>;

    const chunkError = isChunkLoadError(error);
    return (
      <Wrapper>
        <ErrorState
          title={chunkError ? '页面资源加载失败' : '页面出错了'}
          message={chunkError ? '网站可能刚刚更新，或者网络不太稳定，刷新页面即可。' : '页面渲染时出现了问题，可以尝试刷新页面。'}
          onRetry={() => window.location.reload()}
        />
      </Wrapper>
    );
  }
}

export default ErrorBoundary;
