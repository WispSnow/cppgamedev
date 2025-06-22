import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import HomePage from './pages/HomePage';
import CourseDetailPage from './pages/CourseDetailPage';
import CoursePartPage from './pages/CoursePartPage';
import CoursesPage from './pages/CoursesPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import RoadmapPage from './pages/RoadmapPage';
import FAQPage from './pages/FAQPage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ThemeToggle from './components/ThemeToggle';
import { ThemeProvider } from './context/ThemeContext';
import MarkdownPage from './components/MarkdownPage';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const MainContent = styled.main`
  flex: 1;
`;

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppContainer>
          <Navbar />
          <MainContent>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/courses/:courseId" element={<CourseDetailPage />} />
              <Route path="/courses/:courseId/parts/:partId" element={<CoursePartPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/roadmap" element={<RoadmapPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/test-video" element={<MarkdownPage title="视频测试" contentUrl="/content/test-video.md" />} />
            </Routes>
          </MainContent>
          <ThemeToggle />
          <Footer />
        </AppContainer>
      </Router>
    </ThemeProvider>
  );
}

export default App;
