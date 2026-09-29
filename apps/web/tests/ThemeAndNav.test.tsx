import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';
import { AuthProvider } from '../src/context/AuthContext';
import { ToastProvider } from '../src/context/ToastContext';
import { BrowserRouter } from 'react-router-dom';
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

describe('Theme and Navigation Integration', () => {
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

  it('renders Navbar with logo, streak counter, and links', () => {
    render(
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <BrowserRouter>
              <Navbar />
            </BrowserRouter>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    );

    expect(screen.getByText(/FastQuiz/i)).toBeDefined();
    expect(screen.getByText(/Curriculum/i)).toBeDefined();
    expect(screen.getByText(/Mock Tests/i)).toBeDefined();
    expect(screen.getByText(/Streak/i)).toBeDefined();
    expect(screen.getByText(/Rohan V./i)).toBeDefined();
  });
});
