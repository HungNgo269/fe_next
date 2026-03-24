"use client";

import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import type { User } from "@/app/feature/post/types/api.types";

const UserContext = createContext<User | null>(null);

type UserProviderProps = {
  user: User | null;
  children: ReactNode;
};

export function UserProvider({ user, children }: UserProviderProps) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export const useUser = () => useContext(UserContext);
