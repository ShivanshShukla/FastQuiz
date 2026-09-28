import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DashboardPage } from '../src/pages/DashboardPage';
import { AuthContext } from '../src/context/AuthContext';
import { FastQuizClient, type AdminUser } from '@fastquiz/shared';

const mockSuperAdmin: AdminUser = {
  id: 'adm-001',
  name: 'Alex Super Admin',
  email: 'admin@fastquiz.dev',
  role: 'super_admin',
  totp_enabled: true,
  created_at: '2026-01-01T00:00:00Z',
};

const mockFinanceAdmin: AdminUser = {
  id: 'adm-002',
  name: 'Taylor Finance',
  email: 'finance@fastquiz.dev',
  role: 'finance',
  totp_enabled: true,
  created_at: '2026-01-01T00:00:00Z',
};

const renderWithAuth = (ui: React.ReactNode, adminUser: AdminUser = mockSuperAdmin) => {
  return render(
    <AuthContext.Provider
      value={{
        user: adminUser,
        accessToken: 'mock-token',
        role: adminUser.role,
        isAuthenticated: true,
        isAdmin: true,
        isInitializing: false,
        client: new FastQuizClient({ useMockFallback: true }),
        totpChallenge: null,
        login: vi.fn(),
        confirmTotp: vi.fn(),
        verifyTotp: vi.fn(),
        clearTotpChallenge: vi.fn(),
        loginDemoAdmin: vi.fn(),
        loginDemoUser: vi.fn(),
        logout: vi.fn(),
      }}
    >
      <MemoryRouter>{ui}</MemoryRouter>
    </AuthContext.Provider>
  );
};

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders welcome greeting with admin role pill badge', async () => {
    renderWithAuth(<DashboardPage />, mockSuperAdmin);

    expect(screen.getByText(/Welcome back, Alex Super Admin/i)).toBeInTheDocument();
    expect(screen.getByText('SUPER_ADMIN')).toBeInTheDocument();
  });

  it('renders the stat cards deck with metrics and period delta percentages', async () => {
    renderWithAuth(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Registered Users')).toBeInTheDocument();
      expect(screen.getByText('Active (DAU)')).toBeInTheDocument();
      expect(screen.getByText('New Signups')).toBeInTheDocument();
      expect(screen.getByText('Paying Customers')).toBeInTheDocument();
      expect(screen.getByText('Free→Paid Conv.')).toBeInTheDocument();
      expect(screen.getByText('Gross Revenue')).toBeInTheDocument();
      expect(screen.getByText('Pending Review')).toBeInTheDocument();
    });
  });

  it('allows switching date range filter between Today, 7 Days, and 30 Days', async () => {
    renderWithAuth(<DashboardPage />);

    const thirtyDaysBtn = screen.getByRole('button', { name: /30 Days/i });
    fireEvent.click(thirtyDaysBtn);

    await waitFor(() => {
      expect(screen.getByText('In selected 30d range')).toBeInTheDocument();
    });

    const todayBtn = screen.getByRole('button', { name: /Today/i });
    fireEvent.click(todayBtn);

    await waitFor(() => {
      expect(screen.getByText('In selected today range')).toBeInTheDocument();
    });
  });

  it('allows toggling Top Performing Quizzes by Revenue and Attempts', async () => {
    renderWithAuth(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Top Performing Quizzes')).toBeInTheDocument();
      expect(screen.getAllByText(/Sliding Window Mastery/i).length).toBeGreaterThan(0);
    });

    const byAttemptsBtn = screen.getByRole('button', { name: /By Attempts/i });
    fireEvent.click(byAttemptsBtn);

    await waitFor(() => {
      expect(byAttemptsBtn).toHaveClass('shadow-2xs');
    });
  });

  it('renders Needs Attention alerts hub with urgent action items', async () => {
    renderWithAuth(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Needs Attention')).toBeInTheDocument();
      expect(screen.getByText(/24 Questions Pending Review in Queue/i)).toBeInTheDocument();
    });
  });

  it('highlights revenue card when user has finance role', async () => {
    renderWithAuth(<DashboardPage />, mockFinanceAdmin);

    expect(screen.getByText('FINANCE')).toBeInTheDocument();
    expect(screen.getByText('Gross Revenue')).toBeInTheDocument();
  });
});
