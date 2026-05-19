import { requireAdmin } from "@/lib/db/auth";
import { getAllTraits, getSubmissions } from "@/lib/db/queries";

export async function GET() {
  await requireAdmin();

  const [submissions, traits] = await Promise.all([
    getSubmissions({ limit: 10000 }),
    getAllTraits(),
  ]);

  const traitIds = traits.map((t) => t.id);
  const headers = ["id", "submitted_at", ...traitIds].join(",");
  const rows = submissions.map((s) => {
    const scores = s.scores as Record<string, number>;
    return [
      s.id,
      s.submitted_at,
      ...traitIds.map((id) => scores[id] ?? 0),
    ].join(",");
  });

  const csv = [headers, ...rows].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="typolog-results-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
