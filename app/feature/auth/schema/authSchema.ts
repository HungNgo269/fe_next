import { z } from "zod";
import { GENDER_VALUES } from "../types/auth";

export const loginSchema = z.object({
  email: z.string().email("Email invalid"),
  password: z.string().min(1, "Password can not be empty"),
});

export const registerSchema = z.object({
  name: z.string().min(1, "Name can not be empty"),
  email: z.string().email("Email invalid"),
  gender: z.enum(GENDER_VALUES, {
    required_error: "Gender not valid",
    invalid_type_error: "Gender not valid",
  }),
  password: z.string().min(6, "Password length at least 6 characters"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
