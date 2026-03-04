import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { ThemeProvider } from './context/ThemeContext';

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
const MarkdownPage = React.lazy(() => import('./components/MarkdownPage'));

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

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <MainContent key={location.pathname} $routeKey={location.pathname}>
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
        <Route path="/roadmap" element={<RoadmapPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/test-video" element={<MarkdownPage title="视频测试" contentUrl="/content/test-video.md" />} />
      </Routes>
      </Suspense>
    </MainContent>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
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
