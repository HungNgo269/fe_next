export const normalizeBaseUrl = (value: string) => value.replace(/\/+$/, "");

export const JSON_HEADERS = {
  "Content-Type": "application/json",
} as const;

const extractResponsePayload = (payload: unknown): unknown => {
  if (payload && typeof payload === "object") {
    const maybeResponse = (payload as { response?: unknown }).response;
    if (maybeResponse !== undefined) {
      return maybeResponse;
    }
  }
  return payload;
};

export const parseResponseBody = async (response: Response): Promise<unknown> => {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return response.json();
  }
  return response.text();
};

export const normalizeMessages = (payload: unknown): string[] => {
  const source = extractResponsePayload(payload);
  if (Array.isArray(source)) {
    return source.map((item) => String(item));
  }
  if (source && typeof source === "object") {
    const maybeMessage = (source as { message?: unknown }).message;
    if (Array.isArray(maybeMessage)) {
      return maybeMessage.map((item) => String(item));
    }
    if (typeof maybeMessage === "string" && maybeMessage.trim()) {
      return [maybeMessage];
    }
  }
  if (typeof source === "string" && source.trim()) {
    return [source];
  }
  return ["An unexpected error occurred."];
};

export const extractErrorName = (payload: unknown): string | undefined => {
  const source = extractResponsePayload(payload);
  if (source && typeof source === "object") {
    const maybeError = (source as { error?: unknown }).error;
    if (typeof maybeError === "string" && maybeError.trim()) {
      return maybeError;
    }
  }
  return undefined;
};
