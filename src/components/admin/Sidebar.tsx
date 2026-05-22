"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAction } from "@/app/admin/(protected)/actions/signout";
import ThemeToggle from "@/components/layout/ThemeToggle";
import Logo from "@/components/layout/Logo";

const topNavItems = [
  {
    href: "/admin",
    label: "Overview",
    exact: true,
    icon: (
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    href: "/admin/tests",
    label: "Tests",
    exact: false,
    icon: (
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
      </svg>
    ),
  },
];

const testSubNavItems = [
  { suffix: "", label: "Overview", exact: true },
  { suffix: "/traits", label: "Traits", exact: false },
  { suffix: "/questions", label: "Questions", exact: false },
  { suffix: "/archetypes", label: "Archetypes", exact: false },
  { suffix: "/results", label: "Results", exact: false },
];

export default function Sidebar() {
  const pathname = usePathname();

  // Extract test slug if we're under /admin/tests/[slug]
  const testMatch = pathname.match(/^\/admin\/tests\/([^/]+)/);
  const activeTestSlug = testMatch ? testMatch[1] : null;

  return (
    <aside className="w-56 shrink-0 border-r border-border flex flex-col min-h-screen">
      <div className="px-5 py-5 border-b border-border">
        <Link
          href="/"
          className="flex items-center gap-2 text-foreground hover:opacity-80 transition-opacity"
        >
          <Logo size={16} />
          <span className="text-sm font-semibold tracking-tight">Typolog</span>
        </Link>
        <p className="text-xs text-muted mt-1 ml-6">Admin</p>
      </div>

      <nav className="flex-1 py-3 px-2">
        {topNavItems.map(({ href, label, exact, icon }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors mb-0.5 ${
                active
                  ? "bg-accent text-foreground"
                  : "text-muted hover:text-foreground hover:bg-accent/50"
              }`}
            >
              <span className="shrink-0">{icon}</span>
              {label}
            </Link>
          );
        })}

        {activeTestSlug && (
          <div className="mt-2 ml-3 border-l border-border pl-3">
            {testSubNavItems.map(({ suffix, label, exact }) => {
              const href = `/admin/tests/${activeTestSlug}${suffix}`;
              const active = exact
                ? pathname === href
                : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center px-2 py-2 text-sm transition-colors mb-0.5 ${
                    active
                      ? "text-foreground"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      <div className="border-t border-border p-3 flex items-center justify-between">
        <form action={signOutAction}>
          <button
            type="submit"
            className="px-2 py-1.5 text-sm text-muted hover:text-foreground transition-colors"
          >
            Sign out
          </button>
        </form>
        <ThemeToggle />
      </div>
    </aside>
  );
}
