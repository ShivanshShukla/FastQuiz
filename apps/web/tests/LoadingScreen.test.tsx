import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { LoadingScreen } from "../src/components/Common/LoadingScreen";

describe("LoadingScreen Component", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders default calibration text and progress bar", () => {
    render(
      <MemoryRouter>
        <LoadingScreen />
      </MemoryRouter>,
    );

    expect(screen.getByRole("status")).toBeDefined();
    expect(screen.getByText(/SESSION RUNTIME • INITIALIZING/i)).toBeDefined();
    expect(
      screen.getByText(/Calibrating proctored diagnostic runtime/i),
    ).toBeDefined();
    expect(
      screen.getByText(/Connecting to low-latency assessment cluster/i),
    ).toBeDefined();
    expect(screen.getByText(/Diagnostics/i)).toBeDefined();
  });

  it("renders custom message and subtext when provided", () => {
    render(
      <MemoryRouter>
        <LoadingScreen
          message="Provisioning isolated Redis 7 cluster..."
          subtext="Allocating 512MB memory ceiling"
        />
      </MemoryRouter>,
    );

    expect(
      screen.getByText(/Provisioning isolated Redis 7 cluster/i),
    ).toBeDefined();
    expect(screen.getByText(/Allocating 512MB memory ceiling/i)).toBeDefined();
  });

  it("triggers taking longer than expected card after timeoutSeconds and handles retry", () => {
    const onRetryMock = vi.fn();
    const onCancelMock = vi.fn();

    render(
      <MemoryRouter>
        <LoadingScreen
          timeoutSeconds={3}
          onRetry={onRetryMock}
          onCancel={onCancelMock}
        />
      </MemoryRouter>,
    );

    // Initially taking longer card is NOT visible
    expect(screen.queryByText(/This is taking longer than usual/i)).toBeNull();

    // Advance timers by 3 seconds
    act(() => {
      vi.advanceTimersByTime(3100);
    });

    // Now taking longer card is visible
    expect(screen.getByText(/This is taking longer than usual/i)).toBeDefined();
    expect(
      screen.getByText(/The assessment server handshake is delayed/i),
    ).toBeDefined();

    // Click Cancel
    const cancelBtn = screen.getByRole("button", { name: /Cancel/i });
    fireEvent.click(cancelBtn);
    expect(onCancelMock).toHaveBeenCalledTimes(1);

    // Click Retry Handshake
    const retryBtn = screen.getByRole("button", { name: /Retry Handshake/i });
    fireEvent.click(retryBtn);
    expect(onRetryMock).toHaveBeenCalledTimes(1);

    // After retry, taking longer card resets
    expect(screen.queryByText(/This is taking longer than usual/i)).toBeNull();
  });

  it("renders inline non-fullscreen mode cleanly", () => {
    const { container } = render(
      <MemoryRouter>
        <LoadingScreen fullscreen={false} />
      </MemoryRouter>,
    );

    const rootElement = container.querySelector('[role="status"]');
    expect(rootElement?.className).toContain("w-full");
    expect(rootElement?.className).not.toContain("fixed inset-0");
  });
});
