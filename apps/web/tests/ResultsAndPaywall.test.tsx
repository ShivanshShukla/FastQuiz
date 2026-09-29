import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QuizResultsPage } from '../src/pages/QuizResultsPage';
import { PaywallCard } from '../src/components/Checkout/PaywallCard';
import { ThemeProvider } from '../src/context/ThemeContext';
import { AuthProvider } from '../src/context/AuthContext';
import { ToastProvider } from '../src/context/ToastContext';

describe('Results and Paywall Integration', () => {
  it('renders diagnostic scoreboard with 90% accuracy', () => {
    render(
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <BrowserRouter>
              <QuizResultsPage />
            </BrowserRouter>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    );

    expect(screen.getByText(/Interview Ready! Staff Assessment Passed/i)).toBeDefined();
    expect(screen.getByText(/Diagnostic Skill Competency Matrix/i)).toBeDefined();
    expect(screen.getAllByText(/Cache Invalidation/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Consistency & Writes/i)).toBeDefined();
  });

  it('PaywallCard switches between single quiz and master bundle', () => {
    render(
      <ToastProvider>
        <PaywallCard topicTitle="Distributed Caching" />
      </ToastProvider>
    );

    // Default is bundle (₹399)
    expect(screen.getByText(/Unlock Staff Playbook • ₹399/i)).toBeDefined();

    // Select single quiz
    const singleRadio = screen.getByRole('radio', { name: /Distributed Caching Only/i });
    fireEvent.click(singleRadio);

    expect(screen.getByText(/Unlock Staff Playbook • ₹99/i)).toBeDefined();
  });
});
