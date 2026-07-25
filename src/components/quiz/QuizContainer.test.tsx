import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { likertOptions } from "@/constants/likert";
import { makeLikertQuestion } from "@test/fixtures";

const { submitQuiz, push, saveResult } = vi.hoisted(() => ({
  submitQuiz: vi.fn(),
  push: vi.fn(),
  saveResult: vi.fn(),
}));
vi.mock("@/app/tests/[slug]/quiz/actions", () => ({ submitQuiz }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("@/lib/results-storage", () => ({ saveResult }));

import QuizContainer from "./QuizContainer";

const questions = [
  makeLikertQuestion({ id: "q1", text: "Question one" }),
  makeLikertQuestion({ id: "q2", text: "Question two" }),
];

const renderQuiz = () =>
  render(
    <QuizContainer
      testSlug="mbti"
      questions={questions}
      likertOptions={likertOptions}
    />,
  );

const PROGRESS_KEY = "typolog_quiz_progress:mbti";

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe("QuizContainer", () => {
  it("keeps Next disabled until an option is chosen", async () => {
    const user = userEvent.setup();
    renderQuiz();
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Agree" }));
    expect(screen.getByRole("button", { name: "Next" })).toBeEnabled();
  });

  it("advances to the next question and reveals Back + See Results", async () => {
    const user = userEvent.setup();
    renderQuiz();
    await user.click(screen.getByRole("button", { name: "Agree" }));
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("Question two")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Back" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "See Results" }),
    ).toBeInTheDocument();
  });

  it("submits answers, saves the result, clears progress, and redirects", async () => {
    submitQuiz.mockResolvedValue({
      submissionId: "s1",
      archetypeCode: "INTJ",
      scores: { a: 100 },
    });
    const user = userEvent.setup();
    renderQuiz();
    await user.click(screen.getByRole("button", { name: "Agree" })); // q1 → 4
    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByRole("button", { name: "Strongly Agree" })); // q2 → 5
    await user.click(screen.getByRole("button", { name: "See Results" }));

    await waitFor(() =>
      expect(push).toHaveBeenCalledWith("/tests/mbti/results?submission=s1"),
    );
    expect(submitQuiz).toHaveBeenCalledWith("mbti", { q1: 4, q2: 5 });
    expect(saveResult).toHaveBeenCalledWith(
      "mbti",
      expect.objectContaining({ submissionId: "s1", archetypeCode: "INTJ" }),
    );
    expect(localStorage.getItem(PROGRESS_KEY)).toBeNull();
  });

  it("shows an error alert when submission fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    submitQuiz.mockRejectedValue(new Error("boom"));
    const user = userEvent.setup();
    renderQuiz();
    await user.click(screen.getByRole("button", { name: "Agree" }));
    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByRole("button", { name: "Strongly Agree" }));
    await user.click(screen.getByRole("button", { name: "See Results" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/couldn't submit/i);
    expect(push).not.toHaveBeenCalled();
  });

  it("restores saved progress from localStorage on mount", () => {
    localStorage.setItem(
      PROGRESS_KEY,
      JSON.stringify({ answers: { q1: 4 }, current: 1 }),
    );
    renderQuiz();
    expect(screen.getByText("Question two")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Back" })).toBeInTheDocument();
  });

  it("persists progress to localStorage as answers change", async () => {
    const user = userEvent.setup();
    renderQuiz();
    await user.click(screen.getByRole("button", { name: "Agree" }));
    const raw = localStorage.getItem(PROGRESS_KEY);
    expect(raw).toContain("q1");
  });
});
