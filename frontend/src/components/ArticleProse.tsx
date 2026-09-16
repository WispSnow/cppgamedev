import styled from 'styled-components';

// 课程、信息页和排障文章共用的阅读排版；代码框与表格滚动由 Markdown 渲染器负责。
const ArticleProse = styled.div`
  width: 100%;
  max-width: 760px;
  min-width: 0;
  margin: 0 auto;
  color: var(--text-color);
  font-size: 1.0625rem;
  line-height: 1.85;

  h2 { margin: 2.5rem 0 0.9rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--border-color); font-size: 1.45rem; line-height: 1.5; }
  h2[data-md-h1] { font-size: 1.75rem; border-bottom: 0; padding-bottom: 0; }
  h3 { margin: 2rem 0 0.7rem; font-size: 1.2rem; line-height: 1.6; }
  h4, h5, h6 { margin: 1.5rem 0 0.5rem; }
  > :first-child { margin-top: 0; }
  p { margin-bottom: 1.25rem; }
  ul, ol { margin-bottom: 1.25rem; padding-left: 1.6rem; }
  li { margin-bottom: 0.4rem; }
  a { color: var(--primary-color); text-decoration: underline; text-underline-offset: 0.2em; text-decoration-thickness: 1px; overflow-wrap: anywhere; }
  a:hover { text-decoration-thickness: 2px; }
  img { max-width: 100%; height: auto; border-radius: 6px; margin: 1.5rem 0; }
  blockquote { margin: 1.5rem 0; padding: 0.9rem 1.2rem; border-left: 3px solid var(--primary-color); background: var(--toc-active-bg); color: var(--secondary-text-color); }
  blockquote > :last-child { margin-bottom: 0; }
  hr { border: 0; border-top: 1px solid var(--border-color); margin: 2.5rem 0; }
  table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; font-size: 0.9rem; }
  th { padding: 0.8rem 1rem; text-align: left; background: var(--toc-active-bg); color: var(--text-color); font-weight: 600; }
  td { padding: 0.8rem 1rem; }
  th, td { border-bottom: 1px solid var(--border-color); }
  tbody tr:hover { background: var(--hover-bg-color); }
  .video-container, .youtube-video-container { width: 100%; margin: 2rem auto; }
  .videos-row { display: flex; gap: 1.25rem; margin: 2rem auto; }
  .videos-row > div { flex: 1; min-width: 0; margin: 0; }
  @media (max-width: 768px) { .videos-row { flex-direction: column; } }
`;
export default ArticleProse;
