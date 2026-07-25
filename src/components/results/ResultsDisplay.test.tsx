import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ResultsDisplay from "./ResultsDisplay";
import type { ResultTemplateProps } from "./templates";
import { makeArchetype, makeTest, makeTrait } from "@test/fixtures";

const baseProps = (
  overrides: Partial<ResultTemplateProps> = {},
): ResultTemplateProps => ({
  test: makeTest({ result_template: "bars", slug: "mbti" }),
  traits: [makeTrait({ id: "a", slug: "a", label: "Alpha", description: "d" })],
  scores: { a: 80 },
  archetype: null,
  archetypeCode: null,
  ...overrides,
});

describe("ResultsDisplay", () => {
  it("renders the bars template with each trait score", () => {
    render(<ResultsDisplay {...baseProps()} />);
    expect(screen.getByText("Your Results")).toBeInTheDocument();
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("80%")).toBeInTheDocument();
  });

  it("selects a different template from test.result_template", () => {
    render(
      <ResultsDisplay
        {...baseProps({
          test: makeTest({ result_template: "mbti_code", slug: "mbti" }),
          traits: [
            makeTrait({
              id: "e",
              slug: "e",
              label: "Extraversion",
              polarity: "i",
            }),
            makeTrait({
              id: "i",
              slug: "i",
              label: "Introversion",
              polarity: "e",
            }),
          ],
          scores: { e: 60, i: 40 },
          archetype: makeArchetype({ code: "INTJ", label: "The Architect" }),
          archetypeCode: "INTJ",
        })}
      />,
    );
    // The MBTI template surfaces the code, which the bars template never does.
    expect(screen.getByText("INTJ")).toBeInTheDocument();
    expect(screen.queryByText("Your Results")).not.toBeInTheDocument();
  });
});
