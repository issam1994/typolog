import Link from "next/link";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-border bg-background/80 backdrop-blur-sm">
      <Link
        href="/"
        className="flex items-center gap-2 text-foreground hover:opacity-80 transition-opacity"
      >
        <Logo size={18} />
        <span className="text-xl font-semibold tracking-tight">Typolog</span>
      </Link>
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <Link
          href="/tests"
          className="px-5 py-2 text-sm font-medium bg-foreground text-background hover:bg-foreground/90 transition-colors"
        >
          Take a Test
        </Link>
      </div>
    </nav>
  );
}
