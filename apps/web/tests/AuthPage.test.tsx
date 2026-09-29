import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { LoginPage } from '../src/pages/LoginPage';
import { ThemeProvider } from '../src/context/ThemeContext';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { ToastProvider } from '../src/context/ToastContext';

const AuthStatusViewer: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  return (
    <div>
      <span data-testid="auth-state">{isAuthenticated ? 'authenticated' : 'guest'}</span>
      <span data-testid="user-email">{user?.email || 'none'}</span>
      <span data-testid="user-name">{user?.name || 'none'}</span>
    </div>
  );
};

const renderAuthPage = (initialMode: 'login' | 'signup' = 'login') =>
  render(
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <MemoryRouter initialEntries={['/login']}>
            <AuthStatusViewer />
            <Routes>
              <Route path="/login" element={<LoginPage initialMode={initialMode} />} />
              <Route path="/curriculum" element={<div>Curriculum Dashboard Destination</div>} />
            </Routes>
          </MemoryRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );

describe('Unified LoginPage - Production Mode (mock=false)', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders Sign In mode with Google and GitHub buttons by default without Instant Demo', () => {
    renderAuthPage('login');

    expect(screen.getByRole('heading', { name: /Sign in to FastQuiz/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Continue with Google/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Continue with GitHub/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Sign In with Email/i })).toBeDefined();

    // Instant Demo button MUST NOT be present in production mode
    expect(screen.queryByRole('button', { name: /Instant Demo/i })).toBeNull();

    // Dummy testimonial quote MUST NOT be present in production mode
    expect(screen.queryByText(/Vikram S\. • Staff Infra Engineer/i)).toBeNull();
  });

  it('switches between Sign In and Create Account modes', () => {
    renderAuthPage('login');

    // Initially in Sign In mode, Full Name is not present
    expect(screen.queryByLabelText(/Full Name/i)).toBeNull();

    // Click Create Account tab
    const createAccountTab = screen.getByRole('button', { name: /Create Account/i });
    fireEvent.click(createAccountTab);

    // Full Name input appears
    expect(screen.getByLabelText(/Full Name/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Create Free Account/i })).toBeDefined();

    // Switch back to Sign In
    const signInTab = screen.getByRole('button', { name: /Sign In/i });
    fireEvent.click(signInTab);

    expect(screen.queryByLabelText(/Full Name/i)).toBeNull();
  });

  it('authenticates candidate via Google OAuth', async () => {
    renderAuthPage('login');

    const googleBtn = screen.getByRole('button', { name: /Continue with Google/i });
    fireEvent.click(googleBtn);

    await waitFor(() => {
      expect(screen.getByTestId('auth-state').textContent).toBe('authenticated');
      expect(screen.getByTestId('user-email').textContent).toBe('alex.chen@gmail.com');
    });
  });

  it('authenticates candidate via GitHub OAuth', async () => {
    renderAuthPage('login');

    const gitHubBtn = screen.getByRole('button', { name: /Continue with GitHub/i });
    fireEvent.click(gitHubBtn);

    await waitFor(() => {
      expect(screen.getByTestId('auth-state').textContent).toBe('authenticated');
      expect(screen.getByTestId('user-email').textContent).toBe('alex-chen@github.com');
    });
  });

  it('signs in with email and password', async () => {
    renderAuthPage('login');

    const emailInput = screen.getByLabelText(/Email Address/i);
    const passwordInput = screen.getByLabelText(/^Password$/i);
    const submitBtn = screen.getByRole('button', { name: /Sign In with Email/i });

    fireEvent.change(emailInput, { target: { value: 'sarah.engineer@uber.com' } });
    fireEvent.change(passwordInput, { target: { value: 'staffSecret123!' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByTestId('auth-state').textContent).toBe('authenticated');
      expect(screen.getByTestId('user-email').textContent).toBe('sarah.engineer@uber.com');
    });
  });

  it('creates new account in Sign Up mode', async () => {
    renderAuthPage('signup');

    const nameInput = screen.getByLabelText(/Full Name/i);
    const emailInput = screen.getByLabelText(/Email Address/i);
    const passwordInput = screen.getByLabelText(/^Password$/i);
    const submitBtn = screen.getByRole('button', { name: /Create Free Account/i });

    fireEvent.change(nameInput, { target: { value: 'Priya Sharma' } });
    fireEvent.change(emailInput, { target: { value: 'priya.s@techcorp.io' } });
    fireEvent.change(passwordInput, { target: { value: 'securePass789' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByTestId('auth-state').textContent).toBe('authenticated');
      expect(screen.getByTestId('user-name').textContent).toBe('Priya Sharma');
      expect(screen.getByTestId('user-email').textContent).toBe('priya.s@techcorp.io');
    });
  });
});

describe('Unified LoginPage - Mock Mode Enabled (mock=true)', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem('fastquiz_mock_override', 'true');
  });

  it('renders Instant Demo button and testimonial when mock=true', () => {
    renderAuthPage('login');

    const demoBtn = screen.getByRole('button', { name: /Instant Demo/i });
    expect(demoBtn).toBeDefined();

    expect(screen.getByText(/Vikram S\. • Staff Infra Engineer/i)).toBeDefined();

    fireEvent.click(demoBtn);

    expect(screen.getByTestId('auth-state').textContent).toBe('authenticated');
    expect(screen.getByTestId('user-name').textContent).toBe('Rohan V.');
  });
});
