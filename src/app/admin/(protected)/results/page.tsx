import Link from "next/link";
import { getSubmissions, getAllTraits } from "@/lib/db/queries";
import { requireAdmin } from "@/lib/db/auth";

export const metadata = { title: "Results — Typolog Admin" };

type Props = {
  searchParams: Promise<{ before?: string }>;
};

export default async function ResultsPage({ searchParams }: Props) {
  await requireAdmin();
  const { before } = await searchParams;

  const [submissions, traits] = await Promise.all([
    getSubmissions({ before, limit: 50 }),
    getAllTraits(),
  ]);

  const older =
    submissions.length === 50
      ? submissions[submissions.length - 1].submitted_at
      : null;

  return (
    <div className="px-8 py-8">
      <div className="flex items-baseline justify-between mb-8">
        <h1 className="text-xl font-semibold tracking-tight">Results</h1>
        <a
          href="/admin/results/export"
          download
          className="text-xs text-muted hover:text-white transition-colors"
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
                    >
                      {t.label.slice(0, 4)}
                    </th>
                  ))}
                  <th />
                </tr>
              </thead>
              <tbody>
                {submissions.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-border/50 hover:bg-accent/30 transition-colors"
                  >
                    <td className="py-3 pr-6 text-white/70 whitespace-nowrap">
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
                      <td key={t.id} className="py-3 pr-4 text-white/70">
                        {(s.scores as Record<string, number>)[t.id] ?? "—"}%
                      </td>
                    ))}
                    <td className="py-3 text-right">
                      <Link
                        href={`/admin/results/${s.id}`}
                        className="text-xs text-muted hover:text-white transition-colors"
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
                href={`/admin/results?before=${encodeURIComponent(older)}`}
                className="text-xs text-muted hover:text-white transition-colors"
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
