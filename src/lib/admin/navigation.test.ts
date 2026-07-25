import { describe, it, expect, vi } from "vitest";
import { redirectUrl } from "@test/mocks/next";

const { redirect, revalidatePath } = vi.hoisted(() => ({
  redirect: vi.fn((url: string) => {
    throw new Error("NEXT_REDIRECT:" + url);
  }),
  revalidatePath: vi.fn(),
}));
vi.mock("next/navigation", () => ({ redirect }));
vi.mock("next/cache", () => ({ revalidatePath }));

import { redirectWithError, revalidateAndRedirect } from "./navigation";

describe("redirectWithError", () => {
  it("URL-encodes the message into an ?error= param", () => {
    let caught: unknown;
    try {
      redirectWithError("/admin/tests", "Bad & ugly");
    } catch (e) {
      caught = e;
    }
    expect(redirectUrl(caught)).toBe("/admin/tests?error=Bad%20%26%20ugly");
  });
});

describe("revalidateAndRedirect", () => {
  it("revalidates the path, then redirects to it", () => {
    expect(() => revalidateAndRedirect("/admin/tests")).toThrow();
    expect(revalidatePath).toHaveBeenCalledWith("/admin/tests");
    expect(redirect).toHaveBeenCalledWith("/admin/tests");
  });
});
