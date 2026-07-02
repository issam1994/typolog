import Link from "next/link";
import type { ResultTemplateProps } from "./types";

const POSITION_LABELS = ["Confident", "Normative", "Painful", "Suggestive"];

export default function PsychosophyStackTemplate({
  test,
  traits,
  scores,
  archetype,
  archetypeCode,
}: ResultTemplateProps) {
  const ordered = [...traits].sort(
    (a, b) => (scores[b.slug] ?? 0) - (scores[a.slug] ?? 0),
  );
  const stackDisplay = archetypeCode
    ? archetypeCode.split("").join(" · ")
    : null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-24 pt-32">
      <div className="animate-fade-in-up text-center mb-16 max-w-lg">
        <p className="text-xs text-muted tracking-widest uppercase mb-4">
          Your psychosophy type
        </p>
        {stackDisplay ? (
          <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight mb-4">
            {stackDisplay}
          </h1>
        ) : (
          <h1 className="text-4xl font-semibold tracking-tight mb-4">
            Your Results
          </h1>
        )}
        {archetype && (
          <p className="text-lg font-light text-muted mb-6">
            {archetype.label}
          </p>
        )}
        {archetype?.description && (
          <p className="text-sm text-muted leading-relaxed">
            {archetype.description}
          </p>
        )}
        {archetype?.long_form && (
          <p className="mt-4 text-sm text-muted leading-relaxed">
            {archetype.long_form}
          </p>
        )}
      </div>

      <div className="w-full max-w-xl space-y-6">
        {ordered.map((trait, i) => {
          const pct = scores[trait.slug] ?? 0;
          const position = POSITION_LABELS[i] ?? "";
          return (
            <div key={trait.id}>
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-sm font-medium">
                  <span className="text-xs text-muted mr-2">
                    #{i + 1} {position}
                  </span>
                  {trait.label}
                </span>
                <span className="text-sm text-muted">{pct}%</span>
              </div>
              <div className="w-full h-px bg-border relative">
                <div
                  className="absolute top-0 left-0 h-px bg-foreground animate-grow-bar"
                  style={{ width: `${pct}%`, animationDelay: `${i * 60}ms` }}
                />
              </div>
              {trait.description && (
                <p className="mt-1 text-xs text-muted">{trait.description}</p>
              )}
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
