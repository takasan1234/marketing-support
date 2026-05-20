import { describe, expect, it } from "vitest";
import { FRAMEWORK_DEPENDENCIES } from "./dependencies";
import { FrameworkType } from "../shared/framework-type";
import { RawDataType } from "../shared/raw-data-type";

const ALL_FRAMEWORK_TYPES = Object.values(FrameworkType);
const ALL_RAW_DATA_TYPES = Object.values(RawDataType);

/** Returns downstream nodes reachable from start (for smoke tests). */
function reachableDownstream(start: FrameworkType): Set<FrameworkType> {
  const seen = new Set<FrameworkType>();
  const queue = [start];
  while (queue.length > 0) {
    const node = queue.shift()!;
    for (const next of FRAMEWORK_DEPENDENCIES[node].downstream) {
      if (!seen.has(next)) {
        seen.add(next);
        queue.push(next);
      }
    }
  }
  return seen;
}

describe("FRAMEWORK_DEPENDENCIES", () => {
  describe("completeness", () => {
    it("has an entry for every FrameworkType", () => {
      for (const type of ALL_FRAMEWORK_TYPES) {
        expect(FRAMEWORK_DEPENDENCIES[type]).toBeDefined();
      }
      expect(Object.keys(FRAMEWORK_DEPENDENCIES)).toHaveLength(ALL_FRAMEWORK_TYPES.length);
    });
  });

  describe("reference integrity", () => {
    it("upstream entries are valid FrameworkType values", () => {
      for (const type of ALL_FRAMEWORK_TYPES) {
        for (const upstream of FRAMEWORK_DEPENDENCIES[type].upstream) {
          expect(ALL_FRAMEWORK_TYPES).toContain(upstream);
        }
      }
    });

    it("downstream entries are valid FrameworkType values", () => {
      for (const type of ALL_FRAMEWORK_TYPES) {
        for (const downstream of FRAMEWORK_DEPENDENCIES[type].downstream) {
          expect(ALL_FRAMEWORK_TYPES).toContain(downstream);
        }
      }
    });

    it("subElements rawDataTypes are valid RawDataType values", () => {
      for (const type of ALL_FRAMEWORK_TYPES) {
        for (const sub of FRAMEWORK_DEPENDENCIES[type].subElements) {
          for (const rawType of sub.rawDataTypes) {
            expect(ALL_RAW_DATA_TYPES).toContain(rawType);
          }
        }
      }
    });
  });

  describe("graph shape", () => {
    it("upstream references are mirrored in downstream for primary analysis chain", () => {
      expect(FRAMEWORK_DEPENDENCIES[FrameworkType.SWOT].upstream).toContain(
        FrameworkType.PEST,
      );
      expect(FRAMEWORK_DEPENDENCIES[FrameworkType.PEST].downstream).toContain(
        FrameworkType.SWOT,
      );
    });

    it("CRM_ANALYSIS has feedback downstream to segmentation and targeting", () => {
      expect(FRAMEWORK_DEPENDENCIES[FrameworkType.CRM_ANALYSIS].downstream).toEqual(
        expect.arrayContaining([FrameworkType.SEGMENTATION, FrameworkType.TARGETING]),
      );
    });

    it("PEST reaches SWOT through downstream traversal", () => {
      const reachable = reachableDownstream(FrameworkType.PEST);
      expect(reachable.has(FrameworkType.SWOT)).toBe(true);
    });
  });

  describe("known dependency chains", () => {
    it("PEST downstream includes SWOT", () => {
      expect(FRAMEWORK_DEPENDENCIES[FrameworkType.PEST].downstream).toContain(
        FrameworkType.SWOT,
      );
    });

    it("SWOT upstream includes PEST, FIVE_FORCES, INTERNAL_ANALYSIS", () => {
      const upstream = FRAMEWORK_DEPENDENCIES[FrameworkType.SWOT].upstream;
      expect(upstream).toContain(FrameworkType.PEST);
      expect(upstream).toContain(FrameworkType.FIVE_FORCES);
      expect(upstream).toContain(FrameworkType.INTERNAL_ANALYSIS);
    });

    it("KGI_KSF_KPI upstream includes CONCEPT_SHEET", () => {
      expect(FRAMEWORK_DEPENDENCIES[FrameworkType.KGI_KSF_KPI].upstream).toContain(
        FrameworkType.CONCEPT_SHEET,
      );
    });

    it("CRM_ANALYSIS upstream includes KGI_KSF_KPI and CUSTOMER_JOURNEY", () => {
      const upstream = FRAMEWORK_DEPENDENCIES[FrameworkType.CRM_ANALYSIS].upstream;
      expect(upstream).toContain(FrameworkType.KGI_KSF_KPI);
      expect(upstream).toContain(FrameworkType.CUSTOMER_JOURNEY);
    });
  });
});
