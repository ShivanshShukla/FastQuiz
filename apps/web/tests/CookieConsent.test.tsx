import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { CookieConsentBanner } from "../src/components/Common/CookieConsentBanner";

describe("Cookie Consent Banner & Preferences Lifecycle", () => {
  const CONSENT_STORAGE_KEY = "fastquiz_cookie_consent";

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("renders consent banner on first visit when localStorage is empty", () => {
    render(
      <MemoryRouter>
        <CookieConsentBanner />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("region", {
        name: /cookie and data storage preferences/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/We use essential local storage/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /accept all/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /reject non-essential/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /customize/i }),
    ).toBeInTheDocument();
  });

  it("does not render banner if valid consent already exists in localStorage", () => {
    const existingConsent = {
      essential: true,
      functional: true,
      diagnostics: false,
    };
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(existingConsent));

    const { container } = render(
      <MemoryRouter>
        <CookieConsentBanner />
      </MemoryRouter>,
    );

    expect(container.firstChild).toBeNull();
  });

  it('clicking "Accept All" grants all categories and dismisses banner', async () => {
    render(
      <MemoryRouter>
        <CookieConsentBanner />
      </MemoryRouter>,
    );

    const acceptBtn = screen.getByRole("button", { name: /accept all/i });
    fireEvent.click(acceptBtn);

    await waitFor(() => {
      const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!);
      expect(parsed.essential).toBe(true);
      expect(parsed.functional).toBe(true);
      expect(parsed.diagnostics).toBe(true);
    });

    expect(
      screen.queryByRole("region", {
        name: /cookie and data storage preferences/i,
      }),
    ).not.toBeInTheDocument();
  });

  it('clicking "Reject Non-Essential" keeps only necessary cookies and dismisses banner', async () => {
    render(
      <MemoryRouter>
        <CookieConsentBanner />
      </MemoryRouter>,
    );

    const rejectBtn = screen.getByRole("button", {
      name: /reject non-essential/i,
    });
    fireEvent.click(rejectBtn);

    await waitFor(() => {
      const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!);
      expect(parsed.essential).toBe(true);
      expect(parsed.functional).toBe(false);
      expect(parsed.diagnostics).toBe(false);
    });

    expect(
      screen.queryByRole("region", {
        name: /cookie and data storage preferences/i,
      }),
    ).not.toBeInTheDocument();
  });

  it("opens preferences modal, toggles diagnostics, and saves custom preferences", async () => {
    render(
      <MemoryRouter>
        <CookieConsentBanner />
      </MemoryRouter>,
    );

    const customizeBtn = screen.getByRole("button", { name: /customize/i });
    fireEvent.click(customizeBtn);

    // Modal dialog is rendered
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByText(/Cookie & Storage Preferences/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Strictly Necessary Storage \(Always Active\)/i),
    ).toBeInTheDocument();

    // Find checkbox for diagnostics
    const diagnosticsSwitch = screen.getByRole("checkbox", {
      name: /anonymous diagnostic telemetry/i,
    });
    fireEvent.click(diagnosticsSwitch);

    // Save choices
    const saveBtn = screen.getByRole("button", { name: /save choices/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!);
      expect(parsed.essential).toBe(true);
      expect(parsed.diagnostics).toBe(true);
    });
  });

  it("re-opens preferences modal when open-cookie-preferences custom event is dispatched", async () => {
    const existingConsent = {
      essential: true,
      functional: true,
      diagnostics: false,
    };
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(existingConsent));

    render(
      <MemoryRouter>
        <CookieConsentBanner />
      </MemoryRouter>,
    );

    // Initially modal is closed
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // Dispatch the custom event (triggered by Footer "Cookie Settings" link)
    fireEvent(window, new CustomEvent("open-cookie-preferences"));

    // Modal should now be visible
    expect(await screen.findByRole("dialog")).toBeInTheDocument();

    // Press Escape to dismiss modal
    fireEvent.keyDown(window, { key: "Escape" });
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
});
