@AGENTS.md

# Code quality

- Match existing patterns in the file/module before introducing new ones.

## Stack

- Use Server Components by default; add `"use client"` only when you need state, effects, or browser APIs.
- Fetch data in Server Components / route handlers, not in client effects.
- No `any`. Type props, params, and return values. Prefer `type` for objects, `interface` only when extending.
- Use `@/` path aliases, not relative `../../` chains.
- Colocate components, hooks, and tests next to where they're used.
- Handle loading and error states with `loading.tsx` and `error.tsx`.
- Read secrets from `process.env` server-side only; never expose them to the client.
- Run `tsc --noEmit` and the linter before considering a task done.
- Don't add dependencies for things the framework already does (routing, image, fonts).
- Don't disable lint rules or use `@ts-ignore` to silence errors—fix the cause.
- Supabase: use `src/lib/db/supabase-server.ts` in Server Components/Route Handlers and `supabase-browser.ts` in Client Components — don't cross the wire.
- Tailwind v4 for styling. No inline `style={}` unless the value is dynamic; prefer utility classes.

## Supabase

- Use `@supabase/ssr`, never `@supabase/auth-helpers`. Clients live only in `lib/supabase/`: `client.ts` (browser), `server.ts` (server, `await cookies()`).
- Reads go in `lib/data/*.ts`. Writes go in `lib/actions/*.ts` with `'use server'`. Never call `.from(...)` inside a component.
- **Server-side, always use `auth.getUser()`, never `getSession()`** (cookies are spoofable). Gate protected pages/actions with `requireUser()` from `lib/data/auth.ts`, and scope queries by owner (e.g. `.eq('user_id', user.id)`).
- Security is layered: middleware is UX only, `requireUser()` is the app gate, Postgres RLS is the real boundary — enable RLS on every client-exposed table.
- Regenerate types after schema changes: `supabase gen types typescript`. Don't hand-write schema types.
