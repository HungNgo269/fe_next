import { loginSchema, registerSchema } from "@/app/feature/auth/schema/authSchema";

describe("authSchema", () => {
  describe("loginSchema", () => {
    it("accepts a valid login payload", () => {
      expect(
        loginSchema.parse({
          email: "user@example.com",
          password: "secret",
        }),
      ).toEqual({
        email: "user@example.com",
        password: "secret",
      });
    });

    it("rejects an invalid email", () => {
      const result = loginSchema.safeParse({
        email: "invalid-email",
        password: "secret",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.email).toContain(
          "email must be an email",
        );
      }
    });

    it("rejects an empty password", () => {
      const result = loginSchema.safeParse({
        email: "user@example.com",
        password: "",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.password).toContain(
          "password should not be empty",
        );
      }
    });
  });

  describe("registerSchema", () => {
    it("accepts a valid register payload", () => {
      expect(
        registerSchema.parse({
          name: "Hung Nguyen",
          email: "user@example.com",
          gender: "MALE",
          password: "secret1",
        }),
      ).toEqual({
        name: "Hung Nguyen",
        email: "user@example.com",
        gender: "MALE",
        password: "secret1",
      });
    });

    it("rejects a password shorter than six characters", () => {
      const result = registerSchema.safeParse({
        name: "Hung Nguyen",
        email: "user@example.com",
        gender: "MALE",
        password: "12345",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.password).toContain(
          "Password length at least 6 characters",
        );
      }
    });

    it("rejects an unsupported gender", () => {
      const result = registerSchema.safeParse({
        name: "Hung Nguyen",
        email: "user@example.com",
        gender: "OTHER",
        password: "secret1",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.gender).toContain(
          "Gender not valid",
        );
      }
    });
  });
});
