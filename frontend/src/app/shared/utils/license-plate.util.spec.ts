import {
  isValidLicensePlate,
  normalizeLicensePlate,
} from "./license-plate.util";

describe("license-plate.util", () => {
  describe("isValidLicensePlate", () => {
    it("accepts the old format with hyphen", () => {
      expect(isValidLicensePlate("ABC-1234")).toBeTrue();
    });

    it("accepts the old format without hyphen", () => {
      expect(isValidLicensePlate("ABC1234")).toBeTrue();
    });

    it("accepts the Mercosul format", () => {
      expect(isValidLicensePlate("ABC1D23")).toBeTrue();
    });

    it("accepts lowercase input by normalizing before validating", () => {
      expect(isValidLicensePlate("abc-1234")).toBeTrue();
      expect(isValidLicensePlate("abc1d23")).toBeTrue();
    });

    it("rejects an invalid format", () => {
      expect(isValidLicensePlate("ABCD123")).toBeFalse();
      expect(isValidLicensePlate("AB-1234")).toBeFalse();
      expect(isValidLicensePlate("ABC12345")).toBeFalse();
      expect(isValidLicensePlate("")).toBeFalse();
      expect(isValidLicensePlate(null)).toBeFalse();
      expect(isValidLicensePlate(undefined)).toBeFalse();
    });
  });

  describe("normalizeLicensePlate", () => {
    it("uppercases the value", () => {
      expect(normalizeLicensePlate("abc-1234")).toBe("ABC-1234");
    });

    it("strips whitespace", () => {
      expect(normalizeLicensePlate(" abc 1234 ")).toBe("ABC1234");
    });

    it("handles null/undefined as empty string", () => {
      expect(normalizeLicensePlate(null)).toBe("");
      expect(normalizeLicensePlate(undefined)).toBe("");
    });
  });
});
