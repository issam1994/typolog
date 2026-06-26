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
          const dominant = pctA >= 50 ? a : b;
          const recessive = pctA >= 50 ? b : a;
          const dominantPct = pctA >= 50 ? pctA : 100 - pctA;

          return (
            <div key={a.slug}>
              <div className="flex justify-between items-baseline mb-2 text-sm">
                <span
                  className={
                    dominant.slug === a.slug ? "font-medium" : "text-muted"
                  }
                >
                  {a.label}
                </span>
                <span
                  className={
                    dominant.slug === b.slug ? "font-medium" : "text-muted"
                  }
                >
                  {b.label}
                </span>
              </div>
              <div className="w-full h-px bg-border relative">
                <div
                  className="absolute top-0 left-0 h-px bg-foreground animate-grow-bar"
                  style={{ width: `${pctA}%`, animationDelay: `${i * 80}ms` }}
                />
              </div>
              <p className="mt-1 text-xs text-muted">
                {dominantPct}% {dominant.label} · {100 - dominantPct}%{" "}
                {recessive.label}
              </p>
            </div>
          );
        })}
      </div>

      <Link
        href={`/tests/${test.slug}/quiz`}
        className="mt-16 px-6 py-3 text-sm border border-border text-muted hover:border-foreground/60 hover:text-foreground transition-colors"
      >
        Retake the Test
      </Link>
    </div>
  );
}
