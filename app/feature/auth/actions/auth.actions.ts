"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import {
  ACCESS_COOKIE_NAME,
  AUTH_COOKIE_OPTIONS,
  REFRESH_COOKIE_NAME,
  REFRESH_COOKIE_PATH,
} from "@/app/share/constants/auth-cookies";
import {
  serverGetJson,
  serverPostJson,
} from "@/app/share/utils/api.server";
import type { FormActionState } from "@/app/share/types/action-state";
import type { ApiResponse } from "@/app/share/utils/api-types";
import type {
  LoginPayload,
  LoginResponse,
  RegisterCodeRequestPayload,
  RegisterCodeRequestResponse,
  RegisterPayload,
  RegisterResponse,
} from "../types/auth";

const setAuthCookies = async (input: {
  accessToken: string;
  refreshToken: string;
}) => {
  const cookieStore = await cookies();

  cookieStore.set(ACCESS_COOKIE_NAME, input.accessToken, {
    ...AUTH_COOKIE_OPTIONS,
    path: "/",
  });

  cookieStore.set(REFRESH_COOKIE_NAME, input.refreshToken, {
    ...AUTH_COOKIE_OPTIONS,
    path: REFRESH_COOKIE_PATH,
  });
};

const clearAuthCookies = async () => {
  const cookieStore = await cookies();

  cookieStore.delete(ACCESS_COOKIE_NAME);
  cookieStore.delete({
    name: REFRESH_COOKIE_NAME,
    path: REFRESH_COOKIE_PATH,
  });
};

export const requestRegisterCodeAction = async (
  payload: RegisterCodeRequestPayload,
): Promise<ApiResponse<RegisterCodeRequestResponse>> =>
  serverPostJson<RegisterCodeRequestResponse>(
    "/auth/register/request-code",
    payload,
    { includeAuth: false },
  );

export const registerAction = async (
  payload: RegisterPayload,
): Promise<ApiResponse<RegisterResponse>> => {
  const response = await serverPostJson<RegisterResponse>(
    "/auth/register",
    payload,
    { includeAuth: false },
  );

  if (response.ok) {
    revalidatePath("/login");
  }

  return response;
};

export const loginAction = async (
  payload: LoginPayload,
): Promise<ApiResponse<LoginResponse>> => {
  const response = await serverPostJson<LoginResponse>("/auth/login", payload, {
    includeAuth: false,
  });

  if (response.ok) {
    await setAuthCookies(response.data.tokens);
    revalidatePath("/", "layout");
  }

  return response;
};

export const logoutAction = async (): Promise<ApiResponse<{ message: string }>> => {
  const response = await serverGetJson<{ message: string }>("/auth/logout");
  await clearAuthCookies();
  revalidatePath("/", "layout");
  return response;
};

export const logoutFormAction = async (): Promise<FormActionState> => {
  const response = await logoutAction();

  return {
    success: response.ok,
    error: response.ok
      ? null
      : (response.error.messages[0] ?? "Unable to log out."),
  };
};
