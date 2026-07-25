import { describe, it, expect, vi, beforeEach } from "vitest";
import { redirectUrl } from "@test/mocks/next";

const h = vi.hoisted(() => ({
  signIn: vi.fn(async () => ({ error: null as string | null })),
  redirect: vi.fn((url: string) => {
    throw new Error("NEXT_REDIRECT:" + url);
  }),
}));
vi.mock("@/lib/db/auth", () => ({ signIn: h.signIn }));
vi.mock("next/navigation", () => ({ redirect: h.redirect }));

import { loginAction } from "./actions";

function form(entries: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(entries)) fd.set(k, v);
  return fd;
}

beforeEach(() => vi.clearAllMocks());

describe("loginAction", () => {
  it("redirects to the dashboard on success", async () => {
    let caught: unknown;
    try {
      await loginAction(form({ email: "a@b.c", password: "pw" }));
    } catch (e) {
      caught = e;
    }
    expect(h.signIn).toHaveBeenCalledWith("a@b.c", "pw");
    expect(redirectUrl(caught)).toBe("/admin");
  });

  it("redirects back to login with the encoded error on failure", async () => {
    h.signIn.mockResolvedValueOnce({ error: "Invalid login" });
    let caught: unknown;
    try {
      await loginAction(form({ email: "a@b.c", password: "bad" }));
    } catch (e) {
      caught = e;
    }
    expect(redirectUrl(caught)).toBe("/admin/login?error=Invalid%20login");
  });
});
