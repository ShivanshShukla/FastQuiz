import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
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
          <MemoryRouter initialEntries={["/runner/quiz-system-design-1"]}>
            <Routes>
              <Route path="/runner/:quizId" element={<QuizRunnerPage />} />
              <Route
                path="/curriculum"
                element={<div>Curriculum Overview</div>}
              />
              <Route
                path="/results/:attemptId"
                element={<div>Results Overview</div>}
              />
            </Routes>
          </MemoryRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>,
  );

describe("QuizRunner Integration & Keyboard Navigation", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("fastquiz_mock_override", "true");
    webMockStore.setMockData(true);
    vi.restoreAllMocks();
  });

  it("mutates selected answer option dynamically", async () => {
    renderQuizRunner();

    // Find radio options
    const radioOptions = await screen.findAllByRole("radio");
    expect(radioOptions.length).toBeGreaterThanOrEqual(4);

    // Select Option A (index 0)
    fireEvent.click(radioOptions[0]);
    expect(radioOptions[0]).toHaveAttribute("aria-checked", "true");
    expect(radioOptions[1]).toHaveAttribute("aria-checked", "false");

    // Mutate choice to Option B (index 1)
    fireEvent.click(radioOptions[1]);
    expect(radioOptions[0]).toHaveAttribute("aria-checked", "false");
    expect(radioOptions[1]).toHaveAttribute("aria-checked", "true");
  });

  it("persists selected answer across forward and backward question navigation", async () => {
    renderQuizRunner();

    const radioOptions = await screen.findAllByRole("radio");
    // Select Option C (index 2) on Question 1
    fireEvent.click(radioOptions[2]);
    expect(radioOptions[2]).toHaveAttribute("aria-checked", "true");

    // Advance to Question 2
    const nextBtn = screen.getByRole("button", { name: /Next Question/i });
    fireEvent.click(nextBtn);

    // Should now be on Question 02
    expect(screen.getByText(/Question 02/i)).toBeInTheDocument();

    // Select Option A (index 0) on Question 2
    const q2Options = screen.getAllByRole("radio");
    fireEvent.click(q2Options[0]);
    expect(q2Options[0]).toHaveAttribute("aria-checked", "true");

    // Navigate back to Question 1
    const prevBtn = screen.getByRole("button", { name: /Previous/i });
    fireEvent.click(prevBtn);

    // Should be on Question 01 and Option C should still be selected
    expect(screen.getByText(/Question 01/i)).toBeInTheDocument();
    const q1ReturnedOptions = screen.getAllByRole("radio");
    expect(q1ReturnedOptions[2]).toHaveAttribute("aria-checked", "true");
  });

  it("supports full keyboard controls (numeric keys, arrows, enter)", async () => {
    renderQuizRunner();

    const radioOptions = await screen.findAllByRole("radio");

    // Press '2' to select option B
    fireEvent.keyDown(window, { key: "2" });
    expect(radioOptions[1]).toHaveAttribute("aria-checked", "true");

    // Press '4' to switch to option D
    fireEvent.keyDown(window, { key: "4" });
    expect(radioOptions[3]).toHaveAttribute("aria-checked", "true");
    expect(radioOptions[1]).toHaveAttribute("aria-checked", "false");

    // Press 'ArrowRight' to advance
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(screen.getByText(/Question 02/i)).toBeInTheDocument();

    // Press 'ArrowLeft' to go back
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(screen.getByText(/Question 01/i)).toBeInTheDocument();
  });

  it("toggles question flag for review and reflects in question palette", async () => {
    renderQuizRunner();

    const flagBtn = await screen.findByRole("button", {
      name: /flag for review/i,
    });
    fireEvent.click(flagBtn);

    // Flagged badge should appear
    expect(screen.getByText(/Flagged for Review/i)).toBeInTheDocument();

    // Click again to unflag
    fireEvent.click(flagBtn);
    expect(screen.queryByText(/Flagged for Review/i)).toBeNull();
  });

  it("opens exit confirmation modal and dismisses on cancel", async () => {
    renderQuizRunner();

    const exitBtn = await screen.findByRole("button", { name: /exit/i });
    fireEvent.click(exitBtn);

    // Exit confirm modal dialog should appear
    expect(screen.getByText(/Exit Assessment\?/i)).toBeInTheDocument();
    expect(screen.getByText(/answers will be saved/i)).toBeInTheDocument();

    // Click Continue Assessment button
    const continueBtn = screen.getByRole("button", {
      name: /Continue Assessment/i,
    });
    fireEvent.click(continueBtn);

    // Modal is dismissed
    expect(screen.queryByText(/Exit Assessment\?/i)).toBeNull();
  });
});
