import Link from "next/link";
import { getAllTests, getOverviewStats, getAllTraits } from "@/lib/db/queries";
import { requireAdmin } from "@/lib/db/auth";
import { LineChart } from "@/components/admin/Chart";

export const metadata = { title: "Overview — Typolog Admin" };

export default async function AdminOverviewPage() {
  await requireAdmin();
  const tests = await getAllTests();

  // Fetch stats for all tests in parallel
  const statsPerTest = await Promise.all(
    tests.map(async (test) => {
      const traits = await getAllTraits(test.id);
      const stats = await getOverviewStats(traits, test.id);
      return { test, stats };
    }),
  );

  const totalAll = statsPerTest.reduce((s, x) => s + x.stats.total, 0);
  const last7dAll = statsPerTest.reduce((s, x) => s + x.stats.last7d, 0);
  const last30dAll = statsPerTest.reduce((s, x) => s + x.stats.last30d, 0);

  // Merge per-test daily counts into one combined series
  const combinedDailyCounts = (() => {
    if (statsPerTest.length === 0) return [];
    const merged: Record<string, number> = {};
    statsPerTest[0].stats.dailyCounts.forEach(({ date }) => {
      merged[date] = 0;
    });
    statsPerTest.forEach(({ stats }) => {
      stats.dailyCounts.forEach(({ date, count }) => {
        merged[date] = (merged[date] ?? 0) + count;
      });
    });
    return Object.entries(merged)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));
  })();

  return (
    <div className="px-8 py-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight">Overview</h1>
        <p className="text-sm text-muted mt-1">All tests combined</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <KpiCard label="Total Submissions" value={totalAll} />
        <KpiCard label="Last 7 Days" value={last7dAll} />
        <KpiCard label="Last 30 Days" value={last30dAll} />
      </div>

      {combinedDailyCounts.length > 0 && (
        <div className="border border-border p-4 mb-10">
          <p className="text-xs text-muted tracking-widest uppercase mb-3">
            30-Day Trend
          </p>
          <LineChart data={combinedDailyCounts} />
        </div>
      )}

      <h2 className="text-xs text-muted tracking-widest uppercase mb-4">
        By Test
      </h2>
      <div className="border border-border divide-y divide-border">
        {statsPerTest.map(({ test, stats }) => (
          <div
            key={test.id}
            className="flex items-center justify-between px-5 py-4"
          >
            <div>
              <span className="text-sm font-medium">{test.name}</span>
              {!test.is_published && (
                <span className="ml-2 text-xs text-muted border border-border px-1.5 py-0.5">
                  draft
                </span>
              )}
            </div>
            <div className="flex items-center gap-8 text-sm text-muted">
              <span>{stats.total.toLocaleString()} total</span>
              <span>{stats.last7d} / 7d</span>
              <span>{stats.last30d} / 30d</span>
              <Link
                href={`/admin/tests/${test.slug}`}
                className="text-xs hover:text-foreground transition-colors"
              >
                View →
              </Link>
            </div>
          </div>
        ))}
        {tests.length === 0 && (
          <div className="px-5 py-8 text-sm text-muted text-center">
            No tests yet.{" "}
            <Link
              href="/admin/tests"
              className="hover:text-foreground transition-colors"
            >
              Create one →
            </Link>
          </div>
        )}
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
