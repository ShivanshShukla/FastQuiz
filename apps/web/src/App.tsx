import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { MainLayout } from './components/Layout/MainLayout';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { TopicDetailPage } from './pages/TopicDetailPage';
import { QuizRunnerPage } from './pages/QuizRunnerPage';
import { QuizResultsPage } from './pages/QuizResultsPage';
import { TopicsCatalogPage } from './pages/TopicsCatalogPage';
import { PricingPage } from './pages/PricingPage';
import { LoginPage } from './pages/LoginPage';
import { LoadingDemoPage } from './pages/LoadingDemoPage';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<LandingPage />} />
                <Route path="curriculum" element={<DashboardPage />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="topics" element={<TopicsCatalogPage />} />
                <Route path="topics/:topicId" element={<TopicDetailPage />} />
                <Route path="quiz/:quizId/take" element={<QuizRunnerPage />} />
                <Route path="attempts/:attemptId/results" element={<QuizResultsPage />} />
                <Route path="pricing" element={<PricingPage />} />
                <Route path="login" element={<LoginPage initialMode="login" />} />
                <Route path="signup" element={<LoginPage initialMode="signup" />} />
                <Route path="register" element={<LoginPage initialMode="signup" />} />
                <Route path="loading" element={<LoadingDemoPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
