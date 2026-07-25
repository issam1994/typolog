import { describe, it, expect } from "vitest";
import { psychosophyStack } from "./psychosophyStack";
import { likertInput } from "@test/scoring";

describe("psychosophyStack", () => {
  it("orders all 4 traits by score into an uppercased code", () => {
    const { archetypeCode } = psychosophyStack(
      likertInput([
        { slug: "v", answer: 5 },
        { slug: "l", answer: 4 },
        { slug: "e", answer: 3 },
        { slug: "f", answer: 2 },
      ]),
    );
    expect(archetypeCode).toBe("VLEF");
  });

  it("reflects a different ranking in the code", () => {
    const { archetypeCode } = psychosophyStack(
      likertInput([
        { slug: "v", answer: 1 },
        { slug: "l", answer: 2 },
        { slug: "e", answer: 5 },
        { slug: "f", answer: 4 },
      ]),
    );
    expect(archetypeCode).toBe("EFLV");
  });

  it("returns null when there are not exactly 4 traits", () => {
    const { archetypeCode } = psychosophyStack(
      likertInput([
        { slug: "v", answer: 5 },
        { slug: "l", answer: 4 },
        { slug: "e", answer: 3 },
      ]),
    );
    expect(archetypeCode).toBeNull();
  });
});
