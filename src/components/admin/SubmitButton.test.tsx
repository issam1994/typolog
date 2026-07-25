import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const { useFormStatus } = vi.hoisted(() => ({
  useFormStatus: vi.fn(() => ({ pending: false })),
}));
vi.mock("react-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-dom")>();
  return { ...actual, useFormStatus };
});

import { SubmitButton } from "./SubmitButton";

beforeEach(() => vi.clearAllMocks());

describe("SubmitButton", () => {
  it("shows its children and is enabled when idle", () => {
    useFormStatus.mockReturnValue({ pending: false });
    render(<SubmitButton pendingLabel="Saving…">Save</SubmitButton>);
    const btn = screen.getByRole("button");
    expect(btn).toHaveTextContent("Save");
    expect(btn).toBeEnabled();
  });

  it("shows the pending label and disables while submitting", () => {
    useFormStatus.mockReturnValue({ pending: true });
    render(<SubmitButton pendingLabel="Saving…">Save</SubmitButton>);
    const btn = screen.getByRole("button");
    expect(btn).toHaveTextContent("Saving…");
    expect(btn).toBeDisabled();
  });
});
