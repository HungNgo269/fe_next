import type { ApiResponse } from "./api-types";

export const getApiResultStatus = <T>(result: ApiResponse<T>): number | undefined =>
  result.ok ? undefined : result.error.status;

export const getApiResultMessage = <T>(
  result: ApiResponse<T>,
  fallbackMessage: string,
): string => {
  if (result.ok) {
    return fallbackMessage;
  }

  return result.error.messages[0] ?? fallbackMessage;
};

export const isUnauthenticatedStatus = (status?: number) => status === 401;

export const isForbiddenStatus = (status?: number) => status === 403;
