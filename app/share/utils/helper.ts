export const normalizeText = (
  value: string | null | undefined,
  fallback = "",
): string => {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : fallback;
};

export const normalizeNullableText = (
  value: string | null | undefined,
): string | null => {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
};

export const firstNonEmpty = (
  ...values: Array<string | null | undefined>
): string | null => {
  for (const value of values) {
    const normalized = normalizeNullableText(value);
    if (normalized) return normalized;
  }
  return null;
};

export const normalizeArray = <T>(value: T[] | null | undefined): T[] =>
  value ?? [];
