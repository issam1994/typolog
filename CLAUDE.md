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
- Run `npm run typecheck` and `npm run lint` before considering a task done.
- Don't add dependencies for things the framework already does (routing, image, fonts).
- Don't disable lint rules or use `@ts-ignore` to silence errors—fix the cause.
- Tailwind v4 for styling. No inline `style={}` unless the value is dynamic; prefer utility classes.

## Supabase

- Use `@supabase/ssr`, never `@supabase/auth-helpers`. The only clients live in `src/lib/db/`: `supabase-server.ts` (Server Components / Route Handlers / Actions, uses `await cookies()`) and `supabase-browser.ts` (Client Components). Don't cross the wire.
- Reads live in `src/lib/db/queries/*.ts` (one file per resource); write helpers in `src/lib/db/mutations/*.ts` (one file per resource). Server Actions in `src/app/**/actions.ts` (`'use server'`) and Route Handlers call these helpers — never call `.from(...)` inside a component. The only direct client outside `src/lib/db/` is `src/proxy.ts` (auth middleware).
- **Server-side, always use `auth.getUser()`, never `getSession()`** (cookies are spoofable). Gate protected admin pages/actions with `requireAdmin()` from `src/lib/db/auth.ts`. Quiz submissions are anonymous; admin is the only privileged role — there is no per-user row ownership.
- Security is layered: middleware (`src/proxy.ts`) is UX only, `requireAdmin()` is the app gate, Postgres RLS is the real boundary — RLS is enabled on every table.
- Domain types are hand-written in `src/types/quiz.ts` (discriminated unions richer than raw schema rows). If you adopt `supabase gen types typescript`, layer domain types on top rather than replacing them.

## Testing

- **Vitest** (jsdom env) for unit / integration / component tests; **Playwright** for E2E and async Server Components (which Vitest can't render). Commands: `npm run test`, `npm run test:watch`, `npm run test:coverage`, `npm run test:e2e`.
- Colocate tests as `*.test.ts(x)` next to the code. Shared fixtures/mocks live in `test/` (import via the `@test/*` alias); E2E specs live in `e2e/`.
- **Supabase is always mocked — never hit a real DB.** Unit-test `queries/*` and `mutations/*` against `createMockSupabase` (`test/mocks/supabase.ts`); test Server Actions and Route Handlers by mocking the `@/lib/db/*` module boundary. Build domain objects with `test/fixtures.ts`; build likert scoring inputs with `test/scoring.ts`.
- Route-handler tests that use `Request.formData()`/`File` need Node globals — add `// @vitest-environment node` to the top of the file.
- E2E runs the real app via `next dev` with `E2E_TEST_MODE=1`, which swaps `createClient()` for an in-memory stand-in seeded in `src/lib/db/e2e-fake.ts` (no database or network). Playwright's `webServer` sets this flag.
- Keep logic testable: extract non-trivial parsing/aggregation into pure `src/lib/` modules (e.g. `src/lib/import/parse.ts`, `src/lib/stats/aggregate.ts`) rather than embedding it in route handlers or queries.
