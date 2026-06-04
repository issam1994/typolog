"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitQuiz } from "@/app/tests/[slug]/quiz/actions";
import type { Question, LikertOption } from "@/types/quiz";

type Props = {
  testSlug: string;
  questions: Question[];
  likertOptions: LikertOption[];
};

export default function QuizContainer({
  testSlug,
  questions,
  likertOptions,
}: Props) {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const question = questions[current];
  const total = questions.length;
  const progress = ((current + 1) / total) * 100;
  const isLast = current === total - 1;
  const selectedValue = answers[question.id];

  function selectAnswer(value: number) {
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
  }

  function goNext() {
    if (current < total - 1) setCurrent((c) => c + 1);
  }

  function goPrev() {
    if (current > 0) setCurrent((c) => c - 1);
  }

  async function submit() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const { submissionId } = await submitQuiz(testSlug, answers);
      localStorage.setItem(`typolog_submission:${testSlug}`, submissionId);
      router.push(`/tests/${testSlug}/results?submission=${submissionId}`);
    } catch (err) {
      console.error("Quiz submission failed", err);
      setSubmitError("Couldn't submit — please try again.");
      setSubmitting(false);
    }
  }

  const isForcedChoice = question.kind === "forced_choice";

  return (
    <div className="min-h-screen flex flex-col pt-20">
      <div className="w-full h-px bg-border">
        <div
          className="h-px bg-foreground transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <p className="text-xs text-muted tracking-widest uppercase mb-10">
          {current + 1} / {total}
        </p>

        <h2 className="text-2xl sm:text-3xl font-light text-center max-w-xl leading-snug mb-12">
          {question.text}
        </h2>

        {isForcedChoice ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
            {question.options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => selectAnswer(opt.value)}
                className={`w-full px-5 py-4 text-sm border transition-colors text-left ${
                  selectedValue === opt.value
                    ? "bg-foreground text-background border-foreground"
                    : "border-border text-muted hover:border-foreground/60 hover:text-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3 w-full max-w-sm">
            {likertOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => selectAnswer(opt.value)}
                className={`w-full px-5 py-3 text-sm border transition-colors text-left ${
                  selectedValue === opt.value
                    ? "bg-foreground text-background border-foreground"
                    : "border-border text-muted hover:border-foreground/60 hover:text-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {submitError && (
          <p
            role="alert"
            className="mt-8 text-sm text-[color:var(--color-danger)]"
          >
            {submitError}
          </p>
        )}

        <div className="flex gap-4 mt-12">
          {current > 0 && (
            <button
              onClick={goPrev}
              className="px-6 py-3 text-sm border border-border text-muted hover:border-foreground/60 hover:text-foreground transition-colors"
            >
              Back
            </button>
          )}
          {isLast ? (
            <button
              onClick={submit}
              disabled={selectedValue === undefined || submitting}
              className="px-6 py-3 text-sm bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting…" : "See Results"}
            </button>
          ) : (
            <button
              onClick={goNext}
              disabled={selectedValue === undefined}
              className="px-6 py-3 text-sm bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
