"use client";

import { useEffect } from "react";
import { saveResult } from "@/lib/results-storage";
import type { ScoreMap, Archetype } from "@/types/quiz";

type Props = {
  testSlug: string;
  submissionId: string;
  scores: ScoreMap;
  archetypeCode: string | null;
  archetype: Archetype | null;
  submittedAt: string;
};

export default function ResultsPersistor({
  testSlug,
  submissionId,
  scores,
  archetypeCode,
  archetype,
  submittedAt,
}: Props) {
  useEffect(() => {
    saveResult(testSlug, {
      submissionId,
      scores,
      archetypeCode,
      archetype,
      submittedAt,
    });
  }, [testSlug, submissionId, scores, archetypeCode, archetype, submittedAt]);

  return null;
}
