import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { axe } from "vitest-axe";
import { CookieConsentBanner } from "../src/components/Common/CookieConsentBanner";
import { ExitConfirmModal } from "../src/components/Common/ExitConfirmModal";
import { PaywallCard } from "../src/components/Checkout/PaywallCard";
import { ThemeProvider } from "../src/context/ThemeContext";
import { AuthProvider } from "../src/context/AuthContext";
import { ToastProvider } from "../src/context/ToastContext";
import { LoginPage } from "../src/pages/LoginPage";

describe("Automated WCAG 2.1 AA Accessibility (Axe-Core)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("CookieConsentBanner passes automated axe accessibility audits", async () => {
    const { container } = render(
      <MemoryRouter>
        <CookieConsentBanner />
      </MemoryRouter>,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("ExitConfirmModal passes automated axe accessibility audits", async () => {
    const { container } = render(
      <ExitConfirmModal
        isOpen={true}
        onClose={() => {}}
        onConfirmExit={() => {}}
        currentQuestion={3}
        totalQuestions={10}
      />,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("PaywallCard passes automated axe accessibility audits", async () => {
    const { container } = render(
      <ToastProvider>
        <MemoryRouter>
          <PaywallCard
            trackTitle="System Design Masterclass"
            priceInr={499}
            features={[
              "Full 10-Question Diagnostic Assessment",
              "Staff L6 Architecture Rubrics",
              "Lifetime Review Access",
            ]}
            onUnlock={() => {}}
          />
        </MemoryRouter>
      </ToastProvider>,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("LoginPage passes automated axe accessibility audits", async () => {
    const { container } = render(
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <MemoryRouter initialEntries={["/login"]}>
              <LoginPage initialMode="login" />
            </MemoryRouter>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
