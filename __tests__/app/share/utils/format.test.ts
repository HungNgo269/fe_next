import {
  formatPostDate,
  formatRelativeTime,
  toText,
} from "@/app/share/utils/format";

describe("format utilities", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-03-24T12:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("toText", () => {
    it("trims strings", () => {
      expect(toText("  hello  ")).toBe("hello");
    });

    it("converts numbers and booleans", () => {
      expect(toText(42)).toBe("42");
      expect(toText(false)).toBe("false");
    });

    it("returns an empty string for unsupported values", () => {
      expect(toText({})).toBe("");
      expect(toText(undefined)).toBe("");
    });
  });

  describe("formatRelativeTime", () => {
    it("returns Now for empty or invalid values", () => {
      expect(formatRelativeTime()).toBe("Now");
      expect(formatRelativeTime("not-a-date")).toBe("Now");
    });

    it("returns minutes for recent values", () => {
      expect(formatRelativeTime("2026-03-24T11:59:20.000Z")).toBe("1m");
      expect(formatRelativeTime("2026-03-24T11:20:00.000Z")).toBe("40m");
    });

    it("returns hours and days for older values", () => {
      expect(formatRelativeTime("2026-03-24T08:00:00.000Z")).toBe("4h");
      expect(formatRelativeTime("2026-03-21T12:00:00.000Z")).toBe("3d");
    });
  });

  describe("formatPostDate", () => {
    it("omits the year for dates in the current year", () => {
      expect(formatPostDate("2026-03-05T00:00:00.000Z")).toBe("Mar 5");
    });

    it("includes the year for dates outside the current year", () => {
      expect(formatPostDate("2025-12-31T00:00:00.000Z")).toBe("Dec 31, 2025");
    });

    it("returns an empty string for empty or invalid values", () => {
      expect(formatPostDate()).toBe("");
      expect(formatPostDate("invalid-date")).toBe("");
    });
  });
});
