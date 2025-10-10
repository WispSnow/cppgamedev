import React from 'react';
import { render, screen } from '@testing-library/react';
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
      useLocation: () => ({ pathname: '/' }),
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

jest.mock('./pages/HomePage', () => ({ __esModule: true, default: () => <div /> }));
jest.mock('./pages/CourseDetailPage', () => ({ __esModule: true, default: () => <div /> }));
jest.mock('./pages/CoursePartPage', () => ({ __esModule: true, default: () => <div /> }));
jest.mock('./pages/CoursesPage', () => ({ __esModule: true, default: () => <div /> }));
jest.mock('./pages/SideQuestsPage', () => ({ __esModule: true, default: () => <div /> }));
jest.mock('./pages/TroubleshootingPage', () => ({ __esModule: true, default: () => <div /> }));
jest.mock('./pages/TroubleshootingDetailPage', () => ({ __esModule: true, default: () => <div /> }));
jest.mock('./pages/AboutPage', () => ({ __esModule: true, default: () => <div /> }));
jest.mock('./pages/ContactPage', () => ({ __esModule: true, default: () => <div /> }));
jest.mock('./pages/RoadmapPage', () => ({ __esModule: true, default: () => <div /> }));
jest.mock('./pages/FAQPage', () => ({ __esModule: true, default: () => <div /> }));
jest.mock('./components/MarkdownPage', () => ({ __esModule: true, default: () => <div /> }));

describe('App', () => {
  it('renders the main navigation links', () => {
    render(<App />);

    expect(screen.getByText('主线')).toBeInTheDocument();
    expect(screen.getByText('支线')).toBeInTheDocument();
    expect(screen.getByText('疑难解决')).toBeInTheDocument();
    expect(screen.getByText('全部任务')).toBeInTheDocument();
  });
});
