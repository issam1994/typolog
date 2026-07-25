import { describe, it, expect } from "vitest";
import { cognitiveStack } from "./cognitiveStack";
import { likertInput } from "@test/scoring";

describe("cognitiveStack", () => {
  it("builds a 4-function code from the top scorers, capitalized", () => {
    const { scores, archetypeCode } = cognitiveStack(
      likertInput([
        { slug: "ni", answer: 5 }, // 100
        { slug: "te", answer: 4 }, // 80
        { slug: "fi", answer: 3 }, // 60
        { slug: "se", answer: 2 }, // 40
        { slug: "ne", answer: 1 }, // 20
        { slug: "si", answer: 1 },
        { slug: "ti", answer: 1 },
        { slug: "fe", answer: 1 },
      ]),
    );
    expect(scores.ni).toBe(100);
    expect(scores.se).toBe(40);
    expect(archetypeCode).toBe("NiTeFiSe");
  });

  it("returns null when there are fewer than 4 traits", () => {
    const { archetypeCode } = cognitiveStack(
      likertInput([
        { slug: "ni", answer: 5 },
        { slug: "te", answer: 4 },
        { slug: "fi", answer: 3 },
      ]),
    );
    expect(archetypeCode).toBeNull();
  });

  it("scores all functions 0 with no answers but still yields a code", () => {
    const { scores, archetypeCode } = cognitiveStack(
      likertInput([
        { slug: "ni" },
        { slug: "ne" },
        { slug: "si" },
        { slug: "se" },
      ]),
    );
    expect(Object.values(scores)).toEqual([0, 0, 0, 0]);
    expect(archetypeCode).toBe("NiNeSiSe");
  });
});
