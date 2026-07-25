import { vi } from "vitest";

// A lightweight, chainable Supabase test double. It does not execute real
// queries — it records the chain of builder calls (so tests can assert filters
// were applied) and resolves to canned per-table data. Enough to unit-test the
// `queries/*` and `mutations/*` shaping logic without a database.

export type Op = { method: string; args: unknown[] };

export type TableConfig = {
  /** Resolved `.data` when the builder is awaited directly. */
  data?: unknown;
  /** Resolved `.count` for `head: true` count queries. */
  count?: number | null;
  /**
   * Resolved `.data` for `.single()` / `.maybeSingle()`. Pass an array to
   * return a different value for each successive single call on this table
   * (e.g. a `nextSortOrder` lookup followed by an `insert().select().single()`).
   */
  single?: unknown;
  /** Resolved `.error` for every terminal on this table. */
  error?: unknown;
};

export type MockSupabase = {
  from: (table: string) => ChainableBuilder;
  auth: {
    getUser: ReturnType<typeof vi.fn>;
    signInWithPassword: ReturnType<typeof vi.fn>;
    signOut: ReturnType<typeof vi.fn>;
  };
  /** One record per `.from(table)` call, in order, with its recorded ops. */
  builders: { table: string; ops: Op[] }[];
  /** All ops recorded across every builder for a table. */
  opsFor: (table: string) => Op[];
  /** The args of each call to `method` on a table (across builders). */
  argsFor: (table: string, method: string) => unknown[][];
};

type ChainableBuilder = Record<string, unknown>;

const CHAINABLE = [
  "select",
  "insert",
  "update",
  "delete",
  "upsert",
  "eq",
  "neq",
  "is",
  "in",
  "gte",
  "lte",
  "gt",
  "lt",
  "order",
  "limit",
  "range",
  "not",
  "match",
  "filter",
  "contains",
] as const;

export function createMockSupabase(
  opts: {
    tables?: Record<string, TableConfig>;
    authUser?: unknown;
    authError?: unknown;
  } = {},
): MockSupabase {
  const tables = opts.tables ?? {};
  const builders: { table: string; ops: Op[] }[] = [];
  // Successive `.single()` calls on the same table dequeue from an array config.
  const singleIndex: Record<string, number> = {};

  const from = (table: string): ChainableBuilder => {
    const cfg = tables[table] ?? {};
    const ops: Op[] = [];
    builders.push({ table, ops });

    const terminal = () =>
      Promise.resolve({
        data: cfg.data ?? [],
        error: cfg.error ?? null,
        count: cfg.count ?? null,
      });
    const single = () => {
      let data: unknown = cfg.single ?? null;
      if (Array.isArray(cfg.single)) {
        const i = singleIndex[table] ?? 0;
        singleIndex[table] = i + 1;
        data = cfg.single[i] ?? null;
      }
      return Promise.resolve({ data, error: cfg.error ?? null });
    };

    const builder: ChainableBuilder = {
      then(
        onFulfilled: (v: unknown) => unknown,
        onRejected?: (e: unknown) => unknown,
      ) {
        return terminal().then(onFulfilled, onRejected);
      },
      single() {
        ops.push({ method: "single", args: [] });
        return single();
      },
      maybeSingle() {
        ops.push({ method: "maybeSingle", args: [] });
        return single();
      },
    };
    for (const method of CHAINABLE) {
      builder[method] = (...args: unknown[]) => {
        ops.push({ method, args });
        return builder;
      };
    }
    return builder;
  };

  return {
    from,
    auth: {
      getUser: vi.fn(async () => ({
        data: { user: opts.authUser ?? null },
        error: opts.authError ?? null,
      })),
      signInWithPassword: vi.fn(async () => ({
        data: {},
        error: opts.authError ?? null,
      })),
      signOut: vi.fn(async () => ({ error: null })),
    },
    builders,
    opsFor: (table) =>
      builders.filter((b) => b.table === table).flatMap((b) => b.ops),
    argsFor: (table, method) =>
      builders
        .filter((b) => b.table === table)
        .flatMap((b) => b.ops)
        .filter((o) => o.method === method)
        .map((o) => o.args),
  };
}
