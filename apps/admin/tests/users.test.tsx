import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { UsersListPage } from "../src/pages/UsersListPage";
import { UserDetailPage } from "../src/pages/UserDetailPage";
import { AuthContext } from "../src/context/AuthContext";
import {
  adminMockStore,
  FastQuizClient,
  type AdminUser,
} from "@fastquiz/shared";

const mockSuperAdmin: AdminUser = {
  id: "adm-001",
  name: "Alex Super Admin",
  email: "admin@fastquiz.dev",
  role: "super_admin",
  totp_enabled: true,
  created_at: "2026-01-01T00:00:00Z",
};

const mockReviewer: AdminUser = {
  id: "adm-002",
  name: "Robin Reviewer",
  email: "reviewer@fastquiz.dev",
  role: "reviewer",
  totp_enabled: true,
  created_at: "2026-01-01T00:00:00Z",
};

const mockSupport: AdminUser = {
  id: "adm-003",
  name: "Sam Support",
  email: "support@fastquiz.dev",
  role: "support",
  totp_enabled: true,
  created_at: "2026-01-01T00:00:00Z",
};

const renderWithAuth = (
  ui: React.ReactNode,
  adminUser: AdminUser = mockSuperAdmin,
  initialRoute = "/",
) => {
  return render(
    <AuthContext.Provider
      value={{
        user: adminUser,
        accessToken: "mock-token",
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
      <MemoryRouter initialEntries={[initialRoute]}>{ui}</MemoryRouter>
    </AuthContext.Provider>,
  );
};

describe("Users Directory & Detail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    adminMockStore.unsuspendUser("usr-1", "Reset test");
  });

  describe("UsersListPage", () => {
    it("blocks content reviewer role with Access Restricted screen", () => {
      renderWithAuth(<UsersListPage />, mockReviewer);

      expect(screen.getByText("Access Restricted")).toBeInTheDocument();
      expect(
        screen.getByText(/question moderation and content hierarchy tools/i),
      ).toBeInTheDocument();
    });

    it("renders user table with summary KPI chips for super_admin", async () => {
      renderWithAuth(<UsersListPage />, mockSuperAdmin);

      await waitFor(() => {
        expect(
          screen.getByText("Learner Accounts Directory"),
        ).toBeInTheDocument();
        expect(screen.getByText("Total Registered")).toBeInTheDocument();
        expect(screen.getByText("30d Active Users")).toBeInTheDocument();
        expect(screen.getByText("Paying Customers")).toBeInTheDocument();
        expect(screen.getByText("Sarah Connor")).toBeInTheDocument();
      });
    });

    it("masks emails for support role and allows clicking reveal", async () => {
      renderWithAuth(<UsersListPage />, mockSupport);

      await waitFor(() => {
        expect(screen.getByText("Sarah Connor")).toBeInTheDocument();
      });

      // Email should be masked as sa***@sky.net
      expect(screen.getByText("sa***@sky.net")).toBeInTheDocument();

      // Click reveal button
      const revealBtn = screen.getAllByTitle(/Reveal full email/i)[0];
      fireEvent.click(revealBtn);

      await waitFor(() => {
        expect(screen.getByText("sarah.connor@sky.net")).toBeInTheDocument();
      });
    });

    it("displays Export Filtered CSV button for super_admin and disables it for support", async () => {
      const { unmount } = renderWithAuth(<UsersListPage />, mockSuperAdmin);
      expect(screen.getByText("Export Filtered CSV")).toBeInTheDocument();
      unmount();

      renderWithAuth(<UsersListPage />, mockSupport);
      expect(screen.getByText("CSV Export Restricted")).toBeInTheDocument();
    });

    it("filters users by search query", async () => {
      renderWithAuth(<UsersListPage />, mockSuperAdmin);

      await waitFor(() => {
        expect(screen.getByText("Sarah Connor")).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(
        /Search by name, email, or user UUID/i,
      );
      fireEvent.change(searchInput, { target: { value: "Marcus" } });

      await waitFor(() => {
        expect(screen.getByText("Marcus Vance")).toBeInTheDocument();
        expect(screen.queryByText("Sarah Connor")).not.toBeInTheDocument();
      });
    });
  });

  describe("UserDetailPage", () => {
    const detailUi = (
      <Routes>
        <Route path="/users/:id" element={<UserDetailPage />} />
      </Routes>
    );

    it("renders learner profile banner, avatar, badges, and tabs", async () => {
      renderWithAuth(detailUi, mockSuperAdmin, "/users/usr-1");

      await waitFor(() => {
        expect(screen.getByText("Sarah Connor")).toBeInTheDocument();
        expect(screen.getByText("ACTIVE")).toBeInTheDocument();
        expect(screen.getByText("Suspend Learner")).toBeInTheDocument();
        expect(screen.getByText("Grant Quiz Access")).toBeInTheDocument();
        expect(screen.getByText("Reset Free Attempt")).toBeInTheDocument();
      });
    });

    it("switches between tabs and shows corresponding content", async () => {
      renderWithAuth(detailUi, mockSuperAdmin, "/users/usr-1");

      await waitFor(() => {
        expect(screen.getByText("Sarah Connor")).toBeInTheDocument();
      });

      // Switch to Attempts tab
      fireEvent.click(screen.getByText(/Attempts \(/i));
      await waitFor(() => {
        expect(screen.getByText("Sliding Window Mastery")).toBeInTheDocument();
      });

      // Switch to Purchases tab
      fireEvent.click(screen.getByText(/Purchases \(/i));
      await waitFor(() => {
        expect(screen.getByText("Gateway Reference")).toBeInTheDocument();
      });

      // Switch to Free Grants tab
      fireEvent.click(screen.getByText(/Free Grants \(/i));
      await waitFor(() => {
        expect(screen.getByText("Arrays & Two Pointers")).toBeInTheDocument();
      });

      // Switch to Admin Notes tab
      fireEvent.click(screen.getByText(/Admin Notes \(/i));
      await waitFor(() => {
        expect(screen.getByText("Add Internal Admin Note")).toBeInTheDocument();
      });
    });

    it("requires a mandatory reason before submitting account suspension", async () => {
      renderWithAuth(detailUi, mockSuperAdmin, "/users/usr-1");

      await waitFor(() => {
        expect(screen.getByText("Suspend Learner")).toBeInTheDocument();
      });

      // Open suspend modal
      fireEvent.click(screen.getByText("Suspend Learner"));
      expect(
        screen.getByText("Confirm Account Suspension"),
      ).toBeInTheDocument();

      const confirmBtn = screen.getByText("Confirm Suspension");
      expect(confirmBtn).toBeDisabled();

      // Enter reason
      const reasonInput = screen.getByPlaceholderText(
        /Explain why this action is being taken/i,
      );
      fireEvent.change(reasonInput, {
        target: { value: "Suspicious bot activity detected" },
      });

      expect(confirmBtn).not.toBeDisabled();
      fireEvent.click(confirmBtn);

      await waitFor(() => {
        expect(
          screen.queryByText("Confirm Account Suspension"),
        ).not.toBeInTheDocument();
      });
    });

    it("opens Question Breakdown Modal when an attempt row is clicked", async () => {
      renderWithAuth(detailUi, mockSuperAdmin, "/users/usr-1");

      await waitFor(() => {
        expect(screen.getByText("Sarah Connor")).toBeInTheDocument();
      });

      // Navigate to Attempts tab
      fireEvent.click(screen.getByRole("button", { name: /Attempts \(/i }));

      await waitFor(() => {
        expect(screen.getByText("Completed Quiz Attempts")).toBeInTheDocument();
      });

      // Click the attempt row
      fireEvent.click(screen.getAllByText("Sliding Window Mastery")[0]);

      await waitFor(() => {
        expect(screen.getByText(/Response Breakdown/i)).toBeInTheDocument();
        expect(
          screen.getAllByText(/Floyd Cycle Detection/i).length,
        ).toBeGreaterThan(0);
        expect(screen.getByText("Close Breakdown")).toBeInTheDocument();
      });

      // Close modal
      fireEvent.click(screen.getByText("Close Breakdown"));
      await waitFor(() => {
        expect(
          screen.queryByText(/Response Breakdown/i),
        ).not.toBeInTheDocument();
      });
    });
  });
});
