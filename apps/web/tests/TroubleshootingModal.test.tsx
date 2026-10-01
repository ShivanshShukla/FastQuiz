import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TroubleshootingModal } from "../src/components/Common/TroubleshootingModal";
import { ThemeProvider } from "../src/context/ThemeContext";
import { AuthProvider } from "../src/context/AuthContext";
import { ToastProvider } from "../src/context/ToastContext";

const renderModal = (props: { isOpen: boolean; onClose: () => void }) =>
  render(
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <TroubleshootingModal {...props} />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>,
  );

describe("TroubleshootingModal Component", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("renders null when isOpen is false", () => {
    renderModal({ isOpen: false, onClose: vi.fn() });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("renders report details for unauthenticated state", () => {
    renderModal({ isOpen: true, onClose: vi.fn() });
    expect(
      screen.getByText(/Diagnostics & Troubleshooting/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Unauthenticated/i)).toBeInTheDocument();
  });

  it("renders report details when user is authenticated with identities", () => {
    window.localStorage.setItem(
      "fastquiz_user",
      JSON.stringify({
        id: "usr-1",
        name: "Test User",
        email: "test@example.com",
        status: "active",
        emailVerified: true,
        identities: [{ provider: "google" }],
      }),
    );
    window.localStorage.setItem("fastquiz_theme", "light");
    window.localStorage.setItem("fastquiz_cookie_consent", "all_accepted");

    renderModal({ isOpen: true, onClose: vi.fn() });
    expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
  });

  it("handles clipboard write failure gracefully", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: vi.fn().mockRejectedValue(new Error("Permission denied")),
      },
      configurable: true,
      writable: true,
    });

    renderModal({ isOpen: true, onClose: vi.fn() });
    const copyBtn = screen.getByRole("button", {
      name: /copy diagnostics json/i,
    });
    fireEvent.click(copyBtn);

    expect(
      await screen.findByText(/Unable to copy to clipboard/i),
    ).toBeInTheDocument();
  });
});
