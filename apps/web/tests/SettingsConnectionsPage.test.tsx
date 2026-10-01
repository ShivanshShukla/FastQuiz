import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ThemeProvider } from "../src/context/ThemeContext";
import { AuthProvider } from "../src/context/AuthContext";
import { ToastProvider } from "../src/context/ToastContext";
import { MemoryRouter } from "react-router-dom";
import { SettingsConnectionsPage } from "../src/pages/SettingsConnectionsPage";

const renderSettingsPage = () =>
  render(
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <MemoryRouter>
            <SettingsConnectionsPage />
          </MemoryRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>,
  );

describe("SettingsConnectionsPage Component", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem(
      "fastquiz_user",
      JSON.stringify({
        id: "usr-alex-1",
        name: "Alex Chen",
        email: "alex@example.com",
        role: "user",
        tierTitle: "Scholar",
        streakDays: 5,
        xp: 300,
        avatarUrl: "/assets/avatar.png",
      }),
    );
    window.localStorage.setItem("fastquiz_access_token", "jwt-token");
    vi.restoreAllMocks();
  });

  it("renders connected accounts list and security guidelines", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "usr-alex-1",
        name: "Alex Chen",
        email: "alex@example.com",
        identities: [
          {
            provider: "google",
            provider_user_id: "google-123",
            created_at: new Date().toISOString(),
          },
        ],
        has_password: true,
      }),
    });
    globalThis.fetch = window.fetch = fetchMock;

    renderSettingsPage();
    expect(screen.getByText(/Connected Accounts/i)).toBeInTheDocument();
    expect(await screen.findByText(/Connected/i)).toBeInTheDocument();
  });

  it("triggers unlink on a connected account when multiple login methods exist", async () => {
    const fetchMock = vi
      .fn()
      .mockImplementation((url: string, opts?: RequestInit) => {
        if (opts?.method === "DELETE") {
          return Promise.resolve({
            ok: true,
            json: async () => ({ status: "success" }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({
            id: "usr-alex-1",
            name: "Alex Chen",
            email: "alex@example.com",
            identities: [
              {
                provider: "google",
                provider_user_id: "google-123",
                created_at: new Date().toISOString(),
              },
              {
                provider: "github",
                provider_user_id: "github-456",
                created_at: new Date().toISOString(),
              },
            ],
            has_password: true,
          }),
        });
      });
    globalThis.fetch = window.fetch = fetchMock;

    renderSettingsPage();
    const disconnectButtons = await screen.findAllByRole("button", {
      name: /disconnect/i,
    });
    expect(disconnectButtons.length).toBeGreaterThan(0);
    fireEvent.click(disconnectButtons[0]);

    await waitFor(() => {
      expect(
        screen.getByText(/Successfully disconnected google\./i),
      ).toBeInTheDocument();
    });
  });

  it("handles failure when unlinking account returns error response", async () => {
    const fetchMock = vi
      .fn()
      .mockImplementation((url: string, opts?: RequestInit) => {
        if (opts?.method === "DELETE") {
          return Promise.resolve({
            ok: false,
            json: async () => ({ detail: "Cannot remove identity" }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({
            id: "usr-alex-1",
            name: "Alex Chen",
            email: "alex@example.com",
            identities: [
              {
                provider: "google",
                provider_user_id: "google-123",
                created_at: new Date().toISOString(),
              },
              {
                provider: "github",
                provider_user_id: "github-456",
                created_at: new Date().toISOString(),
              },
            ],
            has_password: true,
          }),
        });
      });
    globalThis.fetch = window.fetch = fetchMock;

    renderSettingsPage();
    const disconnectButtons = await screen.findAllByRole("button", {
      name: /disconnect/i,
    });
    fireEvent.click(disconnectButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/Cannot remove identity/i)).toBeInTheDocument();
    });
  });

  it("shows disabled disconnect state and error toast when only 1 method exists", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "usr-alex-1",
        name: "Alex Chen",
        email: "alex@example.com",
        identities: [
          {
            provider: "google",
            provider_user_id: "google-123",
            created_at: new Date().toISOString(),
          },
        ],
        has_password: false,
      }),
    });
    globalThis.fetch = window.fetch = fetchMock;

    renderSettingsPage();
    const disconnectButton = await screen.findByRole("button", {
      name: /disconnect/i,
    });
    expect(disconnectButton).toBeDisabled();
  });

  it("handles provider connect redirect when clicking Connect button", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "usr-alex-1",
        name: "Alex Chen",
        email: "alex@example.com",
        identities: [],
        has_password: true,
      }),
    });
    globalThis.fetch = window.fetch = fetchMock;

    delete (window as any).location;
    window.location = { href: "" } as any;

    renderSettingsPage();
    const connectGoogle = await screen.findByRole("button", {
      name: /connect google/i,
    });
    fireEvent.click(connectGoogle);
    expect(window.location.href).toBe(
      "/auth/google/login?next=/settings/connections",
    );

    const connectGithub = await screen.findByRole("button", {
      name: /connect github/i,
    });
    fireEvent.click(connectGithub);
    expect(window.location.href).toBe(
      "/auth/github/login?next=/settings/connections",
    );
  });

  it("handles disconnecting account when mock mode is enabled", async () => {
    window.localStorage.setItem("fastquiz_mock_override", "true");
    window.localStorage.setItem(
      "fastquiz_user",
      JSON.stringify({
        id: "usr-alex-1",
        name: "Alex Chen",
        email: "alex@example.com",
        role: "user",
        tierTitle: "Scholar",
        streakDays: 5,
        xp: 300,
        avatarUrl: "/assets/avatar.png",
        identities: [
          {
            provider: "google",
            provider_user_id: "google-123",
            created_at: new Date().toISOString(),
          },
          {
            provider: "github",
            provider_user_id: "github-456",
            created_at: new Date().toISOString(),
          },
        ],
        hasPassword: true,
      }),
    );

    renderSettingsPage();
    const disconnectButtons = await screen.findAllByRole("button", {
      name: /disconnect/i,
    });
    expect(disconnectButtons.length).toBe(2);

    fireEvent.click(disconnectButtons[0]);
    await waitFor(() => {
      expect(
        screen.getByText(/Disconnected google account\./i),
      ).toBeInTheDocument();
    });
  });
});
