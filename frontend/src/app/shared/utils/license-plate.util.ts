const OLD_FORMAT = /^[A-Z]{3}-?\d{4}$/;
const MERCOSUL_FORMAT = /^[A-Z]{3}\d[A-Z]\d{2}$/;

/** Non-capturing group so Angular's pattern validator anchors the whole alternation, not just one side of the `|`. */
export const LICENSE_PLATE_PATTERN =
  "(?:[A-Z]{3}-?\\d{4}|[A-Z]{3}\\d[A-Z]\\d{2})";

export function normalizeLicensePlate(value: string | null | undefined): string {
  return (value ?? "").toUpperCase().replace(/\s+/g, "");
}

export function isValidLicensePlate(value: string | null | undefined): boolean {
  const normalized = normalizeLicensePlate(value);
  return OLD_FORMAT.test(normalized) || MERCOSUL_FORMAT.test(normalized);
}
