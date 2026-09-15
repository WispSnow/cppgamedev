import React from 'react';
import { act, render, screen } from '@testing-library/react';
import App from './App';

jest.mock(
  'react-router-dom',
  () => {
    const React = require('react');

    const BrowserRouter = ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    );

    const Routes = ({ children }: { children: React.ReactNode }) => <>{children}</>;

    const Route = ({ element }: { element: React.ReactNode }) => <>{element}</>;

    const Link = ({ children }: { children: React.ReactNode }) => <span>{children}</span>;

    return {
      BrowserRouter,
      Routes,
      Route,
      Link,
      NavLink: Link,
      useParams: () => ({}),
      useNavigate: () => () => undefined,
      useLocation: () => ({ pathname: '/', search: '' }),
    };
  },
  { virtual: true }
);

jest.mock('axios', () => {
  const get = jest.fn(() => Promise.resolve({ data: [] }));

  return {
    __esModule: true,
    default: { get },
    get,
  };
});

// 页面都是按需加载的，这里全部替换成空组件，只验证应用外壳能正常渲染
jest.mock('./pages/HomePage', () => ({ __esModule: true, default: () => <div /> }));
jest.mock('./pages/MainlinePage', () => ({ __esModule: true, default: () => <div /> }));
jest.mock('./pages/CourseDetailPage', () => ({ __esModule: true, default: () => <div /> }));
jest.mock('./pages/CoursePartPage', () => ({ __esModule: true, default: () => <div /> }));
jest.mock('./pages/CoursesPage', () => ({ __esModule: true, default: () => <div /> }));
jest.mock('./pages/SideQuestsPage', () => ({ __esModule: true, default: () => <div /> }));
jest.mock('./pages/TroubleshootingPage', () => ({ __esModule: true, default: () => <div /> }));
jest.mock('./pages/TroubleshootingDetailPage', () => ({ __esModule: true, default: () => <div /> }));
jest.mock('./pages/AboutPage', () => ({ __esModule: true, default: () => <div /> }));
jest.mock('./pages/ContactPage', () => ({ __esModule: true, default: () => <div /> }));
jest.mock('./pages/CollaboratePage', () => ({ __esModule: true, default: () => <div /> }));
jest.mock('./pages/RoadmapPage', () => ({ __esModule: true, default: () => <div /> }));
jest.mock('./pages/FAQPage', () => ({ __esModule: true, default: () => <div /> }));
jest.mock('./pages/NotFoundPage', () => ({ __esModule: true, default: () => <div /> }));

describe('App', () => {
  it('renders the main navigation links', async () => {
    // 页面是 React.lazy 按需加载的，在 act 里等它们加载完，否则 React 会对每个页面报一次 act 警告
    await act(async () => {
      render(<App />);
    });

    // 导航栏和页脚里有同名链接，所以用 getAllByText
    for (const label of ['主线', '支线', '路线图', '疑难解决', 'FAQ']) {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    }
  });
});
