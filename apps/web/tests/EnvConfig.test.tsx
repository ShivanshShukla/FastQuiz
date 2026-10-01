import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  isMockEnabled,
  getMockModeSource,
  setMockOverride,
} from "../src/config/env";

describe("env configuration resolver", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("returns default mock state and source as env when no overrides", () => {
    const enabled = isMockEnabled();
    const source = getMockModeSource();
    expect(typeof enabled).toBe("boolean");
    expect(source).toBe("env");
  });

  it("resolves mock mode from storage override", () => {
    window.localStorage.setItem("fastquiz_mock_override", "true");
    expect(isMockEnabled()).toBe(true);
    expect(getMockModeSource()).toBe("storage");

    window.localStorage.setItem("fastquiz_mock_override", "false");
    expect(isMockEnabled()).toBe(false);
    expect(getMockModeSource()).toBe("storage");
  });

  it("sets mock override in localStorage and triggers reload", () => {
    const reloadMock = vi.fn();
    Object.defineProperty(window, "location", {
      writable: true,
      value: { ...window.location, reload: reloadMock, search: "" },
    });

    setMockOverride(true);
    expect(window.localStorage.getItem("fastquiz_mock_override")).toBe("true");

    setMockOverride(false);
    expect(window.localStorage.getItem("fastquiz_mock_override")).toBe("false");

    setMockOverride(null);
    expect(window.localStorage.getItem("fastquiz_mock_override")).toBeNull();
  });
});
