import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import type { StoredResult } from "@/types/quiz";
import { makeTest, makeTrait } from "@test/fixtures";

const { useStoredResult } = vi.hoisted(() => ({ useStoredResult: vi.fn() }));
vi.mock("@/lib/use-stored-results", () => ({ useStoredResult }));

import ResultsFromLocalStorage from "./ResultsFromLocalStorage";

const test = makeTest({ result_template: "bars", slug: "mbti" });
const traits = [
  makeTrait({ id: "a", slug: "a", label: "Alpha", description: "d" }),
];

beforeEach(() => vi.clearAllMocks());

describe("ResultsFromLocalStorage", () => {
  it("prompts to take the test when nothing is stored", () => {
    useStoredResult.mockReturnValue(null);
    render(
      <ResultsFromLocalStorage testSlug="mbti" test={test} traits={traits} />,
    );
    expect(screen.getByText(/no results found/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Take the Test" })).toHaveAttribute(
      "href",
      "/tests/mbti/quiz",
    );
  });

  it("renders the stored result via the display template", () => {
    const stored: StoredResult = {
      submissionId: "s1",
      scores: { a: 80 },
      archetype: null,
      archetypeCode: null,
      submittedAt: "2026-01-01T00:00:00.000Z",
    };
    useStoredResult.mockReturnValue(stored);
    render(
      <ResultsFromLocalStorage testSlug="mbti" test={test} traits={traits} />,
    );
    expect(screen.getByText("Your Results")).toBeInTheDocument();
    expect(screen.getByText("80%")).toBeInTheDocument();
  });
});
