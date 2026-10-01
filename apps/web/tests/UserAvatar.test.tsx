import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UserAvatar } from "../src/components/Common/UserAvatar";

describe("UserAvatar Component", () => {
  it("renders custom image src when not hosted on googleusercontent", () => {
    render(
      <UserAvatar
        src="https://cdn.example.com/photo.jpg"
        name="Alice Smith"
        size="sm"
      />,
    );
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "https://cdn.example.com/photo.jpg");
    expect(img).toHaveAttribute("alt", "Alice Smith's profile avatar");
  });

  it("filters out googleusercontent host to prevent tracking/mixed content and uses fallback", () => {
    render(
      <UserAvatar
        src="https://lh3.googleusercontent.com/a/ACg8ocK12345"
        name="Bob Jones"
        size="lg"
      />,
    );
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "/assets/avatar.png");
  });

  it("handles malformed src URL gracefully", () => {
    render(<UserAvatar src="not-a-valid-url" name="Charlie Brown" />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "not-a-valid-url");
  });

  it("falls back to initials when image loading fails", () => {
    render(
      <UserAvatar
        src="https://broken.link/avatar.png"
        name="David Miller"
        size="md"
      />,
    );
    const img = screen.getByRole("img");
    fireEvent.error(img);

    expect(screen.queryByRole("img")).toBeNull();
    const initialsDiv = screen.getByLabelText("David Miller");
    expect(initialsDiv).toHaveTextContent("DM");
  });

  it("handles single-word or fallback names when generating initials on error", () => {
    const { unmount } = render(<UserAvatar src="broken" name="SingleName" />);
    fireEvent.error(screen.getByRole("img"));
    expect(screen.getByLabelText("SingleName")).toHaveTextContent("S");
    unmount();

    render(<UserAvatar src="broken" name="" />);
    fireEvent.error(screen.getByRole("img"));
    expect(screen.getByText("U")).toBeInTheDocument();
  });
});
