import {
  AVATAR_FALLBACK_COLORS,
  getAvatarFallbackColor,
  getInitialsFromLastTwoWords,
} from "@/app/share/utils/avatarFallback";

describe("avatarFallback", () => {
  describe("getInitialsFromLastTwoWords", () => {
    it("returns initials from the last two words", () => {
      expect(getInitialsFromLastTwoWords("Nguyen Van An")).toBe("VA");
    });

    it("returns a single initial when only one word is provided", () => {
      expect(getInitialsFromLastTwoWords("hung")).toBe("H");
    });

    it("returns the default initials when the value is blank", () => {
      expect(getInitialsFromLastTwoWords("   ")).toBe("US");
    });
  });

  describe("getAvatarFallbackColor", () => {
    it("returns the first fallback color for blank input", () => {
      expect(getAvatarFallbackColor("   ")).toBe(AVATAR_FALLBACK_COLORS[0]);
    });

    it("returns a deterministic color for the same name", () => {
      const first = getAvatarFallbackColor("Nguyen Van An");
      const second = getAvatarFallbackColor("nguyen van an");

      expect(first).toBe(second);
      expect(AVATAR_FALLBACK_COLORS).toContain(first);
    });

    it("always maps to one of the configured fallback colors", () => {
      expect(AVATAR_FALLBACK_COLORS).toContain(
        getAvatarFallbackColor("Pham Thi Hoa"),
      );
    });
  });
});
