import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20">
      <h1 className="animate-fade-in-up text-5xl sm:text-6xl md:text-7xl font-semibold tracking-tight leading-tight max-w-3xl">
        Discover Who You Really Are.
      </h1>
      <p className="animate-fade-in-up [animation-delay:120ms] mt-6 text-lg sm:text-xl text-muted max-w-xl leading-relaxed">
        Science-backed personality assessments. Understand yourself through Big
        Five, MBTI, Enneagram, and Cognitive Functions.
      </p>
      <Link
        href="/tests"
        className="animate-fade-in-up [animation-delay:240ms] mt-10 inline-block px-8 py-4 bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
      >
        Explore Tests
      </Link>
    </section>
  );
}
