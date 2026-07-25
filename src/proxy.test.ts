import { describe, it, expect } from "vitest";
import { decideRedirect } from "./proxy";

describe("decideRedirect", () => {
  it("sends unauthenticated users on a protected admin path to login", () => {
    expect(decideRedirect(false, "/admin")).toBe("/admin/login");
    expect(decideRedirect(false, "/admin/tests/mbti")).toBe("/admin/login");
  });

  it("lets unauthenticated users reach the login page", () => {
    expect(decideRedirect(false, "/admin/login")).toBeNull();
  });

  it("sends authenticated users away from the login page to the dashboard", () => {
    expect(decideRedirect(true, "/admin/login")).toBe("/admin");
  });

  it("lets authenticated users through to protected admin pages", () => {
    expect(decideRedirect(true, "/admin/tests")).toBeNull();
  });
});
