import { notFound } from "next/navigation";
import QuizContainer from "@/components/quiz/QuizContainer";
import { getTestBundle } from "@/lib/db/queries";
import { likertOptions } from "@/constants/likert";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return { title: `${slug.replace(/-/g, " ")} Quiz — Typolog` };
}

export default async function QuizPage({ params }: Props) {
  const { slug } = await params;
  const bundle = await getTestBundle(slug);
  if (!bundle || !bundle.test.is_published) notFound();

  const { test, questions } = bundle;

  return (
    <QuizContainer
      testSlug={test.slug}
      questions={questions}
      likertOptions={likertOptions}
    />
  );
}
