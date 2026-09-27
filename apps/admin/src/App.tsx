import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminLayout } from './components/AdminLayout';

import { LoginPage } from './pages/LoginPage';
import { ReviewQueuePage } from './pages/ReviewQueuePage';
import { ReviewDetailPage } from './pages/ReviewDetailPage';
import { ContentBrowserPage } from './pages/ContentBrowserPage';
import { PurchasesPage } from './pages/PurchasesPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public Login Route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Admin Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/review" replace />} />
              <Route path="review" element={<ReviewQueuePage />} />
              <Route path="review/:questionId" element={<ReviewDetailPage />} />
              <Route path="content" element={<ContentBrowserPage />} />
              <Route path="purchases" element={<PurchasesPage />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/review" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
