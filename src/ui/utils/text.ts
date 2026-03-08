export function truncateText(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }
  return `${value.slice(0, maxLength - 1)}…`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

export function formatFrontmatterKey(key: string): string {
  return key
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatFrontmatterValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map((item) => formatFrontmatterValue(item)).join(", ");
  }
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}

export function normalizeFrontmatterValue(value: unknown): string {
  return formatFrontmatterValue(value).trim();
}
