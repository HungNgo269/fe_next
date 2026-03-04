import { clientGetJson } from "@/app/share/utils/api";
import { User } from "../../post/types/api.types";
import { ApiResponse } from "@/app/share/utils/api-types";

export const fetchSuggestedUsers = async (): Promise<ApiResponse<User[]>> =>
  clientGetJson<User[]>("/users");
