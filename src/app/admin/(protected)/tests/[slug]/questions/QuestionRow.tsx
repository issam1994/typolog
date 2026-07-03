"use client";

import { useTransition } from "react";
import {
  updateQuestionAction,
  deleteQuestionAction,
  moveQuestionAction,
} from "@/app/admin/(protected)/tests/[slug]/questions/actions";
import type { Question, Trait } from "@/types/quiz";

export function QuestionRow({
  question,
  traits,
  testSlug,
  isFirst,
  isLast,
}: {
  question: Question;
  traits: Trait[];
  testSlug: string;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [savePending, startSave] = useTransition();
  const [deletePending, startDelete] = useTransition();

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startSave(async () => {
      await updateQuestionAction(fd);
    });
  }

  function handleDelete() {
    if (!confirm("Delete this question? It will be hidden from the quiz."))
      return;
    const fd = new FormData();
    fd.append("id", question.id);
    startDelete(async () => {
      await deleteQuestionAction(fd);
    });
  }

  return (
    <details className="group border border-border/50 hover:border-border transition-colors">
      <summary className="flex items-center gap-3 px-4 py-3 cursor-pointer list-none">
        <MoveButtons
          id={question.id}
          testSlug={testSlug}
          isFirst={isFirst}
          isLast={isLast}
        />
        <span className="flex-1 text-sm text-foreground/80">
          {question.text}
        </span>
        <span className="text-xs text-muted shrink-0">
          {question.kind === "forced_choice" ? "FC" : "L"}
        </span>
        <span className="text-xs text-muted shrink-0 group-open:rotate-180 transition-transform">
          ▾
        </span>
      </summary>

      <div className="px-4 pb-4 pt-2 border-t border-border/50">
        <form onSubmit={handleSave} className="space-y-3">
          <input type="hidden" name="id" value={question.id} />
          <input type="hidden" name="test_slug" value={testSlug} />
          <textarea
            name="text"
            defaultValue={question.text}
            rows={2}
            required
            className="w-full bg-transparent border border-border px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:border-foreground/60 transition-colors"
          />

          {question.kind === "likert" ? (
            <div className="flex gap-3 items-center">
              <select
                name="trait_id"
                defaultValue={question.trait_id}
                className="bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground/60 transition-colors"
              >
                {traits.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
              <label className="flex items-center gap-2 text-xs text-muted">
                <input
                  type="checkbox"
                  name="reverse_keyed"
                  value="true"
                  defaultChecked={question.reverse_keyed}
                />
                Reverse keyed
              </label>
            </div>
          ) : (
            <div className="space-y-2">
              {question.options.map((opt, i) => (
                <div key={opt.id} className="flex gap-2 items-center">
                  <span className="text-xs text-muted w-16 shrink-0">
                    Option {i + 1}
                  </span>
                  <input name={`option_${i}_id`} type="hidden" value={opt.id} />
                  <input
                    name={`option_${i}_label`}
                    defaultValue={opt.label}
                    className="flex-1 bg-transparent border border-border px-2 py-1 text-sm focus:outline-none focus:border-foreground/60 transition-colors"
                  />
                  <select
                    name={`option_${i}_trait_id`}
                    defaultValue={opt.trait_id ?? ""}
                    className="bg-background border border-border px-2 py-1 text-sm focus:outline-none focus:border-foreground/60 transition-colors"
                  >
                    <option value="">— Trait —</option>
                    {traits.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 items-center justify-end">
            <button
              type="button"
              onClick={handleDelete}
              disabled={savePending || deletePending}
              className="text-xs text-danger hover:text-danger/80 transition-colors disabled:opacity-60"
            >
              {deletePending ? "Deleting…" : "Delete"}
            </button>
            <button
              type="submit"
              disabled={savePending || deletePending}
              className="px-4 py-2 text-xs bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-60"
            >
              {savePending ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </details>
  );
}

function MoveButtons({
  id,
  testSlug,
  isFirst,
  isLast,
}: {
  id: string;
  testSlug: string;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [pending, startTransition] = useTransition();

  function move(direction: "up" | "down") {
    const fd = new FormData();
    fd.append("id", id);
    fd.append("direction", direction);
    fd.append("test_slug", testSlug);
    startTransition(async () => {
      await moveQuestionAction(fd);
    });
  }

  return (
    <span className="flex gap-1 shrink-0">
      <button
        type="button"
        onClick={() => move("up")}
        disabled={isFirst || pending}
        className="px-1.5 py-0.5 text-xs text-muted hover:text-foreground transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
        title="Move up"
      >
        ↑
      </button>
      <button
        type="button"
        onClick={() => move("down")}
        disabled={isLast || pending}
        className="px-1.5 py-0.5 text-xs text-muted hover:text-foreground transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
        title="Move down"
      >
        ↓
      </button>
    </span>
  );
}
