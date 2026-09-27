import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, DEMO_ADMIN_USER, DEMO_REGULAR_USER } from '../src/context/AuthContext';
import { ProtectedRoute } from '../src/components/ProtectedRoute';

describe('Auth & ProtectedRoute', () => {
  it('redirects unauthenticated users to /login', () => {
    render(
      <MemoryRouter initialEntries={['/review']}>
        <AuthProvider initialUser={null} initialToken={null}>
          <Routes>
            <Route path="/login" element={<div>Login Page Content</div>} />
            <Route
              path="/review"
              element={
                <ProtectedRoute>
                  <div>Secret Review Queue</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByText('Login Page Content')).toBeInTheDocument();
    expect(screen.queryByText('Secret Review Queue')).not.toBeInTheDocument();
  });

  it('blocks non-admin authenticated users with Access Denied screen', () => {
    render(
      <MemoryRouter initialEntries={['/review']}>
        <AuthProvider initialUser={DEMO_REGULAR_USER} initialToken="mock-user-token">
          <Routes>
            <Route path="/login" element={<div>Login Page</div>} />
            <Route
              path="/review"
              element={
                <ProtectedRoute>
                  <div>Secret Review Queue</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Return to Login/i })).toBeInTheDocument();
    expect(screen.queryByText('Secret Review Queue')).not.toBeInTheDocument();
  });

  it('allows verified admin users to access protected routes', () => {
    render(
      <MemoryRouter initialEntries={['/review']}>
        <AuthProvider initialUser={DEMO_ADMIN_USER} initialToken="mock-admin-token">
          <Routes>
            <Route path="/login" element={<div>Login Page</div>} />
            <Route
              path="/review"
              element={
                <ProtectedRoute>
                  <div>Secret Review Queue Content</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByText('Secret Review Queue Content')).toBeInTheDocument();
    expect(screen.queryByText('Access Denied')).not.toBeInTheDocument();
  });
});
