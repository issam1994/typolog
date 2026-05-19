import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/80 backdrop-blur-sm">
      <Link
        href="/"
        className="text-xl font-semibold tracking-tight text-white"
      >
        Typolog
      </Link>
      <Link
        href="/quiz"
        className="px-5 py-2 text-sm font-medium bg-white text-black hover:bg-white/90 transition-colors"
      >
        Take the Test
      </Link>
    </nav>
  );
}
