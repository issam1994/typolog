@AGENTS.md

# Code quality

- Match existing patterns in the file/module before introducing new ones.

# Stack conventions

- Server Components by default. Only add `"use client"` when the component actually needs interactivity, state, effects, or browser APIs.
- Supabase: use `src/lib/db/supabase-server.ts` in Server Components/Route Handlers and `supabase-browser.ts` in Client Components — don't cross the wire.
- All Supabase data access goes through `src/lib/db/queries.ts`; all auth calls go through `src/lib/db/auth.ts`. Outside these files and `src/proxy.ts`, no `supabase.from(...)` or `supabase.auth.*`.
- Tailwind v4 for styling. No inline `style={}` unless the value is dynamic; prefer utility classes.
