import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

// ```mermaid 代码块渲染成图表。mermaid 库约 2MB，只在页面真的出现图表时才动态加载，
// 不影响其他页面的首屏体积。渲染失败时退回显示源码，不让整页崩掉。

const Figure = styled.figure`
  margin: 1.5rem 0;
  padding: 1rem;
  border-radius: 8px;
  background-color: var(--code-block-bg, #f6f8fa);
  overflow-x: auto;
  text-align: center;

  svg {
    max-width: 100%;
    height: auto;
  }
`;

const Placeholder = styled.div`
  color: var(--text-secondary, #666);
  font-size: 0.9rem;
`;

const Fallback = styled.pre`
  margin: 1.5rem 0;
  padding: 1rem;
  border-radius: 8px;
  background-color: var(--code-block-bg, #f6f8fa);
  overflow-x: auto;
  font-size: 14px;
  text-align: left;
`;

interface MermaidDiagramProps {
  chart: string;
  theme: string;
}

// mermaid.render 要求每次调用的 id 唯一，用模块级计数器保证
let renderCounter = 0;

const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart, theme }) => {
  const [svg, setSvg] = useState('');
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: theme === 'dark' ? 'dark' : 'default',
          securityLevel: 'strict',
        });
        renderCounter += 1;
        const result = await mermaid.render(`mermaid-diagram-${renderCounter}`, chart);
        if (!cancelled) {
          setSvg(result.svg);
          setFailed(false);
        }
      } catch (error) {
        console.error('Mermaid 图表渲染失败:', error);
        if (!cancelled) {
          setFailed(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [chart, theme]);

  if (failed) {
    return (
      <Fallback>
        <code>{chart}</code>
      </Fallback>
    );
  }

  if (!svg) {
    return (
      <Figure aria-busy="true">
        <Placeholder>图表加载中…</Placeholder>
      </Figure>
    );
  }

  return <Figure dangerouslySetInnerHTML={{ __html: svg }} />;
};

export default MermaidDiagram;
