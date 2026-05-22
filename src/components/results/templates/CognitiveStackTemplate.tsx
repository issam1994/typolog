import Link from "next/link";
import type { ResultTemplateProps } from "./types";

export default function CognitiveStackTemplate({
  test,
  traits,
  scores,
  archetypeCode,
}: ResultTemplateProps) {
  const sorted = [...traits].sort(
    (a, b) => (scores[b.slug] ?? 0) - (scores[a.slug] ?? 0),
  );
  const stackDisplay = archetypeCode
    ? archetypeCode
        .match(/.{2}/g)
        ?.map((s) => s.charAt(0).toUpperCase() + s.charAt(1).toLowerCase())
        .join(" · ")
    : null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-24 pt-32">
      <div className="text-center mb-16">
        <p className="text-xs text-muted tracking-widest uppercase mb-4">
          Your cognitive stack
        </p>
        {stackDisplay ? (
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-3">
            {stackDisplay}
          </h1>
        ) : (
          <h1 className="text-4xl font-semibold tracking-tight mb-3">
            Your Results
          </h1>
        )}
        <p className="text-muted text-sm max-w-sm mx-auto">
          Your top four cognitive functions, ordered by preference.
        </p>
      </div>

      <div className="w-full max-w-xl space-y-6">
        {sorted.map((trait, i) => {
          const pct = scores[trait.slug] ?? 0;
          return (
            <div key={trait.id}>
              <div className="flex justify-between items-baseline mb-2">
                <span
                  className={`text-sm ${i < 4 ? "font-medium" : "text-muted"}`}
                >
                  {i < 4 && (
                    <span className="text-xs text-muted mr-2">#{i + 1}</span>
                  )}
                  {trait.label}
                </span>
                <span className="text-sm text-muted">{pct}%</span>
              </div>
              <div className="w-full h-px bg-border relative">
                <div
                  className="absolute top-0 left-0 h-px bg-foreground transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
              {i < 4 && trait.description && (
                <p className="mt-1 text-xs text-muted">{trait.description}</p>
              )}
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
