import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';
import { AuthProvider } from '../src/context/AuthContext';
import { ToastProvider } from '../src/context/ToastContext';
import { MemoryRouter } from 'react-router-dom';
import { Navbar } from '../src/components/Layout/Navbar';

const ThemeTester: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="current-theme">{theme}</span>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
};

const renderNavbar = () =>
  render(
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <MemoryRouter>
            <Navbar />
          </MemoryRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );

describe('Theme and Navigation Integration', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('toggles theme between dark and light correctly', () => {
    render(
      <ThemeProvider>
        <ThemeTester />
      </ThemeProvider>
    );

    const themeDisplay = screen.getByTestId('current-theme');
    const initialTheme = themeDisplay.textContent;

    const toggleBtn = screen.getByRole('button', { name: /toggle theme/i });
    fireEvent.click(toggleBtn);

    const nextTheme = themeDisplay.textContent;
    expect(nextTheme).not.toBe(initialTheme);
  });

  it('renders Navbar with logo, curriculum, and sign in when logged out', () => {
    renderNavbar();

    expect(screen.getByText(/FastQuiz/i)).toBeDefined();
    expect(screen.getAllByText(/Curriculum/i).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /sign in/i }).length).toBeGreaterThan(0);
    expect(screen.queryByText(/Rohan V./i)).toBeNull();
  });

  it('renders signed-in user after guest login', () => {
    window.localStorage.setItem(
      'fastquiz_user',
      JSON.stringify({
        id: 'usr-rohan-1',
        name: 'Rohan V.',
        email: 'rohan.v@techscholar.dev',
        role: 'user',
        tierTitle: 'Pro Scholar',
        streakDays: 4,
        xp: 240,
        avatarUrl: '/assets/avatar.png',
        isPro: true,
      })
    );
    window.localStorage.setItem('fastquiz_access_token', 'demo-jwt-token-rohan');

    renderNavbar();

    expect(screen.getAllByText(/Rohan V./i).length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/log out/i)).toBeDefined();
  });
});
