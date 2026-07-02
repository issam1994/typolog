"use client";

import Link from "next/link";
import { useStoredResult } from "@/lib/use-stored-results";
import ResultsDisplay from "./ResultsDisplay";
import type { Test, Trait } from "@/types/quiz";

type Props = {
  testSlug: string;
  test: Test;
  traits: Trait[];
};

export default function ResultsFromLocalStorage({
  testSlug,
  test,
  traits,
}: Props) {
  const stored = useStoredResult(testSlug);

  if (!stored) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20">
        <p className="text-muted mb-6">
          No results found. Take the test first.
        </p>
        <Link
          href={`/tests/${testSlug}/quiz`}
          className="px-6 py-3 bg-foreground text-background text-sm hover:bg-foreground/90 transition-colors"
        >
          Take the Test
        </Link>
      </div>
    );
  }

  return (
    <ResultsDisplay
      test={test}
      traits={traits}
      scores={stored.scores}
      archetype={stored.archetype}
      archetypeCode={stored.archetypeCode}
    />
  );
}
