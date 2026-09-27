import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { ToastProvider } from '../src/context/ToastContext';
import { ReviewQueuePage } from '../src/pages/ReviewQueuePage';

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { loginDemoAdmin } = useAuth();
  React.useEffect(() => {
    loginDemoAdmin();
  }, [loginDemoAdmin]);
  return <>{children}</>;
};

describe('ReviewQueuePage', () => {
  const renderQueue = () => {
    return render(
      <MemoryRouter initialEntries={['/review']}>
        <ToastProvider>
          <AuthProvider>
            <TestWrapper>
              <ReviewQueuePage />
            </TestWrapper>
          </AuthProvider>
        </ToastProvider>
      </MemoryRouter>
    );
  };

  it('renders pending questions queue and header', async () => {
    renderQueue();

    expect(screen.getByText('Content Review Queue')).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByText(/What is the minimum time complexity/i)
      ).toBeInTheDocument();
    });

    expect(screen.getByText(/In the Maximum Sum Subarray/i)).toBeInTheDocument();
    expect(screen.getByText(/Which cache invalidation strategy/i)).toBeInTheDocument();
  });

  it('filters questions by topic', async () => {
    renderQueue();

    await waitFor(() => {
      expect(screen.getAllByText(/Arrays & Two Pointers/i)[0]).toBeInTheDocument();
    });

    // Select topic dropdown (first combobox)
    const selects = screen.getAllByRole('combobox');
    const topicSelect = selects[0];
    fireEvent.change(topicSelect, { target: { value: 'topic-dsa-1' } });

    await waitFor(() => {
      expect(
        screen.getByText(/What is the minimum time complexity/i)
      ).toBeInTheDocument();
      expect(
        screen.queryByText(/Which cache invalidation strategy/i)
      ).not.toBeInTheDocument();
    });
  });

  it('filters questions by source_type', async () => {
    renderQueue();

    await waitFor(() => {
      expect(
        screen.getByText(/What is the minimum time complexity/i)
      ).toBeInTheDocument();
    });

    const selects = screen.getAllByRole('combobox');
    const sourceSelect = selects[1]; // Second select is Source Type

    // Filter by community
    fireEvent.change(sourceSelect, { target: { value: 'community' } });

    await waitFor(() => {
      expect(
        screen.getByText(/In the Maximum Sum Subarray/i)
      ).toBeInTheDocument();
      expect(
        screen.queryByText(/What is the minimum time complexity/i)
      ).not.toBeInTheDocument();
    });
  });

  it('filters questions by text search', async () => {
    renderQueue();

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Search question text/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search question text/i);
    fireEvent.change(searchInput, { target: { value: 'Cache Stampede' } });

    await waitFor(() => {
      expect(screen.getByText(/Under high concurrency, when a hot cache key expires/i)).toBeInTheDocument();
      expect(screen.queryByText(/What is the minimum time complexity/i)).not.toBeInTheDocument();
    });
  });
});
