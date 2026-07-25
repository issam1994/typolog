import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import TestRecommendations from "./TestRecommendations";
import { saveResult } from "@/lib/results-storage";
import { makeTest } from "@test/fixtures";
import type { StoredResult } from "@/types/quiz";

const stored: StoredResult = {
  submissionId: "s1",
  scores: {},
  archetype: null,
  archetypeCode: null,
  submittedAt: "2026-01-01T00:00:00.000Z",
};

const tests = [
  makeTest({ slug: "mbti", name: "MBTI" }),
  makeTest({ slug: "enneagram", name: "Enneagram" }),
  makeTest({ slug: "big-five", name: "Big Five" }),
];

beforeEach(() => localStorage.clear());

describe("TestRecommendations", () => {
  it("suggests the tests the visitor has not completed yet", () => {
    render(<TestRecommendations currentSlug="mbti" allTests={tests} />);
    expect(screen.getByText("Explore More")).toBeInTheDocument();
    expect(screen.getByText("Enneagram")).toBeInTheDocument();
    expect(screen.getByText("Big Five")).toBeInTheDocument();
  });

  it("switches to 'Explore Again' once all others are complete", () => {
    saveResult("enneagram", stored);
    saveResult("big-five", stored);
    render(<TestRecommendations currentSlug="mbti" allTests={tests} />);
    expect(screen.getByText("Explore Again")).toBeInTheDocument();
  });

  it("renders nothing when there are no other tests", () => {
    const { container } = render(
      <TestRecommendations currentSlug="mbti" allTests={[tests[0]]} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
