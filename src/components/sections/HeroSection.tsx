import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20">
      <h1 className="text-5xl sm:text-6xl md:text-7xl font-semibold tracking-tight leading-tight max-w-3xl">
        Discover Who You Really Are.
      </h1>
      <p className="mt-6 text-lg sm:text-xl text-white/60 max-w-xl leading-relaxed">
        A five-minute personality assessment rooted in psychology. Understand
        your core traits and see yourself more clearly.
      </p>
      <Link
        href="/quiz"
        className="mt-10 inline-block px-8 py-4 bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors"
      >
        Take the Test
      </Link>
    </section>
  );
}
