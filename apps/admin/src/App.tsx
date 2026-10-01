import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminLayout } from "./components/AdminLayout";
import { ErrorBoundary } from "./components/ErrorBoundary";

import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { UsersListPage } from "./pages/UsersListPage";
import { UserDetailPage } from "./pages/UserDetailPage";
import { ReviewQueuePage } from "./pages/ReviewQueuePage";
import { ReviewDetailPage } from "./pages/ReviewDetailPage";
import { ContentBrowserPage } from "./pages/ContentBrowserPage";
import { PurchasesPage } from "./pages/PurchasesPage";

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
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
                  <Route index element={<DashboardPage />} />
                  <Route path="users" element={<UsersListPage />} />
                  <Route path="users/:id" element={<UserDetailPage />} />
                  <Route path="review" element={<ReviewQueuePage />} />
                  <Route
                    path="review/:questionId"
                    element={<ReviewDetailPage />}
                  />
                  <Route path="content" element={<ContentBrowserPage />} />
                  <Route path="purchases" element={<PurchasesPage />} />
                </Route>

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
