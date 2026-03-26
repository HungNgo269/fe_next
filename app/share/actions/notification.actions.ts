"use server";

import { serverPostJson } from "@/app/share/utils/api.server";
import type { ApiResponse } from "@/app/share/utils/api-types";

export const markAllNotificationsAsReadAction = async (): Promise<
  ApiResponse<{ success: boolean }>
> => serverPostJson<{ success: boolean }>("/notifications/mark-all-read", {});
