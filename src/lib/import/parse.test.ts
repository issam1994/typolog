import { describe, it, expect } from "vitest";
import {
  splitCSVLine,
  parseCSVRows,
  normalizeFromCSV,
  normalizeFromJSON,
  type ImportError,
  type JSONRow,
} from "./parse";

const traitBySlug = new Map([
  ["curiosity", "trait_c"],
  ["order", "trait_o"],
]);

describe("splitCSVLine", () => {
  it("splits plain comma-separated values", () => {
    expect(splitCSVLine("a,b,c")).toEqual(["a", "b", "c"]);
  });
  it("keeps commas inside quoted fields", () => {
    expect(splitCSVLine('a,"b,c",d')).toEqual(["a", "b,c", "d"]);
  });
  it("preserves empty trailing/leading cells", () => {
    expect(splitCSVLine("a,,c")).toEqual(["a", "", "c"]);
    expect(splitCSVLine(",b")).toEqual(["", "b"]);
  });
});

describe("parseCSVRows", () => {
  it("returns [] when there is no data row", () => {
    expect(parseCSVRows("kind,text")).toEqual([]);
    expect(parseCSVRows("")).toEqual([]);
  });
  it("maps header columns onto each row and trims cells", () => {
    const rows = parseCSVRows("kind,text\r\nlikert, Hi \n");
    expect(rows).toEqual([{ kind: "likert", text: "Hi" }]);
  });
});

describe("normalizeFromCSV", () => {
  it("normalizes a valid likert row", () => {
    const errors: ImportError[] = [];
    const out = normalizeFromCSV(
      [
        {
          kind: "likert",
          text: "Q1",
          trait_slug: "curiosity",
          reverse_keyed: "true",
        },
      ],
      traitBySlug,
      errors,
    );
    expect(errors).toEqual([]);
    expect(out).toEqual([
      { kind: "likert", text: "Q1", traitId: "trait_c", reverseKeyed: true },
    ]);
  });

  it("normalizes a valid forced_choice row", () => {
    const errors: ImportError[] = [];
    const out = normalizeFromCSV(
      [
        {
          kind: "forced_choice",
          text: "Q2",
          option_0_label: "A",
          option_0_trait_slug: "curiosity",
          option_1_label: "B",
          option_1_trait_slug: "order",
        },
      ],
      traitBySlug,
      errors,
    );
    expect(errors).toEqual([]);
    expect(out[0]).toEqual({
      kind: "forced_choice",
      text: "Q2",
      options: [
        { label: "A", traitId: "trait_c" },
        { label: "B", traitId: "trait_o" },
      ],
    });
  });

  it("reports missing text with a header-adjusted 1-indexed row number", () => {
    const errors: ImportError[] = [];
    normalizeFromCSV([{ kind: "likert", text: "" }], traitBySlug, errors);
    expect(errors).toEqual([{ row: 2, message: "Missing text" }]);
  });

  it("reports an unknown trait slug", () => {
    const errors: ImportError[] = [];
    normalizeFromCSV(
      [{ kind: "likert", text: "Q", trait_slug: "ghost" }],
      traitBySlug,
      errors,
    );
    expect(errors[0].message).toContain('Unknown trait_slug "ghost"');
  });

  it("reports an unknown kind", () => {
    const errors: ImportError[] = [];
    normalizeFromCSV([{ kind: "essay", text: "Q" }], traitBySlug, errors);
    expect(errors[0].message).toBe('Unknown kind "essay"');
  });
});

describe("normalizeFromJSON", () => {
  it("normalizes likert and forced_choice rows", () => {
    const errors: ImportError[] = [];
    const rows: JSONRow[] = [
      {
        kind: "likert",
        text: "Q1",
        trait_slug: "curiosity",
        reverse_keyed: true,
      },
      {
        kind: "forced_choice",
        text: "Q2",
        options: [
          { label: "A", trait_slug: "curiosity" },
          { label: "B", trait_slug: "order" },
        ],
      },
    ];
    const out = normalizeFromJSON(rows, traitBySlug, errors);
    expect(errors).toEqual([]);
    expect(out).toHaveLength(2);
    expect(out[0]).toMatchObject({ kind: "likert", traitId: "trait_c" });
  });

  it("requires 2 options for forced_choice", () => {
    const errors: ImportError[] = [];
    normalizeFromJSON(
      [
        {
          kind: "forced_choice",
          text: "Q",
          options: [{ label: "A", trait_slug: "curiosity" }],
        },
      ],
      traitBySlug,
      errors,
    );
    expect(errors).toEqual([
      { row: 1, message: "forced_choice needs 2 options" },
    ]);
  });

  it("uses plain 1-indexed row numbers (no header offset)", () => {
    const errors: ImportError[] = [];
    normalizeFromJSON([{ kind: "likert", text: "" }], traitBySlug, errors);
    expect(errors).toEqual([{ row: 1, message: "Missing text" }]);
  });
});
