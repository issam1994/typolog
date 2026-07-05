import { LineChart, BarChart } from "@/components/admin/Chart";
import type { OverviewStats, ArchetypeCount } from "@/lib/db/queries/stats";
import type { Archetype } from "@/types/quiz";

type Props = {
  stats: OverviewStats;
  archetypeDist: ArchetypeCount[];
  archetypes: Archetype[];
};

export function TestAnalyticsSection({
  stats,
  archetypeDist,
  archetypes,
}: Props) {
  const total = archetypeDist.reduce((s, a) => s + a.count, 0);
  const archetypeMap = new Map(archetypes.map((a) => [a.code, a.label]));

  return (
    <div className="mb-10 space-y-8">
      {/* 30-day trend */}
      <div>
        <p className="text-xs text-muted tracking-widest uppercase mb-3">
          30-Day Submissions
        </p>
        <div className="border border-border p-4">
          <LineChart data={stats.dailyCounts} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-8">
        {/* Archetype distribution */}
        {archetypeDist.length > 0 && (
          <div>
            <p className="text-xs text-muted tracking-widest uppercase mb-3">
              Archetype Distribution
            </p>
            <div className="space-y-3">
              {archetypeDist.map((item) => {
                const pct =
                  total > 0 ? Math.round((item.count / total) * 100) : 0;
                const label = item.archetype_code
                  ? (archetypeMap.get(item.archetype_code) ??
                    item.archetype_code)
                  : "None";
                return (
                  <div key={item.archetype_code ?? "__none__"}>
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="text-xs">{label}</span>
                      <span className="text-xs text-muted">
                        {item.count} ({pct}%)
                      </span>
                    </div>
                    <div className="h-1.5 bg-accent">
                      <div
                        className="h-full bg-foreground/40 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Trait averages */}
        {stats.traitAverages.length > 0 && (
          <div>
            <p className="text-xs text-muted tracking-widest uppercase mb-3">
              Trait Averages (30d)
            </p>
            <div className="border border-border p-4">
              <BarChart
                data={stats.traitAverages.map((t) => ({
                  label: t.label,
                  value: t.average,
                }))}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
