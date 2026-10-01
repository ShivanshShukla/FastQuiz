import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider } from "../src/context/ThemeContext";
import { AuthProvider } from "../src/context/AuthContext";
import { ToastProvider } from "../src/context/ToastContext";
import { MemoryRouter } from "react-router-dom";
import { UserMenuDropdown } from "../src/components/Layout/UserMenuDropdown";

const renderDropdown = () =>
  render(
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <MemoryRouter>
            <UserMenuDropdown />
          </MemoryRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>,
  );

describe("UserMenuDropdown Component", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem(
      "fastquiz_user",
      JSON.stringify({
        id: "usr-alex-1",
        name: "Alex Chen",
        email: "alex.chen@google.com",
        role: "user",
        tierTitle: "Google Engineer",
        streakDays: 6,
        xp: 350,
        avatarUrl: "/assets/avatar.png",
        isPro: true,
      }),
    );
    window.localStorage.setItem("fastquiz_access_token", "jwt-alex-token");
  });

  it("renders trigger button with user name and avatar", () => {
    renderDropdown();
    const trigger = screen.getByLabelText(/user account menu/i);
    expect(trigger).toBeDefined();
    expect(screen.getAllByText(/Alex Chen/i).length).toBeGreaterThan(0);
  });

  it("opens dropdown and reveals profile header and all menu items", () => {
    renderDropdown();
    const trigger = screen.getByLabelText(/user account menu/i);

    // Dropdown initially closed
    expect(screen.queryByText(/alex.chen@google.com/i)).toBeNull();

    // Click to open
    fireEvent.click(trigger);

    // Profile header info visible
    expect(screen.getByText(/alex.chen@google.com/i)).toBeDefined();
    expect(screen.getAllByText(/Google Engineer/i).length).toBeGreaterThan(0);

    // Menu options matching screenshot
    expect(screen.getByText(/Profile/i)).toBeDefined();
    expect(screen.getByText(/Notifications/i)).toBeDefined();
    expect(screen.getByText(/Account/i)).toBeDefined();
    expect(screen.getByText(/Troubleshooting/i)).toBeDefined();
    expect(screen.getByText(/Theme/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /log out/i })).toBeDefined();
  });

  it("opens troubleshooting diagnostics modal on click", () => {
    renderDropdown();
    const trigger = screen.getByLabelText(/user account menu/i);
    fireEvent.click(trigger);

    const troubleBtn = screen.getByText(/Troubleshooting/i);
    fireEvent.click(troubleBtn);

    // Diagnostics modal opens
    expect(screen.getByText(/Diagnostics & Troubleshooting/i)).toBeDefined();
    expect(screen.getByText(/Microservices Connectivity/i)).toBeDefined();
    expect(screen.getByText(/Auth Service/i)).toBeDefined();
  });

  it("toggles theme when clicking theme toggle in dropdown", () => {
    renderDropdown();
    const trigger = screen.getByLabelText(/user account menu/i);
    fireEvent.click(trigger);

    const themeSwitch = screen.getByRole("switch");
    const initialChecked = themeSwitch.getAttribute("aria-checked");

    fireEvent.click(themeSwitch);

    const updatedChecked = themeSwitch.getAttribute("aria-checked");
    expect(updatedChecked).not.toBe(initialChecked);
  });
});
