export const AVATAR_FALLBACK_COLORS = [
  "#4285F4",
  "#EA4335",
  "#FBBC05",
  "#34A853",
  "#7E57C2",
  "#00ACC1",
  "#F4511E",
  "#5E35B1",
  "#00897B",
  "#C2185B",
] as const;

const hashString = (value: string): number => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
};

export const getInitialsFromLastTwoWords = (name: string): string => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "US";
  if (words.length === 1) return (words[0]?.[0] ?? "U").toUpperCase();

  const lastTwoWords = words.slice(-2);
  const first = lastTwoWords[0]?.[0] ?? "";
  const second = lastTwoWords[1]?.[0] ?? "";
  const initials = `${first}${second}`.toUpperCase();

  return initials || "US";
};

export const getAvatarFallbackColor = (name: string): string => {
  const seed = name.trim().toLowerCase();
  if (!seed) return AVATAR_FALLBACK_COLORS[0];
  const index = hashString(seed) % AVATAR_FALLBACK_COLORS.length;
  return AVATAR_FALLBACK_COLORS[index];
};
