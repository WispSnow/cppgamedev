import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 5rem 1rem 1rem;
  @media (max-width: 600px) { padding: 1rem; }
  backdrop-filter: blur(2px);
`;

const ModalContainer = styled.div`
  width: 100%;
  max-width: 680px;
  min-width: 0;
  border: 1px solid var(--border-color);
  background-color: var(--card-bg-color, #fff);
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  max-height: calc(100dvh - 6rem);
  @media (max-width: 600px) { max-height: calc(100dvh - 2rem); }
`;

const SearchHeader = styled.div`
  padding: 1rem;
  border-bottom: 1px solid var(--border-color, #eee);
  display: flex;
  align-items: center;
`;

const SearchIcon = styled.span`
  display: flex;
  flex-shrink: 0;
  margin-right: 0.8rem;
  color: var(--secondary-text-color, #888);
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 0;
  width: 100%;
  border: none;
  font-size: 1rem;
  background: transparent;
  color: var(--text-color, #333);
  outline: none;

  &:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 5px;
    border-radius: 2px;
  }

  &::placeholder {
    color: var(--secondary-text-color, #aaa);
  }
`;

const ResultsList = styled.div`
  overflow-y: auto;
  padding: 0.5rem 0;
  min-height: 0;
  overscroll-behavior: contain;
`;

const ResultItem = styled.div<{ $selected: boolean }>`
  padding: 0.8rem 1rem;
  cursor: pointer;
  background-color: ${props => props.$selected ? 'var(--hover-bg-color, #f5f5f5)' : 'transparent'};
  border-left: 3px solid ${props => props.$selected ? 'var(--primary-color, #0066cc)' : 'transparent'};

  &:hover {
    background-color: var(--hover-bg-color, #f5f5f5);
  }
`;

const ResultTitle = styled.div`
  font-weight: 500;
  color: var(--text-color, #333);
  margin-bottom: 0.3rem;
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 0.8rem;
`;

const ResultType = styled.span`
  flex-shrink: 0;
  font-size: 0.75rem;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  background-color: var(--toc-active-bg, rgba(0, 102, 204, 0.1));
  color: var(--primary-color, #0066cc);
`;

const ResultSnippet = styled.div`
  font-size: 0.85rem;
  color: var(--secondary-text-color, #666);
  line-height: 1.4;

  em {
    font-style: normal;
    background-color: var(--accent-fill);
    color: var(--on-accent-color);
    font-weight: bold;
    border-radius: 2px;
  }
`;

const EmptyState = styled.div`
  padding: 2rem;
  text-align: center;
  color: var(--secondary-text-color, #888);
`;

const CloseButton = styled.button`
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  margin-left: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 5px;
  background: var(--hover-bg-color);
  color: var(--text-color);
  cursor: pointer;
`;
const SearchLabel = styled.div`
  padding: 0.9rem 1rem 0;
  color: var(--primary-color);
  font: 0.7rem/1.5 var(--font-mono);
  letter-spacing: 0.1em;
`;
const SearchHelp = styled.p`
  padding: 0.8rem 1rem;
  border-top: 1px solid var(--border-color);
  color: var(--secondary-text-color);
  font-size: 0.75rem;
`;

// 只给读屏软件读的文字
const VisuallyHidden = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
`;

interface SearchResult {
  type: 'course' | 'chapter';
  id: string;
  title: string;
  snippet: string;
  url: string;
}

interface SearchModalProps {
  onClose: () => void;
}

const RESULTS_ID = 'search-results';
const resultId = (index: number) => `search-result-${index}`;

const SearchModal: React.FC<SearchModalProps> = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const trimmedQuery = query.trim();

  const handleSelect = React.useCallback((result: SearchResult) => {
    navigate(result.url);
    onClose();
  }, [navigate, onClose]);

  // 打开时聚焦输入框；关闭后把焦点还给打开前的元素（导航栏的搜索按钮），键盘用户不用从页面开头重新找
  useEffect(() => {
    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    inputRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      if (previouslyFocused instanceof HTMLElement && previouslyFocused.isConnected) {
        previouslyFocused.focus({ preventScroll: true });
      }
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 输入法组字时的按键（比如拼音输入回车上屏）交给输入法处理，不跳转也不关闭。
      // Safari 确认上屏时 isComposing 已经是 false，只能靠 keyCode 229 识别
      if (e.isComposing || e.keyCode === 229) return;
      if (e.key === 'Escape') { e.preventDefault(); onClose(); return; }
      // 输入框与关闭按钮之间循环，焦点不会进入背后的页面。
      if (e.key === 'Tab') {
        e.preventDefault();
        if (document.activeElement === inputRef.current) closeRef.current?.focus();
        else inputRef.current?.focus();
        return;
      }
      // 关闭按钮上的 Enter 交给按钮处理，不触发搜索结果跳转。
      if (document.activeElement !== inputRef.current || loading) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(0, Math.min(prev + 1, results.length - 1)));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      }
      if (e.key === 'Enter' && results[selectedIndex]) {
        // 关闭后焦点回到搜索入口，阻止同一次 Enter 默认点击入口而重新打开弹窗。
        e.preventDefault();
        handleSelect(results[selectedIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [results, selectedIndex, onClose, handleSelect, loading]);

  // 用方向键选到列表可视范围以外的结果时，把它滚进来
  useEffect(() => {
    document.getElementById(resultId(selectedIndex))?.scrollIntoView?.({ block: 'nearest' });
  }, [selectedIndex, results]);

  useEffect(() => {
    if (trimmedQuery.length === 0) {
      setResults([]);
      setLoading(false);
      setFailed(false);
      return;
    }

    setResults([]);
    setSelectedIndex(0);
    setLoading(true);
    setFailed(false);
    // 输入变化时取消上一次还没返回的请求，避免慢的旧响应覆盖新结果
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(trimmedQuery)}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`搜索请求失败: ${response.status}`);
        }
        const data: SearchResult[] = await response.json();
        if (controller.signal.aborted) return;
        setResults(data);
        setSelectedIndex(0);
        setFailed(false);
        setLoading(false);
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error(err);
        setResults([]);
        setFailed(true);
        setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [trimmedQuery]);

  const showResults = !loading && results.length > 0;

  return (
    <Overlay onClick={onClose}>
      <ModalContainer
        role="dialog"
        aria-modal="true"
        aria-label="搜索"
        onClick={e => e.stopPropagation()}
      >
        <SearchLabel>SEARCH / 全站搜索</SearchLabel>
        <SearchHeader>
          <SearchIcon><Icon name="search" /></SearchIcon>
          {/* 组合框：焦点一直留在输入框里，aria-activedescendant 告诉读屏软件当前选中的是哪条结果 */}
          <SearchInput
            ref={inputRef}
            role="combobox"
            aria-label="搜索课程或章节"
            aria-autocomplete="list"
            aria-expanded={showResults}
            aria-controls={RESULTS_ID}
            aria-activedescendant={showResults ? resultId(selectedIndex) : undefined}
            enterKeyHint="search"
            placeholder="搜索课程或章节..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <CloseButton ref={closeRef} onClick={onClose} aria-label="关闭搜索"><Icon name="close" size={18} /></CloseButton>
        </SearchHeader>

        <ResultsList>
          {/* 搜索状态变化时读屏软件会读出来 */}
          <div role="status">
            {!trimmedQuery && <EmptyState>从一个问题开始<br /><small>输入课程名、知识点或 API 名称，例如「碰撞检测」「SDL_GetError」。</small></EmptyState>}
            {loading && <EmptyState>搜索中...</EmptyState>}

            {!loading && failed && <EmptyState>搜索失败，请稍后再试</EmptyState>}

            {!loading && !failed && results.length === 0 && trimmedQuery.length > 0 && (
              <EmptyState>未找到相关内容</EmptyState>
            )}

            {showResults && <VisuallyHidden>找到 {results.length} 条结果</VisuallyHidden>}
          </div>

          <div id={RESULTS_ID} role="listbox" aria-label="搜索结果">
            {showResults && results.map((result, index) => (
              <ResultItem
                key={`${result.type}-${result.id}`}
                id={resultId(index)}
                role="option"
                aria-selected={index === selectedIndex}
                $selected={index === selectedIndex}
                onClick={() => handleSelect(result)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <ResultTitle>
                  {result.title}
                  <ResultType>{result.type === 'course' ? '课程' : '章节'}</ResultType>
                </ResultTitle>
                <ResultSnippet>{result.snippet}</ResultSnippet>
              </ResultItem>
            ))}
          </div>
        </ResultsList>
        <SearchHelp>↑ ↓ 选择结果 · Enter 打开 · Esc 关闭</SearchHelp>
      </ModalContainer>
    </Overlay>
  );
};

export default SearchModal;
