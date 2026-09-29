import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LandingPage } from '../src/pages/LandingPage';
import { ThemeProvider } from '../src/context/ThemeContext';
import { AuthProvider } from '../src/context/AuthContext';
import { ToastProvider } from '../src/context/ToastContext';

const renderLandingPage = () =>
  render(
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <MemoryRouter>
            <LandingPage />
          </MemoryRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );

describe('LandingPage Component', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders hero headline, eyebrow badge, CTAs, and trust metrics', () => {
    renderLandingPage();

    // Check eyebrow and hero headline
    expect(screen.getByText(/SPRING 2026 BENCHMARKS/i)).toBeDefined();
    expect(screen.getByText(/Master Technical Interviews/i)).toBeDefined();
    expect(screen.getByText(/Without Bloated Subscriptions/i)).toBeDefined();

    // Check CTAs
    expect(screen.getAllByRole('link', { name: /Start Free Diagnostic/i }).length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: /Explore All Curriculum Tracks/i })).toBeDefined();

    // Check Trust metrics
    expect(screen.getByText(/10,000\+/i)).toBeDefined();
    expect(screen.getByText(/Engineers Benchmarked/i)).toBeDefined();
    expect(screen.getAllByText(/₹0 Free/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/FAANG Loop Correlation/i)).toBeDefined();
  });

  it('allows interacting with the live sample question and reveals verified explanation', () => {
    renderLandingPage();

    // Question stem
    expect(screen.getAllByText(/Cache Stampede/i).length).toBeGreaterThan(0);

    // Verify button is disabled initially
    const verifyBtn = screen.getByRole('button', { name: /Verify Answer/i });
    expect(verifyBtn).toBeDefined();

    // Select Option B (probabilistic early expiration)
    const optionB = screen.getByText(/XFetch algorithm/i);
    fireEvent.click(optionB);

    // Click verify
    fireEvent.click(verifyBtn);

    // Should now show optimal explanation and code
    expect(screen.getByText(/Optimal Staff Architecture: Option B/i)).toBeDefined();
    expect(screen.getByText(/delta \* beta \* ln\(rand\(\)\)/i)).toBeDefined();
    expect(screen.getByText(/ShouldRefresh/i)).toBeDefined();

    // Toggle hide code
    const hideCodeBtn = screen.getByRole('button', { name: /Hide Code/i });
    fireEvent.click(hideCodeBtn);
    expect(screen.queryByText(/ShouldRefresh/i)).toBeNull();

    // Toggle show code
    const showCodeBtn = screen.getByRole('button', { name: /Show Code/i });
    fireEvent.click(showCodeBtn);
    expect(screen.getByText(/ShouldRefresh/i)).toBeDefined();

    // Try again reset
    const tryAgainBtn = screen.getByRole('button', { name: /Try Again/i });
    fireEvent.click(tryAgainBtn);
    expect(screen.getByRole('button', { name: /Verify Answer/i })).toBeDefined();
  });

  it('renders curriculum tracks and comparison matrix', () => {
    renderLandingPage();

    // Comparison section
    expect(screen.getByText(/Why FastQuiz vs. Traditional Annual Subscriptions/i)).toBeDefined();
    expect(screen.getByText(/Traditional Prep Platforms/i)).toBeDefined();
    expect(screen.getByText(/FastQuiz Approach/i)).toBeDefined();

    // Curriculum tracks
    expect(screen.getByText(/Distributed Caching: Redis, Memcached & Cache Invalidation/i)).toBeDefined();
    expect(screen.getByText(/Arrays, Two Pointers & In-Place Algorithms/i)).toBeDefined();
    expect(screen.getByText(/Concurrency, Mutexes & Memory Barriers/i)).toBeDefined();
  });

  it('toggles FAQ accordion questions correctly', () => {
    renderLandingPage();

    // First FAQ item is open by default
    expect(screen.getByText(/Every single curriculum track/i)).toBeDefined();

    // Click second FAQ item to expand
    const secondFaqQuestion = screen.getByText(/How does the pay-per-track model work\?/i);
    fireEvent.click(secondFaqQuestion);

    expect(screen.getByText(/unlock individual modules for ₹99/i)).toBeDefined();
  });

  it('renders personalized CTA when user is authenticated', () => {
    window.localStorage.setItem(
      'fastquiz_user',
      JSON.stringify({
        id: 'usr-rohan-1',
        name: 'Rohan V.',
        email: 'rohan.v@techscholar.dev',
        role: 'user',
        tierTitle: 'Pro Scholar',
      })
    );
    window.localStorage.setItem('fastquiz_access_token', 'demo-token');

    renderLandingPage();

    expect(screen.getByRole('link', { name: /Resume Your Curriculum/i })).toBeDefined();
  });
});
