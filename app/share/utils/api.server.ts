import "server-only";

import { cookies } from "next/headers";
import type { ApiResponse } from "./api-types";

const API_BASE_URL = (
  process.env.INTERNAL_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:3001/api"
).replace(/\/+$/, "");

const JSON_HEADERS = {
  "Content-Type": "application/json",
} as const;

type ServerRequestOptions = {
  includeAuth?: boolean;
  headers?: Record<string, string>;
  cache?: RequestCache;
  next?: NextFetchRequestConfig;
  skipJsonContentType?: boolean;
};

type NextFetchRequestConfig = {
  revalidate?: number | false;
  tags?: string[];
};

const unwrapErrorPayload = (payload: unknown) => {
  if (!payload || typeof payload !== "object") {
    return payload;
  }

  const responsePayload = (payload as { response?: unknown }).response;
  return responsePayload ?? payload;
};

const getErrorMessages = (payload: unknown): string[] => {
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

const getErrorName = (payload: unknown): string | undefined => {
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

const readResponseBody = async (response: Response): Promise<unknown> => {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return response.json();
  }
  return response.text();
};

const getRequestHeaders = async (options?: ServerRequestOptions) => {
  const headers: Record<string, string> = options?.skipJsonContentType
    ? { ...(options?.headers ?? {}) }
    : {
        ...JSON_HEADERS,
        ...(options?.headers ?? {}),
      };

  if (options?.includeAuth === false) {
    return headers;
  }

  const cookieStore = await cookies();
  const cookieValue = cookieStore.toString();
  if (cookieValue) {
    headers.cookie = cookieValue;
  }

  return headers;
};

const runServerRequest = async <T>(
  path: string,
  method: "GET" | "POST" | "PATCH" | "DELETE",
  options?: ServerRequestOptions,
  body?: BodyInit | object,
): Promise<ApiResponse<T>> => {
  try {
    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: await getRequestHeaders(options),
      body:
        body === undefined
          ? undefined
          : isFormData
            ? body
            : JSON.stringify(body),
      credentials: "include",
      cache: options?.cache ?? "no-store",
      next: options?.next,
    });

    const payload = await readResponseBody(response);
    if (!response.ok) {
      return {
        ok: false,
        error: {
          status: response.status,
          name: getErrorName(payload),
          messages: getErrorMessages(payload),
        },
      };
    }

    return { ok: true, data: payload as T };
  } catch (error) {
    return {
      ok: false,
      error: {
        messages: [
          "Unable to reach the server.",
          error instanceof Error ? error.message : "Request failed.",
        ],
      },
    };
  }
};

export const serverPostJson = async <T>(
  path: string,
  body?: object,
  options?: ServerRequestOptions,
): Promise<ApiResponse<T>> => runServerRequest(path, "POST", options, body);

export const serverPostForm = async <T>(
  path: string,
  body: FormData,
  options?: ServerRequestOptions,
): Promise<ApiResponse<T>> =>
  runServerRequest(path, "POST", { ...options, skipJsonContentType: true }, body);

export const serverGetJson = async <T>(
  path: string,
  options?: ServerRequestOptions,
): Promise<ApiResponse<T>> => runServerRequest(path, "GET", options);

export const serverPatchJson = async <T>(
  path: string,
  body?: object,
  options?: ServerRequestOptions,
): Promise<ApiResponse<T>> => runServerRequest(path, "PATCH", options, body);

export const serverDeleteJson = async <T>(
  path: string,
  options?: ServerRequestOptions,
): Promise<ApiResponse<T>> => runServerRequest(path, "DELETE", options);
