import type { ApiError } from "./api-types";

const unwrapErrorPayload = (payload: unknown) => {
  if (!payload || typeof payload !== "object") {
    return payload;
  }

  const responsePayload = (payload as { response?: unknown }).response;
  return responsePayload ?? payload;
};

export const getApiErrorMessages = (payload: unknown): string[] => {
  const source = unwrapErrorPayload(payload);

  if (Array.isArray(source)) {
    return source.map((item) => String(item));
  }

  if (source && typeof source === "object") {
    const message = (source as { message?: unknown }).message;
    if (Array.isArray(message)) {
      return message.map((item) => String(item));
    }
    if (typeof message === "string" && message.trim()) {
      return [message];
    }
  }

  if (typeof source === "string" && source.trim()) {
    return [source];
  }

  return ["An unexpected error occurred."];
};

export const getApiErrorName = (payload: unknown): string | undefined => {
  const source = unwrapErrorPayload(payload);
  if (!source || typeof source !== "object") {
    return undefined;
  }

  const errorName = (source as { error?: unknown }).error;
  if (typeof errorName === "string" && errorName.trim()) {
    return errorName;
  }

  return undefined;
};

export const getUnknownApiError = (error: unknown): ApiError => ({
  messages: [
    "Unable to reach the server.",
    error instanceof Error ? error.message : "Request failed.",
  ],
});
