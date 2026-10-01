import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QuizRunnerPage } from "../src/pages/QuizRunnerPage";
import { ThemeProvider } from "../src/context/ThemeContext";
import { AuthProvider } from "../src/context/AuthContext";
import { ToastProvider } from "../src/context/ToastContext";
import { webMockStore } from "../src/services/webMockStore";

const renderQuizRunner = () =>
  render(
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <QuizRunnerPage />
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>,
  );

describe("QuizRunnerPage - Production Fallback (mock=false)", () => {
  beforeEach(() => {
    window.localStorage.clear();
    webMockStore.setMockData(false);
  });

  it("renders Assessment Not Available fallback when mock data is disabled", () => {
    renderQuizRunner();

    expect(screen.getByText(/Assessment Not Available/i)).toBeDefined();
    expect(screen.getByText(/mock mode is currently inactive/i)).toBeDefined();
    expect(
      screen.getByRole("link", { name: /Return to Curriculum/i }),
    ).toBeDefined();
  });
});

describe("QuizRunnerPage - Mock Mode Enabled (mock=true)", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem("fastquiz_mock_override", "true");
    webMockStore.setMockData(true);
  });

  it("renders question slate and options", () => {
    renderQuizRunner();

    // Verify Question 01 header and options
    expect(screen.getByText(/Question 01/i)).toBeDefined();
    expect(screen.getByText(/Cache Stampede/i)).toBeDefined();
    expect(screen.getByText(/Live Session Telemetry/i)).toBeDefined();
    expect(screen.getByText(/Question Palette/i)).toBeDefined();
  });

  it("selects option on click and marks current selection", () => {
    renderQuizRunner();

    // Option B: Probabilistic early expiration
    const optionB = screen.getByText(/probabilistic early expiration/i);
    fireEvent.click(optionB);

    expect(screen.getByText(/Current Selection/i)).toBeDefined();
  });

  it("toggles flag for review button", () => {
    renderQuizRunner();

    const flagBtn = screen.getByText(/Flag for Review/i);
    fireEvent.click(flagBtn);

    expect(screen.getByText(/Flagged for Review/i)).toBeDefined();
  });
});
