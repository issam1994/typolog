"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Trait } from "@/types/shared/quiz";

type Props = {
  traits: Trait[];
};

export default function ResultsDisplay({ traits }: Props) {
  const [scores, setScores] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("typolog_results");
    // Reading from localStorage (external system) — setScores here is intentional
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (raw) setScores(JSON.parse(raw));
  }, []);

  if (!scores) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20">
        <p className="text-white/50 mb-6">
          No results found. Take the test first.
        </p>
        <Link
          href="/quiz"
          className="px-6 py-3 bg-white text-black text-sm hover:bg-white/90 transition-colors"
        >
          Take the Test
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-24 pt-32">
      <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-3 text-center">
        Your Results
      </h1>
      <p className="text-white/50 text-sm mb-16 text-center max-w-sm">
        Based on your responses, here is how you score across the five core
        personality traits.
      </p>

      <div className="w-full max-w-xl space-y-10">
        {traits.map((trait) => {
          const pct = scores[trait.id] ?? 0;
          return (
            <div key={trait.id}>
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-sm font-medium">{trait.label}</span>
                <span className="text-sm text-white/40">{pct}%</span>
              </div>
              <div className="w-full h-px bg-white/10 relative">
                <div
                  className="absolute top-0 left-0 h-px bg-white transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-white/40 leading-relaxed">
                {trait.description}
              </p>
            </div>
          );
        })}
      </div>

      <Link
        href="/quiz"
        className="mt-16 px-6 py-3 text-sm border border-white/20 text-white/60 hover:border-white/60 hover:text-white transition-colors"
      >
        Retake the Test
      </Link>
    </div>
  );
}
