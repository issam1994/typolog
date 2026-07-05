import { notFound } from "next/navigation";
import {
  getTestBundle,
  getSubmission,
  getArchetype,
  getPublishedTests,
} from "@/lib/db/queries";
import ResultsDisplay from "@/components/results/ResultsDisplay";
import ResultsFallback from "@/components/results/ResultsFallback";
import ResultsPersistor from "@/components/results/ResultsPersistor";
import ResultsFromLocalStorage from "@/components/results/ResultsFromLocalStorage";
import TestRecommendations from "@/components/results/TestRecommendations";

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

  let submission = null;
  let archetype = null;
  try {
    submission = await getSubmission(submissionId);
    if (
      submission &&
      submission.test_id === test.id &&
      submission.archetype_code
    ) {
      archetype = await getArchetype(test.id, submission.archetype_code);
    }
  } catch {
    // API unavailable — fall through to localStorage
  }

  if (!submission || submission.test_id !== test.id) {
    return (
      <ResultsFromLocalStorage testSlug={slug} test={test} traits={traits} />
    );
  }

  const allTests = await getPublishedTests();

  return (
    <>
      <ResultsPersistor
        testSlug={slug}
        submissionId={submission.id}
        scores={submission.scores}
        archetypeCode={submission.archetype_code}
        archetype={archetype}
        submittedAt={submission.submitted_at}
      />
      <ResultsDisplay
        test={test}
        traits={traits}
        scores={submission.scores}
        archetype={archetype}
        archetypeCode={submission.archetype_code}
      />
      <TestRecommendations currentSlug={slug} allTests={allTests} />
    </>
  );
}
