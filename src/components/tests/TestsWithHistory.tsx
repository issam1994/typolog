"use client";

import Link from "next/link";
import { useAllStoredResults } from "@/lib/use-stored-results";
import type { Test } from "@/types/quiz";

type Props = {
  tests: Test[];
};

export default function TestsWithHistory({ tests }: Props) {
  const history = useAllStoredResults();

  return (
    <div className="space-y-4">
      {tests.map((test, i) => {
        const prior = history[test.slug];
        return (
          <div
            key={test.id}
            style={{ animationDelay: `${160 + i * 80}ms` }}
            className="animate-fade-in-up"
          >
            <Link
              href={`/tests/${test.slug}`}
              className="block border border-border p-6 hover:border-foreground/60 transition-colors group"
            >
              <div className="flex items-baseline justify-between mb-2">
                <h2 className="text-lg font-semibold tracking-tight group-hover:text-foreground transition-colors">
                  {test.name}
                </h2>
                <div className="flex items-center gap-3">
                  {prior && (
                    <span className="text-xs text-muted font-mono">
                      {prior.archetypeCode ?? "Completed"}
                    </span>
                  )}
                  <span className="text-xs text-muted">
                    ~{test.estimated_minutes} min
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted">{test.tagline}</p>
            </Link>
            {prior && (
              <Link
                href={`/tests/${test.slug}/results?submission=${prior.submissionId}`}
                className="block border border-t-0 border-border px-6 py-2.5 text-xs text-muted hover:border-foreground/60 hover:text-foreground transition-colors"
              >
                View results →
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}
