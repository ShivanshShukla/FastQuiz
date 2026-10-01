import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "../src/context/AuthContext";
import { ToastProvider } from "../src/context/ToastContext";
import { ReviewDetailPage } from "../src/pages/ReviewDetailPage";

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { loginDemoAdmin } = useAuth();
  React.useEffect(() => {
    loginDemoAdmin();
  }, [loginDemoAdmin]);
  return <>{children}</>;
};

describe("ReviewDetailPage", () => {
  const renderDetail = (questionId = "q-mod-1") => {
    return render(
      <MemoryRouter initialEntries={[`/review/${questionId}`]}>
        <ToastProvider>
          <AuthProvider>
            <TestWrapper>
              <Routes>
                <Route
                  path="/review/:questionId"
                  element={<ReviewDetailPage />}
                />
                <Route
                  path="/review"
                  element={<div>Navigated Back To Queue</div>}
                />
              </Routes>
            </TestWrapper>
          </AuthProvider>
        </ToastProvider>
      </MemoryRouter>,
    );
  };

  it("renders question content, options, and explanation", async () => {
    renderDetail();

    await waitFor(() => {
      expect(
        screen.getByText(
          /What is the minimum time complexity to determine if an array/i,
        ),
      ).toBeInTheDocument();
    });

    expect(screen.getByText("O(N^2)")).toBeInTheDocument();
    expect(screen.getByText("O(N)")).toBeInTheDocument();
    expect(screen.getByText("Correct Option")).toBeInTheDocument();
    expect(
      screen.getByText(/Using two pointers starting at opposite ends/i),
    ).toBeInTheDocument();
  });

  it("triggers approve action when clicking Approve & Publish", async () => {
    renderDetail();

    await waitFor(() => {
      expect(screen.getByText(/Approve & Publish/i)).toBeInTheDocument();
    });

    const approveButton = screen.getByRole("button", {
      name: /Approve & Publish/i,
    });
    fireEvent.click(approveButton);

    await waitFor(() => {
      expect(screen.getByText("Navigated Back To Queue")).toBeInTheDocument();
    });
  });

  it("requires a reason when rejecting a question", async () => {
    renderDetail();

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /^Reject/i }),
      ).toBeInTheDocument();
    });

    // Click Reject
    fireEvent.click(screen.getByRole("button", { name: /^Reject/i }));

    // Modal appears
    expect(
      screen.getByText("Reject Question Confirmation"),
    ).toBeInTheDocument();

    // Click Confirm without reason
    fireEvent.click(screen.getByRole("button", { name: /Confirm Rejection/i }));

    expect(
      screen.getByText(/A rejection reason is required/i),
    ).toBeInTheDocument();

    // Select a quick tag
    fireEvent.click(screen.getByText(/\+ Incorrect Answer Key/i));

    // Confirm rejection
    fireEvent.click(screen.getByRole("button", { name: /Confirm Rejection/i }));

    await waitFor(() => {
      expect(screen.getByText("Navigated Back To Queue")).toBeInTheDocument();
    });
  });

  it("responds to keyboard shortcut A for approve", async () => {
    renderDetail();

    await waitFor(() => {
      expect(screen.getByText(/Approve & Publish/i)).toBeInTheDocument();
    });

    // Press 'A' key
    fireEvent.keyDown(window, { key: "a" });

    await waitFor(() => {
      expect(screen.getByText("Navigated Back To Queue")).toBeInTheDocument();
    });
  });

  it("responds to keyboard shortcut R for opening reject modal", async () => {
    renderDetail();

    await waitFor(() => {
      expect(screen.getByText(/Approve & Publish/i)).toBeInTheDocument();
    });

    // Press 'R' key
    fireEvent.keyDown(window, { key: "r" });

    expect(
      screen.getByText("Reject Question Confirmation"),
    ).toBeInTheDocument();
  });
});
