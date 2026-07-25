import type { Submission, Trait } from "@/types/quiz";

// Pure CSV builder for the results export route. Extracted so the header/row
// formatting can be unit-tested without an HTTP request.

/** Build a submissions CSV: id, submitted_at, archetype_code, then one column per trait score. */
export function buildSubmissionsCsv(
  submissions: Submission[],
  traits: Trait[],
): string {
  const traitSlugs = traits.map((t) => t.slug);
  const headers = ["id", "submitted_at", "archetype_code", ...traitSlugs].join(
    ",",
  );
  const rows = submissions.map((s) => {
    const sc = s.scores;
    return [
      s.id,
      s.submitted_at,
      s.archetype_code ?? "",
      ...traitSlugs.map((slug) => sc[slug] ?? 0),
    ].join(",");
  });
  return [headers, ...rows].join("\n");
}
