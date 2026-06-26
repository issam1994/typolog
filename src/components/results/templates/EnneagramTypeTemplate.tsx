import Link from "next/link";
import type { ResultTemplateProps } from "./types";

export default function EnneagramTypeTemplate({
  test,
  traits,
  scores,
  archetype,
}: ResultTemplateProps) {
  const sorted = [...traits].sort(
    (a, b) => (scores[b.slug] ?? 0) - (scores[a.slug] ?? 0),
  );

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

      <div className="w-full max-w-xl space-y-6">
        {sorted.map((trait, i) => {
          const pct = scores[trait.slug] ?? 0;
          const typeNum = trait.slug.replace(/^type_/, "");
          return (
            <div key={trait.id}>
              <div className="flex justify-between items-baseline mb-2">
                <span
                  className={`text-sm ${i === 0 ? "font-medium" : "text-muted"}`}
                >
                  Type {typeNum} — {trait.label}
                </span>
                <span className="text-sm text-muted">{pct}%</span>
              </div>
              <div className="w-full h-px bg-border relative">
                <div
                  className="absolute top-0 left-0 h-px bg-foreground animate-grow-bar"
                  style={{ width: `${pct}%`, animationDelay: `${i * 60}ms` }}
                />
              </div>
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
