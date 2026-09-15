import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import SearchModal from './SearchModal';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({ useNavigate: () => mockNavigate }), { virtual: true });

// 记下每次请求，由测试决定什么时候返回、按什么顺序返回
interface PendingRequest {
  url: string;
  respond: (titles: string[]) => void;
}

const results = (titles: string[]) =>
  titles.map(title => ({ type: 'chapter', id: title, title, snippet: '', url: `/courses/demo/parts/${title}` }));

describe('SearchModal', () => {
  let requests: PendingRequest[];

  beforeEach(() => {
    requests = [];
    mockNavigate.mockReset();
    window.fetch = jest.fn((url: string, init?: RequestInit) =>
      new Promise((resolve, reject) => {
        init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
        requests.push({
          url,
          respond: titles => resolve({ ok: true, json: () => Promise.resolve(results(titles)) }),
        });
      })
    ) as unknown as typeof fetch;
  });

  // 输入后等过 300ms 的防抖，让请求发出去
  const type = async (text: string) => {
    fireEvent.change(screen.getByPlaceholderText('搜索课程或章节...'), { target: { value: text } });
    await act(() => new Promise(resolve => setTimeout(resolve, 350)));
  };

  it('输入法组字时按回车不跳转', async () => {
    render(<SearchModal onClose={() => {}} />);
    await type('状态机');
    await act(async () => requests[0].respond(['状态机']));
    await screen.findByText('状态机');

    fireEvent.keyDown(window, { key: 'Enter', isComposing: true });
    // Safari 确认上屏时 isComposing 已经是 false，只有 keyCode 是 229
    fireEvent.keyDown(window, { key: 'Enter', keyCode: 229 });
    expect(mockNavigate).not.toHaveBeenCalled();

    fireEvent.keyDown(window, { key: 'Enter' });
    expect(mockNavigate).toHaveBeenCalledWith('/courses/demo/parts/状态机');
  });

  it('输入变化后，慢的旧响应不会覆盖新结果', async () => {
    render(<SearchModal onClose={() => {}} />);
    await type('组件');
    await type('组件 状态机');
    expect(requests.map(request => request.url)).toEqual([
      `/api/search?q=${encodeURIComponent('组件')}`,
      `/api/search?q=${encodeURIComponent('组件 状态机')}`,
    ]);

    // 新请求先返回，旧请求后返回
    await act(async () => requests[1].respond(['新结果']));
    await act(async () => requests[0].respond(['旧结果']));

    expect(screen.getByText('新结果')).toBeInTheDocument();
    expect(screen.queryByText('旧结果')).not.toBeInTheDocument();
  });
});
