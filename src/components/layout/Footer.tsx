import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="border-t border-border py-8 px-6 text-center">
      <div className="flex items-center justify-center gap-2 mb-2">
        <Logo size={14} className="text-muted" />
        <span className="text-sm font-semibold tracking-tight text-muted">
          Typolog
        </span>
      </div>
      <p className="text-xs text-muted">&copy; 2026 All rights reserved.</p>
    </footer>
  );
}
