import Link from "next/link";
import type { ResultTemplateProps } from "./types";
import type { Trait } from "@/types/quiz";

export default function MbtiCodeTemplate({
  test,
  traits,
  scores,
  archetype,
}: ResultTemplateProps) {
  // Build polarity pairs for dichotomy bars
  const seen = new Set<string>();
  const pairs: [Trait, Trait][] = [];
  for (const t of traits) {
    if (!t.polarity || seen.has(t.slug) || seen.has(t.polarity)) continue;
    const partner = traits.find((x) => x.slug === t.polarity);
    if (partner) {
      pairs.push([t, partner]);
      seen.add(t.slug);
      seen.add(t.polarity);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-24 pt-32">
      {archetype ? (
        <div className="animate-fade-in-up text-center mb-16 max-w-lg">
          <p className="text-xs text-muted tracking-widest uppercase mb-4">
            Your type
          </p>
          <h1 className="text-6xl sm:text-7xl font-semibold tracking-tight mb-4">
            {archetype.code}
          </h1>
          <p className="text-lg font-light text-muted mb-6">
            {archetype.label}
          </p>
          {archetype.description && (
            <p className="text-sm text-muted leading-relaxed">
              {archetype.description}
            </p>
          )}
          {archetype.long_form && (
            <p className="mt-4 text-sm text-muted leading-relaxed">
              {archetype.long_form}
            </p>
          )}
        </div>
      ) : (
        <h1 className="animate-fade-in-up text-4xl font-semibold tracking-tight mb-16 text-center">
          Your Results
        </h1>
      )}

      <div className="w-full max-w-xl space-y-8">
        {pairs.map(([a, b], i) => {
          const pctA = scores[a.slug] ?? 50;
          const pctB = 100 - pctA;
          const dominantA = pctA >= pctB;

          return (
            <div key={a.slug} className="space-y-3">
              {([a, b] as const).map((trait, j) => {
                const pct = j === 0 ? pctA : pctB;
                const isDominant = j === 0 ? dominantA : !dominantA;
                return (
                  <div key={trait.slug}>
                    <div className="flex justify-between items-baseline mb-2 text-sm">
                      <span
                        className={isDominant ? "font-medium" : "text-muted"}
                      >
                        {trait.label}
                      </span>
                      <span className="text-muted">{pct}%</span>
                    </div>
                    <div className="w-full h-px bg-border relative">
                      <div
                        className="absolute top-0 left-0 h-px bg-foreground animate-grow-bar"
                        style={{
                          width: `${pct}%`,
                          animationDelay: `${i * 160 + j * 80}ms`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <div className="flex gap-4 mt-16 flex-wrap justify-center">
        <Link
          href="/tests"
          className="px-6 py-3 text-sm border border-border text-muted hover:border-foreground/60 hover:text-foreground transition-colors"
        >
          Back to Tests
        </Link>
        <Link
          href={`/tests/${test.slug}/quiz`}
          className="px-6 py-3 text-sm border border-border text-muted hover:border-foreground/60 hover:text-foreground transition-colors"
        >
          Retake the Test
        </Link>
      </div>
    </div>
  );
}
