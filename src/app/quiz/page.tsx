import QuizContainer from "@/components/quiz/QuizContainer";
import { getQuiz } from "@/lib/db/queries";
import { likertOptions } from "@/constants/likert";

export const metadata = {
  title: "Personality Test — Typolog",
};

export default async function QuizPage() {
  const { questions, traits } = await getQuiz();
  return (
    <QuizContainer
      questions={questions}
      traits={traits}
      options={likertOptions}
    />
  );
}
