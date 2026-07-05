"use client";

import { useState } from "react";
import Link from "next/link";
import { loadAllResults } from "@/lib/results-storage";
import type { Test } from "@/types/quiz";

type Props = {
  currentSlug: string;
  allTests: Test[];
};

type RecommendState = { tests: Test[]; allComplete: boolean };

function computeRecommendations(
  currentSlug: string,
  allTests: Test[],
): RecommendState {
  try {
    if (typeof window === "undefined") return { tests: [], allComplete: false };
    const completed = loadAllResults();
    const others = allTests.filter((t) => t.slug !== currentSlug);
    const incomplete = others.filter((t) => !completed[t.slug]);
    if (incomplete.length === 0) return { tests: others, allComplete: true };
    return { tests: incomplete, allComplete: false };
  } catch {
    return { tests: [], allComplete: false };
  }
}

export default function TestRecommendations({ currentSlug, allTests }: Props) {
  const [{ tests, allComplete }] = useState<RecommendState>(() =>
    computeRecommendations(currentSlug, allTests),
  );

  if (tests.length === 0) return null;

  return (
    <section className="mt-16 px-6 max-w-2xl mx-auto pb-16">
      <h2 className="text-xs text-muted tracking-widest uppercase mb-6">
        {allComplete ? "Explore Again" : "Explore More"}
      </h2>
      <div className="grid sm:grid-cols-2 gap-3">
        {tests.map((test) => (
          <Link
            key={test.slug}
            href={`/tests/${test.slug}`}
            className="border border-border px-5 py-4 hover:border-foreground/60 transition-colors group"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-sm font-medium group-hover:text-foreground transition-colors">
                {test.name}
              </span>
              <span className="text-xs text-muted border border-border px-1.5 py-0.5 shrink-0">
                {test.estimated_minutes}m
              </span>
            </div>
            <p className="text-xs text-muted mt-1.5 line-clamp-2">
              {test.tagline}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
