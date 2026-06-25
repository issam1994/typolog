/**
 * Typed accessors for `FormData` used by Server Actions.
 *
 * Form values arrive as `FormDataEntryValue | null`; these helpers narrow them
 * to the shapes the mutation layer expects and trim user-entered text so empty
 * inputs become `""`/`null` rather than whitespace.
 */

/** Trimmed string, or `""` when the field is absent. */
export function getString(form: FormData, key: string): string {
  return (form.get(key) as string | null)?.trim() ?? "";
}

/** Trimmed string, or `null` when the field is absent or blank. */
export function getNullableString(form: FormData, key: string): string | null {
  return (form.get(key) as string | null)?.trim() || null;
}

/** True only when the field's value is exactly `"true"` (e.g. a hidden flag). */
export function getBoolean(form: FormData, key: string): boolean {
  return form.get(key) === "true";
}

/** Parsed integer, or `fallback` when the field is absent or not a number. */
export function getInt(form: FormData, key: string, fallback: number): number {
  const parsed = parseInt((form.get(key) as string | null) ?? "", 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}
