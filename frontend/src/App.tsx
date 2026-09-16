import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { ThemeProvider } from './context/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import ScrollManager from './components/ScrollManager';

// Route-level code splitting: each page is loaded on demand
const HomePage = React.lazy(() => import('./pages/HomePage'));
const MainlinePage = React.lazy(() => import('./pages/MainlinePage'));
const CourseDetailPage = React.lazy(() => import('./pages/CourseDetailPage'));
const CoursePartPage = React.lazy(() => import('./pages/CoursePartPage'));
const CoursesPage = React.lazy(() => import('./pages/CoursesPage'));
const SideQuestsPage = React.lazy(() => import('./pages/SideQuestsPage'));
const TroubleshootingPage = React.lazy(() => import('./pages/TroubleshootingPage'));
const TroubleshootingDetailPage = React.lazy(() => import('./pages/TroubleshootingDetailPage'));
const AboutPage = React.lazy(() => import('./pages/AboutPage'));
const ContactPage = React.lazy(() => import('./pages/ContactPage'));
const RoadmapPage = React.lazy(() => import('./pages/RoadmapPage'));
const FAQPage = React.lazy(() => import('./pages/FAQPage'));
const CollaboratePage = React.lazy(() => import('./pages/CollaboratePage'));
const ProjectsPage = React.lazy(() => import('./pages/ProjectsPage'));
const ProjectDetailPage = React.lazy(() => import('./pages/ProjectDetailPage'));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'));

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
`;

const MainContent = styled.main<{ $routeKey: string }>`
  flex: 1;
  animation: ${fadeIn} 0.25s ease-out;
`;

const FallbackContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  color: var(--secondary-text-color, #666);
  font-size: 1rem;
`;

// 页面浏览统计不在路由层上报（路由刚变时新页面的标题还没确定），由 SEOHelmet 上报，见 utils/analytics.ts
function AnimatedRoutes() {
  const location = useLocation();
  return (
    <MainContent key={location.pathname} $routeKey={location.pathname}>
      {/* 路由级错误边界：发版后旧 chunk 加载失败时自动刷新，不会整页白屏 */}
      <ErrorBoundary>
      <Suspense fallback={<FallbackContainer>加载中...</FallbackContainer>}>
      <Routes location={location}>
        <Route path="/" element={<HomePage />} />
        <Route path="/mainline" element={<MainlinePage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/side-quests" element={<SideQuestsPage />} />
        <Route path="/courses/:courseId" element={<CourseDetailPage />} />
        <Route path="/courses/:courseId/parts/:partId" element={<CoursePartPage />} />
        <Route path="/troubleshooting" element={<TroubleshootingPage />} />
        <Route path="/troubleshooting/:articleId" element={<TroubleshootingDetailPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/collaborate" element={<CollaboratePage />} />
        <Route path="/roadmap" element={<RoadmapPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </Suspense>
      </ErrorBoundary>
    </MainContent>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        {/* 进入新页面时回到顶部，后退时回到原来的阅读位置 */}
        <ScrollManager />
        <AppContainer>
          <Navbar />
          <AnimatedRoutes />
          <Footer />
        </AppContainer>
      </Router>
    </ThemeProvider>
  );
}

export default App;
