import Link from "next/link";
import { notFound } from "next/navigation";
import { getTest, getAllTraits, getSubmissions } from "@/lib/db/queries";
import { requireAdmin } from "@/lib/db/auth";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ before?: string }>;
};

export async function generateMetadata() {
  return { title: `Results — Typolog Admin` };
}

export default async function TestResultsPage({ params, searchParams }: Props) {
  await requireAdmin();
  const { slug } = await params;
  const { before } = await searchParams;

  const test = await getTest(slug);
  if (!test) notFound();

  const [submissions, traits] = await Promise.all([
    getSubmissions({ before, limit: 50, testId: test.id }),
    getAllTraits(test.id),
  ]);

  const older =
    submissions.length === 50
      ? submissions[submissions.length - 1].submitted_at
      : null;

  return (
    <div className="px-8 py-8 max-w-5xl mx-auto">
      <div className="flex items-baseline justify-between mb-8">
        <h1 className="text-xl font-semibold tracking-tight">Results</h1>
        <a
          href={`/admin/tests/${slug}/results/export`}
          download
          className="text-xs text-muted hover:text-foreground transition-colors"
        >
          Export CSV
        </a>
      </div>

      {submissions.length === 0 ? (
        <p className="text-sm text-muted py-8">No submissions yet.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-6 text-xs text-muted tracking-widest uppercase font-normal">
                    Date
                  </th>
                  {traits.map((t) => (
                    <th
                      key={t.id}
                      className="text-left py-2 pr-4 text-xs text-muted tracking-widest uppercase font-normal"
                      title={t.label}
                    >
                      {t.slug.toUpperCase()}
                    </th>
                  ))}
                  <th className="text-left py-2 pr-4 text-xs text-muted tracking-widest uppercase font-normal">
                    Type
                  </th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {submissions.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-border/50 hover:bg-accent/30 transition-colors"
                  >
                    <td className="py-3 pr-6 text-foreground/70 whitespace-nowrap">
                      {new Date(s.submitted_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                      <span className="text-muted ml-2 text-xs">
                        {new Date(s.submitted_at).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </td>
                    {traits.map((t) => (
                      <td key={t.id} className="py-3 pr-4 text-foreground/70">
                        {(s.scores as Record<string, number>)[t.slug] ?? "—"}%
                      </td>
                    ))}
                    <td className="py-3 pr-4 text-foreground/70 text-xs">
                      {s.archetype_code ?? "—"}
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        href={`/admin/tests/${slug}/results/${s.id}`}
                        className="text-xs text-muted hover:text-foreground transition-colors"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {older && (
            <div className="mt-6 text-center">
              <Link
                href={`/admin/tests/${slug}/results?before=${encodeURIComponent(older)}`}
                className="text-xs text-muted hover:text-foreground transition-colors"
              >
                Load older →
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
