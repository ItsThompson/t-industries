import { describe, it, expect, vi, afterEach } from "vitest";
import {
  getUptime,
  getManufacturingDate,
  getExperienceCycles,
  getFirmwareVersion,
  getSystemTime,
  getUnitSerial,
  UNIT_SERIAL,
  DIVISION,
  CLEARANCE,
  LOCATION_CODES,
  ARCHIVE_REF,
} from "./metadata";

describe("metadata", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  describe("static constants", () => {
    it("UNIT_SERIAL is TI-0510", () => {
      expect(UNIT_SERIAL).toBe("TI-0510");
    });

    it("DIVISION is DIVISION: CORE.ENG", () => {
      expect(DIVISION).toBe("DIVISION: CORE.ENG");
    });

    it("CLEARANCE is CLEARANCE: L3", () => {
      expect(CLEARANCE).toBe("CLEARANCE: L3");
    });

    it("LOCATION_CODES contains city abbreviations", () => {
      expect(LOCATION_CODES).toBe("LON / BTH / AMS");
    });

    it("ARCHIVE_REF is ARC-2019-FWD", () => {
      expect(ARCHIVE_REF).toBe("ARC-2019-FWD");
    });
  });

  describe("getUnitSerial", () => {
    it("returns the unit serial string", () => {
      expect(getUnitSerial()).toBe("TI-0510");
    });
  });

  describe("getManufacturingDate", () => {
    it("returns MFG: LOT-05-10", () => {
      expect(getManufacturingDate()).toBe("MFG: LOT-05-10");
    });
  });

  describe("getUptime", () => {
    it("returns a string matching /^\\d+\\.\\d+ YRS$/", () => {
      const result = getUptime();
      expect(result).toMatch(/^\d+\.\d+ YRS$/);
    });

    it("computes correct uptime for a known date", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-05-11T12:00:00Z"));

      const result = getUptime();
      // From 2005-05-10 to 2026-05-11 is ~21.00 years
      const numericValue = parseFloat(result.replace(" YRS", ""));
      expect(numericValue).toBeGreaterThanOrEqual(21.0);
      expect(numericValue).toBeLessThan(21.1);
    });
  });

  describe("getExperienceCycles", () => {
    it("returns correct year count from 2019", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-05-11T12:00:00Z"));

      const result = getExperienceCycles();
      expect(result).toBe("EXP.CYCLES: 7");
    });

    it("format is EXP.CYCLES: {number}", () => {
      const result = getExperienceCycles();
      expect(result).toMatch(/^EXP\.CYCLES: \d+$/);
    });
  });

  describe("getFirmwareVersion", () => {
    it("returns version based on age and current month", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-05-11T12:00:00Z"));

      const result = getFirmwareVersion();
      expect(result).toBe("FW: v21.05");
    });

    it("format is FW: v{major}.{month}", () => {
      const result = getFirmwareVersion();
      expect(result).toMatch(/^FW: v\d+\.\d{2}$/);
    });
  });

  describe("getSystemTime", () => {
    it("returns time in SYS.TIME: HH:MM:SS UTC format", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-05-11T14:30:45Z"));

      const result = getSystemTime();
      expect(result).toBe("SYS.TIME: 14:30:45 UTC");
    });

    it("format matches SYS.TIME pattern", () => {
      const result = getSystemTime();
      expect(result).toMatch(/^SYS\.TIME: \d{2}:\d{2}:\d{2} UTC$/);
    });
  });
});
