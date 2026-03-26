import { NextResponse } from "next/server";
import {
  ACCESS_COOKIE_NAME,
  AUTH_COOKIE_OPTIONS,
  REFRESH_COOKIE_NAME,
  REFRESH_COOKIE_PATH,
} from "@/app/share/constants/auth-cookies";
import { serverPostJson } from "@/app/share/utils/api.server";

type RefreshResponse = {
  message: string;
  tokens: {
    accessToken: string;
    refreshToken: string | null;
  };
};

export async function POST() {
  const result = await serverPostJson<RefreshResponse>("/auth/refresh");

  if (!result.ok) {
    const response = NextResponse.json(
      {
        message: result.error.messages[0] ?? "Unable to refresh tokens.",
        error: result.error.name,
      },
      { status: result.error.status ?? 401 },
    );

    response.cookies.delete(ACCESS_COOKIE_NAME);
    response.cookies.delete({
      name: REFRESH_COOKIE_NAME,
      path: REFRESH_COOKIE_PATH,
    });

    return response;
  }

  const response = NextResponse.json(
    { message: result.data.message },
    { status: 200 },
  );

  response.cookies.set(ACCESS_COOKIE_NAME, result.data.tokens.accessToken, {
    ...AUTH_COOKIE_OPTIONS,
    path: "/",
  });

  if (result.data.tokens.refreshToken) {
    response.cookies.set(REFRESH_COOKIE_NAME, result.data.tokens.refreshToken, {
      ...AUTH_COOKIE_OPTIONS,
      path: REFRESH_COOKIE_PATH,
    });
  }

  return response;
}
