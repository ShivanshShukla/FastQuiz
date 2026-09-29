import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QuizRunnerPage } from '../src/pages/QuizRunnerPage';
import { ThemeProvider } from '../src/context/ThemeContext';
import { AuthProvider } from '../src/context/AuthContext';
import { ToastProvider } from '../src/context/ToastContext';

describe('QuizRunnerPage', () => {
  it('renders question slate and options', () => {
    render(
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <BrowserRouter>
              <QuizRunnerPage />
            </BrowserRouter>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    );

    // Verify Question 01 header and options
    expect(screen.getByText(/Question 01/i)).toBeDefined();
    expect(screen.getByText(/Cache Stampede/i)).toBeDefined();
    expect(screen.getByText(/Live Session Telemetry/i)).toBeDefined();
    expect(screen.getByText(/Question Palette/i)).toBeDefined();
  });

  it('selects option on click and marks current selection', () => {
    render(
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <BrowserRouter>
              <QuizRunnerPage />
            </BrowserRouter>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    );

    // Option B: Probabilistic early expiration
    const optionB = screen.getByText(/probabilistic early expiration/i);
    fireEvent.click(optionB);

    expect(screen.getByText(/Current Selection/i)).toBeDefined();
  });

  it('toggles flag for review button', () => {
    render(
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <BrowserRouter>
              <QuizRunnerPage />
            </BrowserRouter>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    );

    const flagBtn = screen.getByText(/Flag for Review/i);
    fireEvent.click(flagBtn);

    expect(screen.getByText(/Flagged for Review/i)).toBeDefined();
  });
});
