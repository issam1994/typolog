import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getPublishedTests } from "@/lib/db/queries";
import TestsWithHistory from "@/components/tests/TestsWithHistory";

export const metadata = {
  title: "Personality Tests — Typolog",
};

export default async function TestsPage() {
  const tests = await getPublishedTests();

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-28 pb-24 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="animate-fade-in-up text-4xl sm:text-5xl font-semibold tracking-tight mb-3">
            Choose a Test
          </h1>
          <p className="animate-fade-in-up [animation-delay:80ms] text-muted mb-16">
            Each test explores a different dimension of your personality.
          </p>

          <TestsWithHistory tests={tests} />
        </div>
      </main>
      <Footer />
    </>
  );
}
