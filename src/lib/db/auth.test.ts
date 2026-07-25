import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockSupabase } from "@test/mocks/supabase";
import type { DbClient } from "./supabase-server";

const { createClientMock, redirect } = vi.hoisted(() => ({
  createClientMock: vi.fn(),
  redirect: vi.fn((url: string) => {
    throw new Error("NEXT_REDIRECT:" + url);
  }),
}));
vi.mock("./supabase-server", () => ({ createClient: createClientMock }));
vi.mock("next/navigation", () => ({ redirect }));

import { requireAdmin, signIn } from "./auth";

beforeEach(() => vi.clearAllMocks());

describe("requireAdmin", () => {
  it("returns the user when authenticated", async () => {
    const user = { id: "u1", email: "a@b.c" };
    createClientMock.mockResolvedValue(
      createMockSupabase({ authUser: user }) as unknown as DbClient,
    );
    await expect(requireAdmin()).resolves.toEqual(user);
    expect(redirect).not.toHaveBeenCalled();
  });

  it("redirects to the login page when unauthenticated", async () => {
    createClientMock.mockResolvedValue(
      createMockSupabase({ authUser: null }) as unknown as DbClient,
    );
    await expect(requireAdmin()).rejects.toThrow();
    expect(redirect).toHaveBeenCalledWith("/admin/login");
  });
});

describe("signIn", () => {
  it("returns a null error on success", async () => {
    createClientMock.mockResolvedValue(
      createMockSupabase() as unknown as DbClient,
    );
    expect(await signIn("a@b.c", "pw")).toEqual({ error: null });
  });

  it("maps the Supabase error message", async () => {
    const mock = createMockSupabase();
    mock.auth.signInWithPassword.mockResolvedValue({
      data: {},
      error: { message: "Invalid login credentials" },
    });
    createClientMock.mockResolvedValue(mock as unknown as DbClient);
    expect(await signIn("a@b.c", "bad")).toEqual({
      error: "Invalid login credentials",
    });
  });
});
