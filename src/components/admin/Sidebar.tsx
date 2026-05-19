"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAction } from "@/app/admin/(protected)/actions/signout";

const navItems = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/questions", label: "Questions", exact: false },
  { href: "/admin/traits", label: "Traits", exact: false },
  { href: "/admin/results", label: "Results", exact: false },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-48 shrink-0 border-r border-border flex flex-col min-h-screen">
      <div className="px-6 py-5 border-b border-border">
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight text-white"
        >
          Typolog
        </Link>
        <p className="text-xs text-muted mt-0.5">Admin</p>
      </div>

      <nav className="flex-1 py-4">
        {navItems.map(({ href, label, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`block px-6 py-2.5 text-sm transition-colors ${
                active ? "text-white" : "text-muted hover:text-white/70"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-4">
        <form action={signOutAction}>
          <button
            type="submit"
            className="w-full text-left px-2 py-2 text-sm text-muted hover:text-white transition-colors"
          >
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
