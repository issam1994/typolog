import { describe, it, expect } from "vitest";
import { buildSubmissionsCsv } from "./csv";
import { makeSubmission, makeTrait } from "@test/fixtures";

const traits = [makeTrait({ slug: "curiosity" }), makeTrait({ slug: "order" })];

describe("buildSubmissionsCsv", () => {
  it("emits a header with one column per trait", () => {
    const csv = buildSubmissionsCsv([], traits);
    expect(csv).toBe("id,submitted_at,archetype_code,curiosity,order");
  });

  it("emits a row per submission with scores in trait order", () => {
    const csv = buildSubmissionsCsv(
      [
        makeSubmission({
          id: "s1",
          submitted_at: "2026-01-01T00:00:00.000Z",
          archetype_code: "INTJ",
          scores: { curiosity: 80, order: 20 },
        }),
      ],
      traits,
    );
    const [, row] = csv.split("\n");
    expect(row).toBe("s1,2026-01-01T00:00:00.000Z,INTJ,80,20");
  });

  it("defaults a missing trait score to 0 and a null code to empty", () => {
    const csv = buildSubmissionsCsv(
      [
        makeSubmission({
          id: "s2",
          submitted_at: "2026-01-02T00:00:00.000Z",
          archetype_code: null,
          scores: { curiosity: 55 },
        }),
      ],
      traits,
    );
    const row = csv.split("\n")[1];
    expect(row).toBe("s2,2026-01-02T00:00:00.000Z,,55,0");
  });
});
