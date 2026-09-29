import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QuizResultsPage } from '../src/pages/QuizResultsPage';
import { PaywallCard } from '../src/components/Checkout/PaywallCard';
import { ThemeProvider } from '../src/context/ThemeContext';
import { AuthProvider } from '../src/context/AuthContext';
import { ToastProvider } from '../src/context/ToastContext';
import { webMockStore } from '../src/services/webMockStore';

const renderResultsPage = () =>
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

describe('QuizResultsPage - Production Mode (mock=false)', () => {
  beforeEach(() => {
    window.localStorage.clear();
    webMockStore.setMockData(false);
  });

  it('renders Attempt Record Not Found when mock data is disabled and no attempt exists', () => {
    renderResultsPage();

    expect(screen.getByText(/Attempt Record Not Found/i)).toBeDefined();
    expect(screen.getByText(/No diagnostic results found for this attempt ID/i)).toBeDefined();
    expect(screen.getByRole('link', { name: /Browse Curriculum Tracks/i })).toBeDefined();
  });
});

describe('Results and Paywall Integration - Mock Mode Enabled (mock=true)', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem('fastquiz_mock_override', 'true');
    webMockStore.setMockData(true);
  });

  it('renders diagnostic scoreboard with 90% accuracy', () => {
    renderResultsPage();

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
