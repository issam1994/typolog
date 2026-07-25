import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import type { StoredResult } from "@/types/quiz";

const { useStoredResult, replace } = vi.hoisted(() => ({
  useStoredResult: vi.fn(),
  replace: vi.fn(),
}));
vi.mock("@/lib/use-stored-results", () => ({ useStoredResult }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));

import ResultsFallback from "./ResultsFallback";

beforeEach(() => vi.clearAllMocks());

describe("ResultsFallback", () => {
  it("redirects to the submission URL when a stored result exists", async () => {
    const stored: StoredResult = {
      submissionId: "s1",
      scores: {},
      archetype: null,
      archetypeCode: null,
      submittedAt: "2026-01-01T00:00:00.000Z",
    };
    useStoredResult.mockReturnValue(stored);
    render(<ResultsFallback testSlug="mbti" />);
    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith("/tests/mbti/results?submission=s1"),
    );
  });

  it("shows the empty state and does not redirect when nothing is stored", () => {
    useStoredResult.mockReturnValue(null);
    render(<ResultsFallback testSlug="mbti" />);
    expect(screen.getByText(/no results found/i)).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });
});
