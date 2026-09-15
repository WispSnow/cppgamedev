import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

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
  padding-top: 5rem;
  backdrop-filter: blur(2px);
`;

const ModalContainer = styled.div`
  width: 100%;
  max-width: 600px;
  background-color: var(--card-bg-color, #fff);
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  max-height: 80vh;
  margin: 0 1rem;
`;

const SearchHeader = styled.div`
  padding: 1rem;
  border-bottom: 1px solid var(--border-color, #eee);
  display: flex;
  align-items: center;
`;

const SearchIcon = styled.span`
  font-size: 1.2rem;
  margin-right: 0.8rem;
  color: var(--secondary-text-color, #888);
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  font-size: 1.1rem;
  background: transparent;
  color: var(--text-color, #333);
  outline: none;

  &::placeholder {
    color: var(--secondary-text-color, #aaa);
  }
`;

const ResultsList = styled.div`
  overflow-y: auto;
  padding: 0.5rem 0;
  max-height: 60vh;
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
`;

const ResultType = styled.span`
  font-size: 0.75rem;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  background-color: #e3f2fd;
  color: #1565c0;
`;

const ResultSnippet = styled.div`
  font-size: 0.85rem;
  color: var(--secondary-text-color, #666);
  line-height: 1.4;

  em {
    font-style: normal;
    background-color: rgba(255, 255, 0, 0.3);
    font-weight: bold;
    border-radius: 2px;
  }
`;

const EmptyState = styled.div`
  padding: 2rem;
  text-align: center;
  color: var(--secondary-text-color, #888);
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

const SearchModal: React.FC<SearchModalProps> = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleSelect = React.useCallback((result: SearchResult) => {
    navigate(result.url);
    onClose();
  }, [navigate, onClose]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 输入法组字时的按键（比如拼音输入回车上屏）交给输入法处理，不跳转也不关闭。
      // Safari 确认上屏时 isComposing 已经是 false，只能靠 keyCode 229 识别
      if (e.isComposing || e.keyCode === 229) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      }
      if (e.key === 'Enter' && results.length > 0) {
        handleSelect(results[selectedIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [results, selectedIndex, onClose, handleSelect]);

  useEffect(() => {
    const trimmedQuery = query.trim();
    if (trimmedQuery.length === 0) {
      setResults([]);
      setLoading(false);
      setFailed(false);
      return;
    }

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
  }, [query]);


  // Highlight matches in snippet manually since backend returns pure text
  // Note: Better implementation would have backend return pre-highlighted text or indices
  // For now we just display the snippet as is (which comes from backend)
  // If we wanted bolding, we'd need regex replacement here.

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={e => e.stopPropagation()}>
        <SearchHeader>
          <SearchIcon>🔍</SearchIcon>
          <SearchInput
            ref={inputRef}
            placeholder="搜索课程或章节..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </SearchHeader>

        <ResultsList>
          {loading && <EmptyState>搜索中...</EmptyState>}

          {!loading && failed && <EmptyState>搜索失败，请稍后再试</EmptyState>}

          {!loading && !failed && results.length === 0 && query.trim().length > 0 && (
            <EmptyState>未找到相关内容</EmptyState>
          )}

          {!loading && results.map((result, index) => (
            <ResultItem
              key={`${result.type}-${result.id}`}
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
        </ResultsList>
      </ModalContainer>
    </Overlay>
  );
};

export default SearchModal;
