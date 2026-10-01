import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "../src/context/ThemeContext";
import { AuthProvider } from "../src/context/AuthContext";
import { ToastProvider } from "../src/context/ToastContext";
import { LoginPage } from "../src/pages/LoginPage";

const renderAuthPage = (initialMode: "login" | "signup" = "login") =>
  render(
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <MemoryRouter initialEntries={["/login"]}>
            <Routes>
              <Route
                path="/login"
                element={<LoginPage initialMode={initialMode} />}
              />
              <Route
                path="/curriculum"
                element={<div>Curriculum Destination</div>}
              />
            </Routes>
          </MemoryRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>,
  );

describe("Authentication Validation & Error Handling", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it("renders sign-in form with required email and password fields", () => {
    renderAuthPage("login");

    const emailInput = screen.getByLabelText(/Email Address/i);
    const passwordInput = screen.getByLabelText(/^Password$/i);
    const submitBtn = screen.getByRole("button", {
      name: /Sign In with Email/i,
    });

    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();
    expect(submitBtn).toBeInTheDocument();
  });

  it("enforces unchecked consent checkbox by default and blocks sign up when unconsented", async () => {
    renderAuthPage("signup");

    // Verify DPDPA consent checkbox is unchecked by default
    const consentCheckbox = screen.getByRole("checkbox");
    expect(consentCheckbox).not.toBeChecked();

    const nameInput = screen.getByLabelText(/Full Name/i);
    const emailInput = screen.getByLabelText(/Email Address/i);
    const passwordInput = screen.getByLabelText(/^Password/i);
    const createBtn = screen.getByRole("button", {
      name: /Create Free Account/i,
    });

    fireEvent.change(nameInput, { target: { value: "New Candidate" } });
    fireEvent.change(emailInput, {
      target: { value: "candidate@company.com" },
    });
    fireEvent.change(passwordInput, { target: { value: "secretPassword123" } });

    // Submit while consent checkbox is unchecked
    fireEvent.click(createBtn);

    // Submission should be blocked: token should not be created
    expect(localStorage.getItem("fastquiz_access_token")).toBeNull();

    // Now check consent and re-submit
    fireEvent.click(consentCheckbox);
    expect(consentCheckbox).toBeChecked();
    fireEvent.click(createBtn);

    await waitFor(() => {
      expect(localStorage.getItem("fastquiz_access_token")).not.toBeNull();
      const user = localStorage.getItem("fastquiz_user");
      expect(user).not.toBeNull();
      expect(JSON.parse(user!).name).toBe("New Candidate");
    });
  });

  it("validates invalid email format and blocks submission", async () => {
    renderAuthPage("login");

    const emailInput = screen.getByLabelText(/Email Address/i);
    const passwordInput = screen.getByLabelText(/^Password$/i);
    const submitBtn = screen.getByRole("button", {
      name: /Sign In with Email/i,
    });

    fireEvent.change(emailInput, { target: { value: "not-an-email" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitBtn);

    // Invalid email blocks login: token is not stored
    expect(localStorage.getItem("fastquiz_access_token")).toBeNull();
  });

  it("blocks sign in when password is empty", async () => {
    renderAuthPage("login");

    const emailInput = screen.getByLabelText(/Email Address/i);
    const submitBtn = screen.getByRole("button", {
      name: /Sign In with Email/i,
    });

    fireEvent.change(emailInput, {
      target: { value: "candidate@company.com" },
    });
    fireEvent.click(submitBtn);

    expect(localStorage.getItem("fastquiz_access_token")).toBeNull();
  });

  it("handles sign in authentication and stores candidate tokens", async () => {
    renderAuthPage("login");

    const emailInput = screen.getByLabelText(/Email Address/i);
    const passwordInput = screen.getByLabelText(/^Password$/i);
    const submitBtn = screen.getByRole("button", {
      name: /Sign In with Email/i,
    });

    fireEvent.change(emailInput, {
      target: { value: "sarah.engineer@uber.com" },
    });
    fireEvent.change(passwordInput, { target: { value: "staffSecret123!" } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(localStorage.getItem("fastquiz_access_token")).not.toBeNull();
      const user = localStorage.getItem("fastquiz_user");
      expect(user).not.toBeNull();
      expect(JSON.parse(user!).email).toBe("sarah.engineer@uber.com");
    });
  });
});
