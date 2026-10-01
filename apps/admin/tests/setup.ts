import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";
import {
  MOCK_ADMIN_QUESTIONS,
  MOCK_TOPICS,
  MOCK_QUIZZES,
  MOCK_PURCHASES,
  adminMockStore,
} from "@fastquiz/shared";

afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
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

// Mock localStorage
const storageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (i: number) => Object.keys(store)[i] || null,
  };
})();

Object.defineProperty(window, "localStorage", {
  value: storageMock,
  writable: true,
});

// Mock global.fetch to intercept API calls cleanly in unit tests
global.fetch = vi
  .fn()
  .mockImplementation((urlInput: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof urlInput === "string" ? urlInput : urlInput.toString();
    const method = (init?.method || "GET").toUpperCase();

    // /admin/questions/:id/approve
    if (url.includes("/admin/questions/") && url.endsWith("/approve")) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true, status: "approved" }),
      });
    }

    // /admin/questions/:id/reject
    if (url.includes("/admin/questions/") && url.endsWith("/reject")) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true, status: "rejected" }),
      });
    }

    // /admin/questions/:id
    const questionIdMatch = url.match(/\/admin\/questions\/([^?]+)$/);
    if (questionIdMatch && method === "GET") {
      const qId = questionIdMatch[1];
      const found =
        MOCK_ADMIN_QUESTIONS.find((q) => q.id === qId) ||
        MOCK_ADMIN_QUESTIONS[0];
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(found),
      });
    }

    // /admin/questions?status=...
    if (url.includes("/admin/questions")) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(MOCK_ADMIN_QUESTIONS),
      });
    }

    // /admin/topics/:id/quizzes
    if (url.includes("/admin/topics/") && url.includes("/quizzes")) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(MOCK_QUIZZES),
      });
    }

    // /admin/topics
    if (url.includes("/admin/topics")) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(MOCK_TOPICS),
      });
    }

    // /admin/purchases (ledger)
    if (
      url.includes("/admin/purchases") &&
      !url.includes("/admin/dashboard/")
    ) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(MOCK_PURCHASES),
      });
    }

    // /auth/login
    if (url.includes("/auth/login")) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            user: {
              id: "admin-1",
              name: "Alex Admin",
              email: "admin@fastquiz.dev",
              role: "admin",
              created_at: "2026-01-01T00:00:00Z",
            },
            tokens: {
              access_token: "mock-access-token",
              refresh_token: "mock-refresh-token",
              token_type: "bearer",
              expires_in: 3600,
            },
          }),
      });
    }

    // /admin/dashboard/*
    if (url.includes("/admin/dashboard/summary")) {
      const urlObj = new URL(url, "http://localhost");
      const range = (urlObj.searchParams.get("range") || "7d") as any;
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(adminMockStore.getDashboardSummary(range)),
      });
    }
    if (url.includes("/admin/dashboard/timeseries")) {
      const urlObj = new URL(url, "http://localhost");
      const range = (urlObj.searchParams.get("range") || "7d") as any;
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve(adminMockStore.getDashboardTimeseries(range)),
      });
    }
    if (url.includes("/admin/dashboard/funnel")) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(adminMockStore.getDashboardFunnel()),
      });
    }
    if (url.includes("/admin/dashboard/top-quizzes")) {
      const urlObj = new URL(url, "http://localhost");
      const by = (urlObj.searchParams.get("by") || "revenue") as any;
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(adminMockStore.getTopQuizzes(by)),
      });
    }
    if (url.includes("/admin/dashboard/attention")) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(adminMockStore.getAttentionItems()),
      });
    }
    if (url.includes("/admin/dashboard/recent-signups")) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(adminMockStore.getRecentSignups()),
      });
    }
    if (url.includes("/admin/dashboard/recent-purchases")) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(adminMockStore.getRecentPurchases()),
      });
    }
    if (url.includes("/admin/dashboard/recent-audit")) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(adminMockStore.getRecentAuditActivity()),
      });
    }

    // /admin/users/:id/attempts/:attemptId/breakdown
    if (url.includes("/breakdown")) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve(adminMockStore.getQuestionBreakdown("att-1")),
      });
    }

    // /admin/users/:id/reveal-email
    if (url.includes("/reveal-email")) {
      const match = url.match(/\/admin\/users\/([^/]+)\/reveal-email/);
      const userId = match ? match[1] : "";
      const user = adminMockStore.getUser(userId);
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ email: user ? user.email : "" }),
      });
    }

    // /admin/users/:id/suspend
    if (url.includes("/suspend")) {
      const match = url.match(/\/admin\/users\/([^/]+)\/suspend/);
      const userId = match ? match[1] : "";
      adminMockStore.suspendUser(userId, "Test reason");
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true, status: "suspended" }),
      });
    }

    // /admin/users/:id/unsuspend
    if (url.includes("/unsuspend")) {
      const match = url.match(/\/admin\/users\/([^/]+)\/unsuspend/);
      const userId = match ? match[1] : "";
      adminMockStore.unsuspendUser(userId, "Test reason");
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true, status: "active" }),
      });
    }

    // /admin/users/:id/grants
    if (url.includes("/grants") && method === "POST") {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true }),
      });
    }

    // /admin/users/:id/notes
    if (url.includes("/notes")) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            id: "note-1",
            user_id: "usr-1",
            admin_id: "adm-1",
            admin_name: "Current Admin",
            admin_role: "admin",
            text: "Note added",
            created_at: new Date().toISOString(),
          }),
      });
    }

    // /admin/users/:id
    const userDetailMatch = url.match(/\/admin\/users\/([^/?]+)$/);
    if (userDetailMatch && method === "GET") {
      const uid = userDetailMatch[1];
      const found = adminMockStore.getUser(uid);
      if (found) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(found),
        });
      }
    }

    // /admin/users (list)
    if (url.includes("/admin/users")) {
      const urlObj = new URL(url, "http://localhost");
      const search = urlObj.searchParams.get("search") || undefined;
      const status = (urlObj.searchParams.get("status") || "all") as any;
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve(adminMockStore.listUsers({ search, status })),
      });
    }

    // Default fallback 404
    return Promise.resolve({
      ok: false,
      status: 404,
      statusText: "Not Found",
      json: () =>
        Promise.resolve({ error_code: "NOT_FOUND", message: "Not found" }),
    });
  });
