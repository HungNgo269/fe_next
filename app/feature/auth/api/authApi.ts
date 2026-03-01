import { clientGetJson, clientPostJson } from "@/app/share/utils/api";
import type {
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
} from "../types/auth";

export const login = (payload: LoginPayload) =>
  clientPostJson<LoginResponse>("/auth/login", payload, {
    skipAuthRefresh: true,
  });

export const register = (payload: RegisterPayload) =>
  clientPostJson<RegisterResponse>("/auth/register", payload, {
    skipAuthRefresh: true,
  });

export const logout = () =>
  clientGetJson<{ message: string }>("/auth/logout", {
    skipAuthRefresh: true,
  });
