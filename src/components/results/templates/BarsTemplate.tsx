import Link from "next/link";
import type { ResultTemplateProps } from "./types";

export default function BarsTemplate({
  test,
  traits,
  scores,
}: ResultTemplateProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-24 pt-32">
      <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-3 text-center">
        Your Results
      </h1>
      <p className="text-muted text-sm mb-16 text-center max-w-sm">
        Based on your responses, here is how you score across the{" "}
        {traits.length} core personality traits.
      </p>

      <div className="w-full max-w-xl space-y-10">
        {traits.map((trait) => {
          const pct = scores[trait.slug] ?? 0;
          return (
            <div key={trait.id}>
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-sm font-medium">{trait.label}</span>
                <span className="text-sm text-muted">{pct}%</span>
              </div>
              <div className="w-full h-px bg-border relative">
                <div
                  className="absolute top-0 left-0 h-px bg-foreground transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-muted leading-relaxed">
                {trait.description}
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
