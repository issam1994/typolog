import { notFound } from "next/navigation";
import { getTestBundle, getSubmission, getArchetype } from "@/lib/db/queries";
import ResultsDisplay from "@/components/results/ResultsDisplay";
import ResultsFallback from "@/components/results/ResultsFallback";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ submission?: string }>;
};

export async function generateMetadata() {
  return { title: `Results — Typolog` };
}

export default async function ResultsPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { submission: submissionId } = await searchParams;

  const bundle = await getTestBundle(slug);
  if (!bundle || !bundle.test.is_published) notFound();

  const { test, traits } = bundle;

  if (!submissionId) {
    return <ResultsFallback testSlug={slug} />;
  }

  const submission = await getSubmission(submissionId);
  if (!submission || submission.test_id !== test.id) {
    return <ResultsFallback testSlug={slug} />;
  }

  const archetype = submission.archetype_code
    ? await getArchetype(test.id, submission.archetype_code)
    : null;

  return (
    <ResultsDisplay
      test={test}
      traits={traits}
      scores={submission.scores}
      archetype={archetype}
      archetypeCode={submission.archetype_code}
    />
  );
}
