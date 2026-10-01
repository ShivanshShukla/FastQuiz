import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrandLogo } from "../src/components/Common/BrandLogo";

describe("BrandLogo Component", () => {
  it("renders with default props (md, showBadge=true)", () => {
    const { container } = render(<BrandLogo />);
    expect(screen.getByText("FastQuiz")).toBeInTheDocument();
    expect(screen.getByText("PRO")).toBeInTheDocument();
    const img = container.querySelector("img");
    expect(img).toBeInTheDocument();
    expect(img).toHaveClass("w-7", "h-7");
  });

  it("renders with small and large sizes without badge", () => {
    const { rerender, container } = render(
      <BrandLogo size="sm" showBadge={false} />,
    );
    expect(screen.queryByText("PRO")).toBeNull();
    let img = container.querySelector("img");
    expect(img).toHaveClass("w-6", "h-6");

    rerender(
      <BrandLogo size="lg" showBadge={false} className="custom-class" />,
    );
    img = container.querySelector("img");
    expect(img).toHaveClass("w-9", "h-9");
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("falls back to SVG emblem when image loading fails", () => {
    const { container } = render(<BrandLogo size="md" />);
    const img = container.querySelector("img");
    expect(img).toBeInTheDocument();

    if (img) {
      fireEvent.error(img);
    }

    expect(container.querySelector("img")).toBeNull();
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });
});
