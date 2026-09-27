import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import {
  MOCK_ADMIN_QUESTIONS,
  MOCK_TOPICS,
  MOCK_QUIZZES,
  MOCK_PURCHASES,
} from '@fastquiz/shared';

afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Mock global.fetch to intercept API calls cleanly in unit tests
global.fetch = vi.fn().mockImplementation((urlInput: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof urlInput === 'string' ? urlInput : urlInput.toString();
  const method = (init?.method || 'GET').toUpperCase();

  // /admin/questions/:id/approve
  if (url.includes('/admin/questions/') && url.endsWith('/approve')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: true, status: 'approved' }),
    });
  }

  // /admin/questions/:id/reject
  if (url.includes('/admin/questions/') && url.endsWith('/reject')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: true, status: 'rejected' }),
    });
  }

  // /admin/questions/:id
  const questionIdMatch = url.match(/\/admin\/questions\/([^?]+)$/);
  if (questionIdMatch && method === 'GET') {
    const qId = questionIdMatch[1];
    const found = MOCK_ADMIN_QUESTIONS.find((q) => q.id === qId) || MOCK_ADMIN_QUESTIONS[0];
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve(found),
    });
  }

  // /admin/questions?status=...
  if (url.includes('/admin/questions')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve(MOCK_ADMIN_QUESTIONS),
    });
  }

  // /admin/topics/:id/quizzes
  if (url.includes('/admin/topics/') && url.includes('/quizzes')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve(MOCK_QUIZZES),
    });
  }

  // /admin/topics
  if (url.includes('/admin/topics')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve(MOCK_TOPICS),
    });
  }

  // /admin/purchases
  if (url.includes('/admin/purchases')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve(MOCK_PURCHASES),
    });
  }

  // /auth/login
  if (url.includes('/auth/login')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          user: {
            id: 'admin-1',
            name: 'Alex Admin',
            email: 'admin@fastquiz.dev',
            role: 'admin',
            created_at: '2026-01-01T00:00:00Z',
          },
          tokens: {
            access_token: 'mock-access-token',
            refresh_token: 'mock-refresh-token',
            token_type: 'bearer',
            expires_in: 3600,
          },
        }),
    });
  }

  // Default fallback
  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
  });
});
