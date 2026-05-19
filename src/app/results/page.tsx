import ResultsDisplay from "@/components/results/ResultsDisplay";
import { getAllTraits } from "@/lib/db/queries";

export const metadata = {
  title: "Your Results — Typolog",
};

export default async function ResultsPage() {
  const traits = await getAllTraits();
  return <ResultsDisplay traits={traits} />;
}
