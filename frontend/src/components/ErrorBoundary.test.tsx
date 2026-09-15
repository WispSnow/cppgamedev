import React from 'react';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';

const Boom = ({ error }: { error: Error }): never => {
  throw error;
};

const chunkLoadError = () =>
  Object.assign(new Error('Loading chunk 123 failed.'), { name: 'ChunkLoadError' });

describe('ErrorBoundary', () => {
  const originalLocation = window.location;
  let reload: jest.Mock;

  beforeEach(() => {
    reload = jest.fn();
    delete (window as any).location;
    (window as any).location = { ...originalLocation, reload };
    sessionStorage.clear();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    (window as any).location = originalLocation;
    jest.restoreAllMocks();
  });

  it('发版后 chunk 加载失败时自动刷新一次', () => {
    render(
      <ErrorBoundary>
        <Boom error={chunkLoadError()} />
      </ErrorBoundary>
    );

    expect(reload).toHaveBeenCalledTimes(1);
    expect(screen.getByText('网站刚刚更新，正在刷新页面…')).toBeInTheDocument();
  });

  it('刚刷新过又失败时不再刷新，改为显示错误提示', () => {
    sessionStorage.setItem('cppgamedev_chunk_reload_at', String(Date.now()));

    render(
      <ErrorBoundary>
        <Boom error={chunkLoadError()} />
      </ErrorBoundary>
    );

    expect(reload).not.toHaveBeenCalled();
    expect(screen.getByText('页面资源加载失败')).toBeInTheDocument();
  });

  it('普通渲染错误只显示错误提示，不自动刷新', () => {
    render(
      <ErrorBoundary>
        <Boom error={new Error('boom')} />
      </ErrorBoundary>
    );

    expect(reload).not.toHaveBeenCalled();
    expect(screen.getByText('页面出错了')).toBeInTheDocument();
  });
});
