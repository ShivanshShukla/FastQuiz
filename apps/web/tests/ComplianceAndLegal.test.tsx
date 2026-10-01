import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { PrivacyPolicyPage } from "../src/pages/legal/PrivacyPolicyPage";
import { TermsAndConditionsPage } from "../src/pages/legal/TermsAndConditionsPage";
import { CookiePolicyPage } from "../src/pages/legal/CookiePolicyPage";
import { RefundPolicyPage } from "../src/pages/legal/RefundPolicyPage";
import { AboutUsPage } from "../src/pages/legal/AboutUsPage";
import { CookieConsentBanner } from "../src/components/Common/CookieConsentBanner";

describe("Indian Compliance & Legal Pages Suite", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("renders DPDPA 2023 Privacy Policy with Grievance Officer details", () => {
    render(
      <MemoryRouter>
        <PrivacyPolicyPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { name: /^Privacy Policy$/i }),
    ).toBeDefined();
    expect(
      screen.getByText(
        /Digital Personal Data Protection Act, 2023 \(DPDPA 2023\)/i,
      ),
    ).toBeDefined();
    expect(
      screen.getAllByText(/Designated Grievance Officer/i).length,
    ).toBeGreaterThan(0);
    expect(screen.getByText(/Ankit Mehra/i)).toBeDefined();
    expect(screen.getByText(/grievance@fastquiz.in/i)).toBeDefined();
    expect(screen.getByText(/Protection of Children/i)).toBeDefined();
  });

  it("renders Terms and Conditions with Indian jurisdiction and educational disclaimers", () => {
    render(
      <MemoryRouter>
        <TermsAndConditionsPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { name: /Terms and Conditions of Use/i }),
    ).toBeDefined();
    expect(
      screen.getAllByText(/Indian Contract Act, 1872/i).length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByText(/Bengaluru, Karnataka/i).length).toBeGreaterThan(
      0,
    );
    expect(
      screen.getByText(/Educational Disclaimer & Employment Non-Guarantee/i),
    ).toBeDefined();
    expect(
      screen.getByText(/Assessment Honor Code and Prohibited Conduct/i),
    ).toBeDefined();
  });

  it("renders Cookie Policy with Indian legal analysis and storage inventory", () => {
    render(
      <MemoryRouter>
        <CookiePolicyPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { name: /Cookie & Local Storage Policy/i }),
    ).toBeDefined();
    expect(
      screen.getByText(/Is Cookie Consent Mandatory Under Indian Law\?/i),
    ).toBeDefined();
    expect(screen.getByText(/fastquiz_access_token/i)).toBeDefined();
    expect(screen.getByText(/fastquiz_theme/i)).toBeDefined();
    expect(screen.getByText(/No Ad Networks/i)).toBeDefined();
  });

  it("renders Refund Policy with Consumer Protection E-Commerce compliance", () => {
    render(
      <MemoryRouter>
        <RefundPolicyPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", {
        name: /Refund & Access Guarantee Policy/i,
      }),
    ).toBeDefined();
    expect(
      screen.getByText(/Consumer Protection \(E-Commerce\) Rules, 2020/i),
    ).toBeDefined();
    expect(
      screen.getByText(/The FastQuiz "Try-Before-You-Buy" Core Guarantee/i),
    ).toBeDefined();
    expect(
      screen.getByText(/Within 7 Calendar Days of Purchase/i),
    ).toBeDefined();
    expect(screen.getByText(/billing@fastquiz.in/i)).toBeDefined();
  });

  it("renders About Us with statutory business details and asset rights audit", () => {
    render(
      <MemoryRouter>
        <AboutUsPage />
      </MemoryRouter>,
    );

    expect(
      screen.getAllByText(/FastQuiz Technologies Private Limited/i).length,
    ).toBeGreaterThan(0);
    expect(screen.getByText(/U72900KA2024PTC189421/i)).toBeDefined();
    expect(
      screen.getByText(
        /Rights Verification for All Fonts, Images, Texts & Assets/i,
      ),
    ).toBeDefined();
    expect(
      screen.getByText(/SIL Open Font License 1.1 \/ Apache 2.0/i),
    ).toBeDefined();
    expect(screen.getByText(/support@fastquiz.in/i)).toBeDefined();
  });

  it("renders CookieConsentBanner and saves user consent choices", async () => {
    render(
      <MemoryRouter>
        <CookieConsentBanner />
      </MemoryRouter>,
    );

    // Initial storage is empty
    expect(window.localStorage.getItem("fastquiz_cookie_consent")).toBeNull();

    // Accept all button
    const acceptBtn = screen.getByRole("button", { name: /Accept All/i });
    fireEvent.click(acceptBtn);

    const saved = JSON.parse(
      window.localStorage.getItem("fastquiz_cookie_consent") || "{}",
    );
    expect(saved.essential).toBe(true);
    expect(saved.functional).toBe(true);
    expect(saved.diagnostics).toBe(true);
  });
});
