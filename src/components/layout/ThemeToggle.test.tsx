import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const { setTheme, useTheme } = vi.hoisted(() => ({
  setTheme: vi.fn(),
  useTheme: vi.fn(() => ({ theme: "dark", setTheme })),
}));
vi.mock("next-themes", () => ({ useTheme }));

import ThemeToggle from "./ThemeToggle";

beforeEach(() => vi.clearAllMocks());

describe("ThemeToggle", () => {
  it("switches to light mode when dark is active", async () => {
    useTheme.mockReturnValue({ theme: "dark", setTheme });
    const user = userEvent.setup();
    render(<ThemeToggle />);
    const btn = screen.getByRole("button", { name: "Switch to light mode" });
    await user.click(btn);
    expect(setTheme).toHaveBeenCalledWith("light");
  });

  it("switches to dark mode when light is active", async () => {
    useTheme.mockReturnValue({ theme: "light", setTheme });
    const user = userEvent.setup();
    render(<ThemeToggle />);
    const btn = screen.getByRole("button", { name: "Switch to dark mode" });
    await user.click(btn);
    expect(setTheme).toHaveBeenCalledWith("dark");
  });
});
