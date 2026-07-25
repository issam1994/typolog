import { describe, it, expect } from "vitest";
import { enneagramDominant } from "./enneagramDominant";
import { likertInput } from "@test/scoring";

describe("enneagramDominant", () => {
  it("returns the highest-scoring type with the type_ prefix stripped", () => {
    const { scores, archetypeCode } = enneagramDominant(
      likertInput([
        { slug: "type_1", answer: 2 },
        { slug: "type_8", answer: 5 },
        { slug: "type_5", answer: 3 },
      ]),
    );
    expect(scores.type_8).toBe(100);
    expect(archetypeCode).toBe("8");
  });

  it("returns null when there are no traits", () => {
    const { archetypeCode } = enneagramDominant(likertInput([]));
    expect(archetypeCode).toBeNull();
  });

  it("keeps a slug without the type_ prefix unchanged", () => {
    const { archetypeCode } = enneagramDominant(
      likertInput([{ slug: "reformer", answer: 5 }]),
    );
    expect(archetypeCode).toBe("reformer");
  });
});
