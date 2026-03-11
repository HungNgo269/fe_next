import "server-only";

import { cookies } from "next/headers";
import type { ApiResponse } from "./api-types";
import {
  extractErrorName,
  JSON_HEADERS,
  normalizeBaseUrl,
  normalizeMessages,
  parseResponseBody,
} from "./api-helpers";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api";

type ServerRequestOptions = {
  includeAuth?: boolean;
  headers?: Record<string, string>;
  cache?: RequestCache;
  next?: NextFetchRequestConfig;
};

type NextFetchRequestConfig = {
  revalidate?: number | false;
  tags?: string[];
};

export const serverPostJson = async <T>(
  path: string,
  body?: unknown,
  options?: ServerRequestOptions,
): Promise<ApiResponse<T>> => {
  try {
    const baseUrl = normalizeBaseUrl(API_BASE_URL);
    const headers: Record<string, string> = {
      ...JSON_HEADERS,
      ...(options?.headers ?? {}),
    };

    if (options?.includeAuth !== false) {
      const cookieStore = await cookies();
      const cookieValue = cookieStore.toString();
      if (cookieValue) {
        headers.cookie = cookieValue;
      }
    }

    const response = await fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: "include",
      cache: options?.cache ?? "no-store",
      next: options?.next,
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

export const serverGetJson = async <T>(
  path: string,
  options?: ServerRequestOptions,
): Promise<ApiResponse<T>> => {
  try {
    const baseUrl = normalizeBaseUrl(API_BASE_URL);
    const headers: Record<string, string> = {
      ...JSON_HEADERS,
      ...(options?.headers ?? {}),
    };

    if (options?.includeAuth !== false) {
      const cookieStore = await cookies();
      const cookieValue = cookieStore.toString();
      if (cookieValue) {
        headers.cookie = cookieValue;
      }
    }

    const response = await fetch(`${baseUrl}${path}`, {
      method: "GET",
      headers,
      credentials: "include",
      cache: options?.cache ?? "no-store",
      next: options?.next,
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
