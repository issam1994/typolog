"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitQuiz } from "@/app/quiz/actions";
import type { Question, Trait, LikertOption } from "@/types/shared/quiz";

type Props = {
  questions: Question[];
  traits: Trait[];
  options: LikertOption[];
};

export default function QuizContainer({ questions, traits, options }: Props) {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});

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
    const traitScores: Record<string, number> = {};
    const traitCounts: Record<string, number> = {};

    traits.forEach(({ id }) => {
      traitScores[id] = 0;
      traitCounts[id] = 0;
    });

    questions.forEach((q) => {
      const val = answers[q.id];
      if (val !== undefined) {
        traitScores[q.trait_id] = (traitScores[q.trait_id] ?? 0) + val;
        traitCounts[q.trait_id] = (traitCounts[q.trait_id] ?? 0) + 1;
      }
    });

    const maxPerQuestion = options[options.length - 1].value;
    const percentages: Record<string, number> = {};
    traits.forEach(({ id }) => {
      const count = traitCounts[id] ?? 0;
      const score = traitScores[id] ?? 0;
      percentages[id] =
        count > 0 ? Math.round((score / (count * maxPerQuestion)) * 100) : 0;
    });

    localStorage.setItem("typolog_results", JSON.stringify(percentages));
    await submitQuiz(answers, percentages);
    router.push("/results");
  }

  return (
    <div className="min-h-screen flex flex-col pt-20">
      <div className="w-full h-px bg-white/10">
        <div
          className="h-px bg-white transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <p className="text-xs text-white/40 tracking-widest uppercase mb-10">
          {current + 1} / {total}
        </p>

        <h2 className="text-2xl sm:text-3xl font-light text-center max-w-xl leading-snug mb-12">
          {question.text}
        </h2>

        <div className="flex flex-col gap-3 w-full max-w-sm">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => selectAnswer(opt.value)}
              className={`w-full px-5 py-3 text-sm border transition-colors text-left ${
                selectedValue === opt.value
                  ? "bg-white text-black border-white"
                  : "border-white/20 text-white/70 hover:border-white/60 hover:text-white"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex gap-4 mt-12">
          {current > 0 && (
            <button
              onClick={goPrev}
              className="px-6 py-3 text-sm border border-white/20 text-white/60 hover:border-white/60 hover:text-white transition-colors"
            >
              Back
            </button>
          )}
          {isLast ? (
            <button
              onClick={submit}
              disabled={selectedValue === undefined}
              className="px-6 py-3 text-sm bg-white text-black hover:bg-white/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              See Results
            </button>
          ) : (
            <button
              onClick={goNext}
              disabled={selectedValue === undefined}
              className="px-6 py-3 text-sm bg-white text-black hover:bg-white/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
