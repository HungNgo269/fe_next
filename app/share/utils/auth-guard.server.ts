import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

type ServerAuthGuardOptions = {
  redirectTo?: string;
};

export const requireAuth = async (options: ServerAuthGuardOptions = {}) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken");
  if (!accessToken?.value) {
    redirect(options.redirectTo ?? "/login");
  }
};
