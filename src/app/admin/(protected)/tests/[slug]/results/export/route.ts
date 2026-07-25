import { requireAdmin } from "@/lib/db/auth";
import { getTest, getAllTraits, getSubmissions } from "@/lib/db/queries";
import { buildSubmissionsCsv } from "@/lib/export/csv";
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

  const csv = buildSubmissionsCsv(submissions, traits);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="typolog-${slug}-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
