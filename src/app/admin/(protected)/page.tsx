import { getOverviewStats, getAllTraits } from "@/lib/db/queries";
import { requireAdmin } from "@/lib/db/auth";
import { LineChart, BarChart } from "@/components/admin/Chart";

export const metadata = { title: "Overview — Typolog Admin" };

export default async function AdminOverviewPage() {
  await requireAdmin();
  const traits = await getAllTraits();
  const stats = await getOverviewStats(traits);

  return (
    <div className="px-8 py-8 max-w-4xl">
      <h1 className="text-xl font-semibold tracking-tight mb-8">Overview</h1>

      {/* KPI cards */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <KpiCard label="Total Submissions" value={stats.total} />
        <KpiCard label="Last 7 Days" value={stats.last7d} />
        <KpiCard label="Last 30 Days" value={stats.last30d} />
      </div>

      {/* Line chart — submissions / day */}
      <section className="mb-10">
        <h2 className="text-xs text-muted tracking-widest uppercase mb-4">
          Submissions / Day (30 days)
        </h2>
        <div className="border border-border p-4">
          {stats.total === 0 ? (
            <p className="text-sm text-muted py-6 text-center">No data yet.</p>
          ) : (
            <LineChart data={stats.dailyCounts} />
          )}
        </div>
      </section>

      {/* Bar chart — per-trait averages */}
      <section>
        <h2 className="text-xs text-muted tracking-widest uppercase mb-4">
          Per-Trait Averages (last 30 days)
        </h2>
        <div className="border border-border p-4">
          {stats.last30d === 0 ? (
            <p className="text-sm text-muted py-6 text-center">No data yet.</p>
          ) : (
            <BarChart
              data={stats.traitAverages.map((t) => ({
                label: t.label,
                value: t.average,
              }))}
            />
          )}
        </div>
      </section>
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-border px-5 py-4">
      <p className="text-xs text-muted mb-1">{label}</p>
      <p className="text-2xl font-semibold">{value.toLocaleString()}</p>
    </div>
  );
}
