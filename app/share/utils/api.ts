export type ApiErrorInfo = {
  status?: number;
  name?: string;
  messages: string[];
};

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiErrorInfo };

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api";

const normalizeBaseUrl = (value: string) => value.replace(/\/+$/, "");

const JSON_HEADERS = {
  "Content-Type": "application/json",
};

const parseResponseBody = async (response: Response): Promise<unknown> => {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return response.json();
  }
  return response.text();
};

const normalizeMessages = (payload: unknown): string[] => {
  if (Array.isArray(payload)) {
    return payload.map((item) => String(item));
  }
  if (payload && typeof payload === "object") {
    const maybeMessage = (payload as { message?: unknown }).message;
    if (Array.isArray(maybeMessage)) {
      return maybeMessage.map((item) => String(item));
    }
    if (typeof maybeMessage === "string" && maybeMessage.trim()) {
      return [maybeMessage];
    }
  }
  if (typeof payload === "string" && payload.trim()) {
    return [payload];
  }
  return ["An unexpected error occurred."];
};

const extractErrorName = (payload: unknown): string | undefined => {
  if (payload && typeof payload === "object") {
    const maybeError = (payload as { error?: unknown }).error;
    if (typeof maybeError === "string" && maybeError.trim()) {
      return maybeError;
    }
  }
  return undefined;
};

export const postJson = async <T>(
  path: string,
  body: unknown,
): Promise<ApiResult<T>> => {
  try {
    const baseUrl = normalizeBaseUrl(API_BASE_URL);
    const response = await fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify(body),
      credentials: "include",
      cache: "no-store",
    });

    const payload = await parseResponseBody(response);
    if (!response.ok) {
      return {
        ok: false,
        error: {
          status: response.status,
          name: extractErrorName(payload),
          messages: normalizeMessages(payload),
        },
      };
    }

    return { ok: true, data: payload as T };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Request failed.";
    return {
      ok: false,
      error: {
        messages: ["Unable to reach the server.", message],
      },
    };
  }
};
