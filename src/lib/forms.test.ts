import { describe, it, expect } from "vitest";
import { getString, getNullableString, getBoolean, getInt } from "./forms";

function form(entries: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(entries)) fd.set(k, v);
  return fd;
}

describe("getString", () => {
  it("trims the value", () => {
    expect(getString(form({ name: "  hi  " }), "name")).toBe("hi");
  });
  it("returns empty string when absent", () => {
    expect(getString(form({}), "name")).toBe("");
  });
  it("collapses whitespace-only to empty string", () => {
    expect(getString(form({ name: "   " }), "name")).toBe("");
  });
});

describe("getNullableString", () => {
  it("returns null when absent", () => {
    expect(getNullableString(form({}), "x")).toBeNull();
  });
  it("returns null when blank after trim", () => {
    expect(getNullableString(form({ x: "  " }), "x")).toBeNull();
  });
  it("returns the trimmed value otherwise", () => {
    expect(getNullableString(form({ x: " a " }), "x")).toBe("a");
  });
});

describe("getBoolean", () => {
  it("is true only for exactly 'true'", () => {
    expect(getBoolean(form({ flag: "true" }), "flag")).toBe(true);
  });
  it("is false for other truthy-looking values", () => {
    expect(getBoolean(form({ flag: "True" }), "flag")).toBe(false);
    expect(getBoolean(form({ flag: "1" }), "flag")).toBe(false);
    expect(getBoolean(form({}), "flag")).toBe(false);
  });
});

describe("getInt", () => {
  it("parses a plain integer", () => {
    expect(getInt(form({ n: "42" }), "n", 5)).toBe(42);
  });
  it("falls back when absent or non-numeric", () => {
    expect(getInt(form({}), "n", 5)).toBe(5);
    expect(getInt(form({ n: "abc" }), "n", 5)).toBe(5);
  });
  it("parses a leading-numeric string (parseInt semantics)", () => {
    expect(getInt(form({ n: "42px" }), "n", 5)).toBe(42);
  });
  it("truncates decimals", () => {
    expect(getInt(form({ n: "3.9" }), "n", 5)).toBe(3);
  });
  it("parses negatives", () => {
    expect(getInt(form({ n: "-7" }), "n", 5)).toBe(-7);
  });
});
