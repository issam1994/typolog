import { randomUUID } from "node:crypto";
import { createServerClient } from "@supabase/ssr";

// In-memory Supabase stand-in used only when E2E_TEST_MODE=1. It executes real
// filtering/ordering/inserts against seeded data so Playwright can drive the
// full quiz → results journey with no database or network. This file is loaded
// via dynamic import from `createClient`, so it never ships in the normal bundle.
//
// It implements only the chainable subset the app's queries/mutations use.

type RealClient = ReturnType<typeof createServerClient>;
type Row = Record<string, unknown>;
type DB = Record<string, Row[]>;

const now = "2026-01-01T00:00:00.000Z";

function seed(): DB {
  return {
    tests: [
      {
        id: "t_sample",
        slug: "sample",
        name: "Sample Personality Test",
        tagline: "A quick sample of who you are",
        description: "A short sample test to explore your core traits.",
        question_kind: "likert",
        scoring_strategy: "likert_percentage",
        result_template: "bars",
        is_published: true,
        sort_order: 1,
        estimated_minutes: 3,
      },
      {
        id: "t_second",
        slug: "second",
        name: "Second Test",
        tagline: "Another quick one",
        description: "A second published test for exploration.",
        question_kind: "likert",
        scoring_strategy: "likert_percentage",
        result_template: "bars",
        is_published: true,
        sort_order: 2,
        estimated_minutes: 2,
      },
    ],
    traits: [
      trait("tr_open", "t_sample", "openness", "Openness", 1),
      trait("tr_order", "t_sample", "order", "Orderliness", 2),
      trait("tr_focus", "t_second", "focus", "Focus", 1),
    ],
    questions: [
      question("q_1", "t_sample", "I enjoy trying new things.", "tr_open", 1),
      question("q_2", "t_sample", "I keep my space tidy.", "tr_order", 2),
      question("q_s1", "t_second", "I stay focused easily.", "tr_focus", 1),
    ],
    question_options: [],
    archetypes: [],
    submissions: [],
  };
}

function trait(
  id: string,
  test_id: string,
  slug: string,
  label: string,
  sort_order: number,
): Row {
  return {
    id,
    test_id,
    slug,
    label,
    description: `Your level of ${label.toLowerCase()}.`,
    polarity: null,
    sort_order,
    updated_at: now,
  };
}

function question(
  id: string,
  test_id: string,
  text: string,
  trait_id: string,
  sort_order: number,
): Row {
  return {
    id,
    test_id,
    text,
    kind: "likert",
    trait_id,
    reverse_keyed: false,
    sort_order,
    deleted_at: null,
    created_at: now,
    updated_at: now,
  };
}

// Module-level state persists for the lifetime of the dev server, so submissions
// created during a run remain readable by later requests in the same run.
const db: DB = seed();

function cmp(a: unknown, b: unknown): number {
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b));
}

function makeBuilder(table: string) {
  const filters: ((r: Row) => boolean)[] = [];
  let orderCol: string | null = null;
  let orderAsc = true;
  let limitN: number | null = null;
  let countMode = false;
  let joinOptions = false;
  let mode: "select" | "insert" | "update" | "delete" = "select";
  let inserted: Row[] = [];
  let updateVals: Row = {};

  const matching = (rows: Row[]) =>
    rows.filter((r) => filters.every((f) => f(r)));

  const selectRows = (): Row[] => {
    let rows = matching(db[table] ?? []);
    if (orderCol) {
      const col = orderCol;
      rows = [...rows].sort(
        (a, b) => cmp(a[col], b[col]) * (orderAsc ? 1 : -1),
      );
    }
    if (limitN != null) rows = rows.slice(0, limitN);
    if (joinOptions) {
      rows = rows.map((r) => ({
        ...r,
        question_options: (db["question_options"] ?? []).filter(
          (o) => o.question_id === r.id,
        ),
      }));
    }
    return rows;
  };

  const exec = () => {
    if (mode === "update") {
      const matched = matching(db[table] ?? []);
      matched.forEach((r) => Object.assign(r, updateVals));
      return Promise.resolve({
        data: matched,
        error: null,
        count: matched.length,
      });
    }
    if (mode === "delete") {
      const keep: Row[] = [];
      const removed: Row[] = [];
      for (const r of db[table] ?? []) {
        (filters.every((f) => f(r)) ? removed : keep).push(r);
      }
      db[table] = keep;
      return Promise.resolve({
        data: removed,
        error: null,
        count: removed.length,
      });
    }
    if (countMode) {
      return Promise.resolve({
        data: null,
        error: null,
        count: selectRows().length,
      });
    }
    return Promise.resolve({ data: selectRows(), error: null, count: null });
  };

  const single = () => {
    const source = mode === "insert" ? inserted : selectRows();
    const data = source[0] ?? null;
    return Promise.resolve({
      data,
      error: data ? null : { message: "No rows found" },
    });
  };

  const builder = {
    select(cols?: string, opts?: { count?: string; head?: boolean }) {
      if (typeof cols === "string" && cols.includes("question_options")) {
        joinOptions = true;
      }
      if (opts?.count) countMode = true;
      return builder;
    },
    insert(rows: Row | Row[]) {
      mode = "insert";
      const arr = Array.isArray(rows) ? rows : [rows];
      inserted = arr.map((r) => ({
        id: randomUUID(),
        submitted_at: now,
        ...r,
      }));
      (db[table] ??= []).push(...inserted);
      return builder;
    },
    update(vals: Row) {
      mode = "update";
      updateVals = vals;
      return builder;
    },
    delete() {
      mode = "delete";
      return builder;
    },
    eq(col: string, val: unknown) {
      filters.push((r) => r[col] === val);
      return builder;
    },
    is(col: string, val: unknown) {
      filters.push((r) => r[col] === val);
      return builder;
    },
    neq(col: string, val: unknown) {
      filters.push((r) => r[col] !== val);
      return builder;
    },
    in(col: string, vals: unknown[]) {
      filters.push((r) => vals.includes(r[col]));
      return builder;
    },
    gte(col: string, val: unknown) {
      filters.push((r) => cmp(r[col], val) >= 0);
      return builder;
    },
    lte(col: string, val: unknown) {
      filters.push((r) => cmp(r[col], val) <= 0);
      return builder;
    },
    gt(col: string, val: unknown) {
      filters.push((r) => cmp(r[col], val) > 0);
      return builder;
    },
    lt(col: string, val: unknown) {
      filters.push((r) => cmp(r[col], val) < 0);
      return builder;
    },
    order(col: string, opts?: { ascending?: boolean }) {
      orderCol = col;
      orderAsc = opts?.ascending ?? true;
      return builder;
    },
    limit(n: number) {
      limitN = n;
      return builder;
    },
    single,
    maybeSingle: single,
    then(
      onFulfilled: (v: unknown) => unknown,
      onRejected?: (e: unknown) => unknown,
    ) {
      return exec().then(onFulfilled, onRejected);
    },
  };
  return builder;
}

export function createFakeClient(): RealClient {
  const client = {
    from: (table: string) => makeBuilder(table),
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      signInWithPassword: async () => ({
        data: {},
        error: { message: "E2E mode: admin auth is disabled" },
      }),
      signOut: async () => ({ error: null }),
    },
  };
  return client as unknown as RealClient;
}
