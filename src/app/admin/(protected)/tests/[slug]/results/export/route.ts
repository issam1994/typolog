import { requireAdmin } from "@/lib/db/auth";
import { getTest, getAllTraits, getSubmissions } from "@/lib/db/queries";
import { notFound } from "next/navigation";

type Params = {
  params: Promise<{ slug: string }>;
};

export async function GET(_req: Request, { params }: Params) {
  await requireAdmin();
  const { slug } = await params;

  const test = await getTest(slug);
  if (!test) notFound();

  const [submissions, traits] = await Promise.all([
    getSubmissions({ limit: 10000, testId: test.id }),
    getAllTraits(test.id),
  ]);

  const traitSlugs = traits.map((t) => t.slug);
  const headers = ["id", "submitted_at", "archetype_code", ...traitSlugs].join(
    ",",
  );
  const rows = submissions.map((s) => {
    const sc = s.scores as Record<string, number>;
    return [
      s.id,
      s.submitted_at,
      s.archetype_code ?? "",
      ...traitSlugs.map((slug) => sc[slug] ?? 0),
    ].join(",");
  });

  const csv = [headers, ...rows].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="typolog-${slug}-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
