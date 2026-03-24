import { z } from "zod";
import { GENDER_VALUES } from "../types/auth";

export const loginSchema = z.object({
  email: z.string().email("email must be an email"),
  password: z.string().min(1, "password should not be empty"),
});

export const registerSchema = z.object({
  name: z.string().min(1, "name should not be empty"),
  email: z.string().email("email must be an email"),
  gender: z.string().refine(
    (value): value is (typeof GENDER_VALUES)[number] =>
      GENDER_VALUES.includes(value as (typeof GENDER_VALUES)[number]),
    "Gender not valid",
  ),
  password: z.string().min(6, "Password length at least 6 characters"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
