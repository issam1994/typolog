import { notFound } from "next/navigation";
import { getTest, getAllTraits, getOverviewStats } from "@/lib/db/queries";
import { requireAdmin } from "@/lib/db/auth";
import { LineChart, BarChart } from "@/components/admin/Chart";
import { EditTestModal } from "./EditTestModal";

export const metadata = { title: "Test Overview — Typolog Admin" };

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function TestOverviewPage({ params }: Props) {
  await requireAdmin();
  const { slug } = await params;
  const test = await getTest(slug);
  if (!test) notFound();

  const traits = await getAllTraits(test.id);
  const stats = await getOverviewStats(traits, test.id);

  return (
    <div className="px-8 py-8 max-w-5xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{test.name}</h1>
          <p className="text-sm text-muted mt-1">
            {test.is_published ? "Published" : "Draft"} · ~
            {test.estimated_minutes} min · {test.scoring_strategy}
          </p>
        </div>
        <EditTestModal test={test} />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <KpiCard label="Total Submissions" value={stats.total} />
        <KpiCard label="Last 7 Days" value={stats.last7d} />
        <KpiCard label="Last 30 Days" value={stats.last30d} />
      </div>

      <div className="grid grid-cols-2 gap-5">
        <section className="border border-border p-5">
          <p className="text-xs text-muted tracking-widest uppercase font-medium mb-4">
            Submissions / Day — Last 30 days
          </p>
          {stats.total === 0 ? (
            <p className="text-sm text-muted py-8 text-center">No data yet.</p>
          ) : (
            <LineChart data={stats.dailyCounts} />
          )}
        </section>

        <section className="border border-border p-5">
          <p className="text-xs text-muted tracking-widest uppercase font-medium mb-4">
            Per-Trait Averages — Last 30 days
          </p>
          {stats.last30d === 0 ? (
            <p className="text-sm text-muted py-8 text-center">No data yet.</p>
          ) : (
            <BarChart
              data={stats.traitAverages.map((t) => ({
                label: t.label,
                value: t.average,
              }))}
            />
          )}
        </section>
      </div>
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-border bg-accent px-5 py-5">
      <p className="text-xs text-muted tracking-widest uppercase mb-3">
        {label}
      </p>
      <p className="text-3xl font-semibold tracking-tight">
        {value.toLocaleString()}
      </p>
    </div>
  );
}
