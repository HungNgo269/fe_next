export const toText = (value: unknown): string => {
  if (typeof value === "string") {
    return value.trim();
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return "";
};



export const formatRelativeTime = (value?: string): string => {
  if (!value) {
    return "Now";
  }
  const ms = new Date(value).getTime();
  if (Number.isNaN(ms)) {
    return "Now";
  }
  const deltaMinutes = Math.max(1, Math.floor((Date.now() - ms) / 60000));
  if (deltaMinutes < 60) {
    return `${deltaMinutes}m`;
  }
  const deltaHours = Math.floor(deltaMinutes / 60);
  if (deltaHours < 24) {
    return `${deltaHours}h`;
  }
  const deltaDays = Math.floor(deltaHours / 24);
  return `${deltaDays}d`;
};
