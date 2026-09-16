import React from 'react';
import { act, createEvent, fireEvent, render, screen } from '@testing-library/react';
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

    const enter = createEvent.keyDown(window, { key: 'Enter' });
    fireEvent(window, enter);
    expect(enter.defaultPrevented).toBe(true);
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

  it('是对话框：打开时聚焦输入框，Tab 不会让焦点离开，关闭后焦点回到打开前的按钮', () => {
    const trigger = document.createElement('button');
    document.body.appendChild(trigger);
    trigger.focus();

    const { unmount } = render(<SearchModal onClose={() => {}} />);
    expect(screen.getByRole('dialog', { name: '搜索' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: '搜索课程或章节' })).toHaveFocus();

    const tab = createEvent.keyDown(window, { key: 'Tab' });
    fireEvent(window, tab);
    expect(tab.defaultPrevented).toBe(true);
    expect(screen.getByRole('button', { name: '关闭搜索' })).toHaveFocus();
    fireEvent.keyDown(window, { key: 'Tab' });
    expect(screen.getByRole('combobox')).toHaveFocus();
    expect(document.body.style.overflow).toBe('hidden');

    unmount();
    expect(document.body.style.overflow).not.toBe('hidden');
    expect(trigger).toHaveFocus();
    trigger.remove();
  });

  it('关闭按钮获得焦点时，Enter 不会打开当前搜索结果', async () => {
    const onClose = jest.fn();
    render(<SearchModal onClose={onClose} />);
    await type('组件');
    await act(async () => requests[0].respond(['组件']));
    fireEvent.keyDown(window, { key: 'Tab' });
    fireEvent.keyDown(screen.getByRole('button', { name: '关闭搜索' }), { key: 'Enter' });
    expect(mockNavigate).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: '关闭搜索' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('输入新查询后，不会在防抖期间打开旧查询的结果', async () => {
    render(<SearchModal onClose={() => {}} />);
    await type('组件');
    await act(async () => requests[0].respond(['旧结果']));
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '状态机' } });
    expect(screen.queryByRole('option')).not.toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'Enter' });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('方向键移动选中项时，输入框的 aria-activedescendant 跟着变', async () => {
    render(<SearchModal onClose={() => {}} />);
    await type('组件');
    await act(async () => requests[0].respond(['甲', '乙']));

    const input = screen.getByRole('combobox');
    const options = await screen.findAllByRole('option');
    expect(input).toHaveAttribute('aria-activedescendant', options[0].id);

    fireEvent.keyDown(window, { key: 'ArrowDown' });
    expect(input).toHaveAttribute('aria-activedescendant', options[1].id);
    expect(options[1]).toHaveAttribute('aria-selected', 'true');
  });
});
