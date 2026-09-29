import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LandingPage } from '../src/pages/LandingPage';
import { ThemeProvider } from '../src/context/ThemeContext';
import { AuthProvider } from '../src/context/AuthContext';
import { ToastProvider } from '../src/context/ToastContext';
import { webMockStore } from '../src/services/webMockStore';

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

describe('LandingPage Component - Production Mode (mock=false)', () => {
  beforeEach(() => {
    window.localStorage.clear();
    webMockStore.setMockData(false);
  });

  it('renders hero headline, eyebrow badge, and generic CTAs without dummy stats', () => {
    renderLandingPage();

    // Check eyebrow and hero headline
    expect(screen.getByText(/SPRING 2026 BENCHMARKS/i)).toBeDefined();
    expect(screen.getByText(/Master Technical Interviews/i)).toBeDefined();
    expect(screen.getByText(/Without Bloated Subscriptions/i)).toBeDefined();

    // Check CTAs
    expect(screen.getAllByRole('link', { name: /Start Free Diagnostic/i }).length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: /Explore All Curriculum Tracks/i })).toBeDefined();

    // Trust metrics with dummy data MUST NOT be present
    expect(screen.queryByText(/10,000\+/i)).toBeNull();
    expect(screen.queryByText(/Engineers Benchmarked/i)).toBeNull();
    expect(screen.queryByText(/FAANG Loop Correlation/i)).toBeNull();
  });

  it('hides synthetic live sample question in production mode', () => {
    renderLandingPage();

    expect(screen.queryByText(/Cache Stampede/i)).toBeNull();
    expect(screen.queryByText(/INTERACTIVE DEMO • TEST YOUR INSTINCTS NOW/i)).toBeNull();
    expect(screen.queryByRole('button', { name: /Verify Answer/i })).toBeNull();
  });

  it('renders clean empty state for curriculum tracks when mock data is disabled', () => {
    renderLandingPage();

    expect(screen.getByText(/No curriculum tracks published yet/i)).toBeDefined();
    expect(screen.getByText(/\?mock=true/i)).toBeDefined();
    expect(screen.queryByText(/Distributed Caching: Redis, Memcached & Cache Invalidation/i)).toBeNull();
  });

  it('hides dummy scoreboard preview and dummy testimonials in production mode', () => {
    renderLandingPage();

    expect(screen.queryByText(/BENCHMARK PASSED • TOP 8% CANDIDATE/i)).toBeNull();
    expect(screen.queryByText(/Vikram S\. • Staff Infra Engineer/i)).toBeNull();
    expect(screen.queryByText(/Ananya M\. • Senior Systems Engineer/i)).toBeNull();
  });

  it('toggles FAQ accordion questions correctly in production mode', () => {
    renderLandingPage();

    expect(screen.getByText(/Every single curriculum track/i)).toBeDefined();

    const secondFaqQuestion = screen.getByText(/How does the pay-per-track model work\?/i);
    fireEvent.click(secondFaqQuestion);

    expect(screen.getByText(/unlock individual modules for ₹99/i)).toBeDefined();
  });

  it('renders personalized CTA when user is authenticated', () => {
    window.localStorage.setItem(
      'fastquiz_user',
      JSON.stringify({
        id: 'usr-sarah-1',
        name: 'Sarah Connor',
        email: 'sarah@skynet.dev',
        role: 'user',
        tierTitle: 'Pro Scholar',
      })
    );
    window.localStorage.setItem('fastquiz_access_token', 'token-123');

    renderLandingPage();

    expect(screen.getByRole('link', { name: /Resume Your Curriculum \(Sarah\)/i })).toBeDefined();
  });
});

describe('LandingPage Component - Mock Mode Enabled (mock=true)', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem('fastquiz_mock_override', 'true');
    webMockStore.setMockData(true);
  });

  it('renders trust stats, interactive challenge, curriculum tracks, and testimonials when mock=true', () => {
    renderLandingPage();

    // Trust stats
    expect(screen.getByText(/10,000\+/i)).toBeDefined();
    expect(screen.getByText(/Engineers Benchmarked/i)).toBeDefined();

    // Live challenge
    expect(screen.getAllByText(/Cache Stampede/i).length).toBeGreaterThan(0);
    const verifyBtn = screen.getByRole('button', { name: /Verify Answer/i });
    expect(verifyBtn).toBeDefined();

    // Select option B and verify
    const optionB = screen.getByText(/XFetch algorithm/i);
    fireEvent.click(optionB);
    fireEvent.click(verifyBtn);

    expect(screen.getByText(/Optimal Staff Architecture: Option B/i)).toBeDefined();

    // Curriculum tracks
    expect(screen.getByText(/Distributed Caching: Redis, Memcached & Cache Invalidation/i)).toBeDefined();

    // Scoreboard preview and testimonials
    expect(screen.getByText(/BENCHMARK PASSED • TOP 8% CANDIDATE/i)).toBeDefined();
    expect(screen.getByText(/Vikram S\./i)).toBeDefined();
  });
});
