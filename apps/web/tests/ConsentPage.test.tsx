import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ThemeProvider } from "../src/context/ThemeContext";
import { AuthProvider } from "../src/context/AuthContext";
import { ToastProvider } from "../src/context/ToastContext";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { ConsentPage } from "../src/pages/ConsentPage";

const renderConsentPage = (initialEntries = ["/consent?next=/dashboard"]) =>
  render(
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <MemoryRouter initialEntries={initialEntries}>
            <Routes>
              <Route path="/consent" element={<ConsentPage />} />
              <Route path="/dashboard" element={<div>Dashboard Page</div>} />
              <Route path="/login" element={<div>Login Page</div>} />
            </Routes>
          </MemoryRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>,
  );

describe("ConsentPage Component", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem(
      "fastquiz_user",
      JSON.stringify({
        id: "usr-pending-1",
        name: "Pending User",
        email: "pending@fastquiz.dev",
        role: "user",
        tierTitle: "Scholar",
        streakDays: 1,
        xp: 100,
        avatarUrl: "/assets/avatar.png",
        status: "pending_consent",
      }),
    );
    vi.restoreAllMocks();
  });

  it("renders data privacy consent notice and terms", () => {
    renderConsentPage();
    expect(
      screen.getByText(/Data Protection & Privacy Notice/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/DPDPA 2023 Compliant/i)).toBeInTheDocument();
    const acceptBtn = screen.getByRole("button", {
      name: /accept & activate account/i,
    });
    expect(acceptBtn).toBeInTheDocument();
    expect(acceptBtn).toBeDisabled();
  });

  it("enables accept button when consent checkbox is checked", () => {
    renderConsentPage();
    const acceptBtn = screen.getByRole("button", {
      name: /accept & activate account/i,
    });
    expect(acceptBtn).toBeDisabled();

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);
    expect(acceptBtn).not.toBeDisabled();
  });

  it("accepts consent when box is checked and navigates to target", async () => {
    window.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: "active", policy_version: "2026.1" }),
    });

    renderConsentPage();
    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    const acceptBtn = screen.getByRole("button", {
      name: /accept & activate account/i,
    });
    fireEvent.click(acceptBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/Consent granted. Your account is activated!/i),
      ).toBeInTheDocument();
    });
  });

  it("handles consent failure error response from backend", async () => {
    window.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ detail: "Database connection failed" }),
    });

    renderConsentPage();
    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    const acceptBtn = screen.getByRole("button", {
      name: /accept & activate account/i,
    });
    fireEvent.click(acceptBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/Database connection failed/i),
      ).toBeInTheDocument();
    });
  });

  it("opens decline confirmation modal and cancels dialog with Keep Reviewing", () => {
    renderConsentPage();
    const declineTrigger = screen.getByRole("button", {
      name: /decline & cancel registration/i,
    });
    fireEvent.click(declineTrigger);

    expect(
      screen.getByText(/Cancel Account Registration\?/i),
    ).toBeInTheDocument();

    const cancelModalBtn = screen.getByRole("button", {
      name: /keep reviewing/i,
    });
    fireEvent.click(cancelModalBtn);

    expect(screen.queryByText(/Cancel Account Registration\?/i)).toBeNull();
  });

  it("opens decline confirmation modal and declines consent", async () => {
    window.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ detail: "Account removed" }),
    });

    renderConsentPage();
    const declineTrigger = screen.getByRole("button", {
      name: /decline & cancel registration/i,
    });
    fireEvent.click(declineTrigger);

    expect(
      screen.getByText(/Cancel Account Registration\?/i),
    ).toBeInTheDocument();

    const confirmDeclineBtn = screen.getByRole("button", {
      name: /confirm decline & delete/i,
    });
    fireEvent.click(confirmDeclineBtn);

    await waitFor(() => {
      expect(screen.getByText(/Login Page/i)).toBeInTheDocument();
    });
  });

  it("handles network failure during decline gracefully", async () => {
    window.fetch = vi.fn().mockRejectedValue(new Error("Network disconnect"));

    renderConsentPage();
    const declineTrigger = screen.getByRole("button", {
      name: /decline & cancel registration/i,
    });
    fireEvent.click(declineTrigger);

    const confirmDeclineBtn = screen.getByRole("button", {
      name: /confirm decline & delete/i,
    });
    fireEvent.click(confirmDeclineBtn);

    await waitFor(() => {
      expect(screen.getByText(/Network disconnect/i)).toBeInTheDocument();
    });
  });

  it("handles accept flow when mock mode is enabled", async () => {
    window.localStorage.setItem("fastquiz_mock_override", "true");
    window.localStorage.removeItem("fastquiz_user");

    renderConsentPage(["/consent"]);
    expect(screen.getByText(/your profile/i)).toBeInTheDocument();

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    const acceptBtn = screen.getByRole("button", {
      name: /accept & activate account/i,
    });
    fireEvent.click(acceptBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/Consent granted. Welcome to FastQuiz!/i),
      ).toBeInTheDocument();
    });
  });

  it("handles decline flow when mock mode is enabled", async () => {
    window.localStorage.setItem("fastquiz_mock_override", "true");

    renderConsentPage();
    const declineTrigger = screen.getByRole("button", {
      name: /decline & cancel registration/i,
    });
    fireEvent.click(declineTrigger);

    const confirmDeclineBtn = screen.getByRole("button", {
      name: /confirm decline & delete/i,
    });
    fireEvent.click(confirmDeclineBtn);

    await waitFor(() => {
      expect(screen.getByText(/Login Page/i)).toBeInTheDocument();
    });
  });
});
