// Pure parsing/normalization for bulk question import (CSV + JSON).
// Kept free of I/O so it can be unit-tested directly; the route handler
// (src/app/admin/(protected)/tests/[slug]/questions/import/route.ts) wires it
// up to the request, trait lookup, and `createQuestion`.

export type ImportError = { row: number; message: string };

export type NormalizedQuestion =
  | { kind: "likert"; text: string; traitId: string; reverseKeyed: boolean }
  | {
      kind: "forced_choice";
      text: string;
      options: [
        { label: string; traitId: string },
        { label: string; traitId: string },
      ];
    };

export type JSONRow = {
  kind: string;
  text: string;
  trait_slug?: string;
  reverse_keyed?: boolean;
  options?: { label: string; trait_slug: string }[];
};

/** Split one CSV line, honoring double-quoted fields that contain commas. */
export function splitCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

/** Parse CSV text into row objects keyed by the header row. */
export function parseCSVRows(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = splitCSVLine(lines[0]).map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const values = splitCSVLine(line);
    return Object.fromEntries(
      headers.map((h, i) => [h, (values[i] ?? "").trim()]),
    );
  });
}

/** Validate + normalize CSV rows into questions, collecting per-row errors. */
export function normalizeFromCSV(
  rows: Record<string, string>[],
  traitBySlug: Map<string, string>,
  errors: ImportError[],
): NormalizedQuestion[] {
  const questions: NormalizedQuestion[] = [];
  rows.forEach((row, i) => {
    const rowNum = i + 2; // 1-indexed, account for header
    const kind = row["kind"]?.trim();
    const text = row["text"]?.trim();
    if (!text) {
      errors.push({ row: rowNum, message: "Missing text" });
      return;
    }
    if (kind === "likert") {
      const traitSlug = row["trait_slug"]?.trim();
      const traitId = traitBySlug.get(traitSlug);
      if (!traitId) {
        errors.push({
          row: rowNum,
          message: `Unknown trait_slug "${traitSlug}"`,
        });
        return;
      }
      questions.push({
        kind: "likert",
        text,
        traitId,
        reverseKeyed: row["reverse_keyed"]?.trim().toLowerCase() === "true",
      });
    } else if (kind === "forced_choice") {
      const o0Label = row["option_0_label"]?.trim();
      const o0Slug = row["option_0_trait_slug"]?.trim();
      const o1Label = row["option_1_label"]?.trim();
      const o1Slug = row["option_1_trait_slug"]?.trim();
      if (!o0Label || !o1Label) {
        errors.push({ row: rowNum, message: "Missing option labels" });
        return;
      }
      const o0TraitId = traitBySlug.get(o0Slug);
      const o1TraitId = traitBySlug.get(o1Slug);
      if (!o0TraitId) {
        errors.push({
          row: rowNum,
          message: `Unknown option_0_trait_slug "${o0Slug}"`,
        });
        return;
      }
      if (!o1TraitId) {
        errors.push({
          row: rowNum,
          message: `Unknown option_1_trait_slug "${o1Slug}"`,
        });
        return;
      }
      questions.push({
        kind: "forced_choice",
        text,
        options: [
          { label: o0Label, traitId: o0TraitId },
          { label: o1Label, traitId: o1TraitId },
        ],
      });
    } else {
      errors.push({ row: rowNum, message: `Unknown kind "${kind}"` });
    }
  });
  return questions;
}

/** Validate + normalize JSON rows into questions, collecting per-row errors. */
export function normalizeFromJSON(
  rows: JSONRow[],
  traitBySlug: Map<string, string>,
  errors: ImportError[],
): NormalizedQuestion[] {
  const questions: NormalizedQuestion[] = [];
  rows.forEach((row, i) => {
    const rowNum = i + 1;
    const { kind, text } = row;
    if (!text?.trim()) {
      errors.push({ row: rowNum, message: "Missing text" });
      return;
    }
    if (kind === "likert") {
      const traitId = traitBySlug.get(row.trait_slug ?? "");
      if (!traitId) {
        errors.push({
          row: rowNum,
          message: `Unknown trait_slug "${row.trait_slug}"`,
        });
        return;
      }
      questions.push({
        kind: "likert",
        text: text.trim(),
        traitId,
        reverseKeyed: row.reverse_keyed ?? false,
      });
    } else if (kind === "forced_choice") {
      const opts = row.options;
      if (!Array.isArray(opts) || opts.length < 2) {
        errors.push({ row: rowNum, message: "forced_choice needs 2 options" });
        return;
      }
      const o0TraitId = traitBySlug.get(opts[0].trait_slug ?? "");
      const o1TraitId = traitBySlug.get(opts[1].trait_slug ?? "");
      if (!o0TraitId) {
        errors.push({
          row: rowNum,
          message: `Unknown options[0].trait_slug "${opts[0].trait_slug}"`,
        });
        return;
      }
      if (!o1TraitId) {
        errors.push({
          row: rowNum,
          message: `Unknown options[1].trait_slug "${opts[1].trait_slug}"`,
        });
        return;
      }
      questions.push({
        kind: "forced_choice",
        text: text.trim(),
        options: [
          { label: opts[0].label, traitId: o0TraitId },
          { label: opts[1].label, traitId: o1TraitId },
        ],
      });
    } else {
      errors.push({ row: rowNum, message: `Unknown kind "${kind}"` });
    }
  });
  return questions;
}
