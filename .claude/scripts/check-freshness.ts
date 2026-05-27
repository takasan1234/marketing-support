/**
 * check-freshness.ts
 * Usage: npx tsx .claude/scripts/check-freshness.ts <projectId>
 * Output: JSON with { fresh: RawData[], stale: RawData[], expiringSoon: RawData[] }
 *         expiringSoon = expires within 30 days from now but not yet expired
 */

const BASE_URL = "http://localhost:8080/api/v1";

type RawDataEntry = {
  id: string;
  projectId: string;
  type: string;
  title: string;
  content: string;
  sourceUrl: string | null;
  sourceNote: string | null;
  collectedAt: string;
  expiresAt: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

type FreshnessReport = {
  fresh: RawDataEntry[];
  stale: RawDataEntry[];
  expiringSoon: RawDataEntry[];
};

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("Usage: npx tsx .claude/scripts/check-freshness.ts <projectId>");
    process.exit(1);
  }

  const projectId = args[0];

  try {
    const response = await fetch(`${BASE_URL}/projects/${projectId}/raw-data`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const rawDataList = (await response.json()) as RawDataEntry[];

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const report: FreshnessReport = {
      fresh: [],
      stale: [],
      expiringSoon: [],
    };

    for (const item of rawDataList) {
      if (item.expiresAt === null) {
        // No expiry = always fresh
        report.fresh.push(item);
        continue;
      }

      const expiresAt = new Date(item.expiresAt);

      if (expiresAt <= now) {
        report.stale.push(item);
      } else if (expiresAt <= thirtyDaysFromNow) {
        report.expiringSoon.push(item);
      } else {
        report.fresh.push(item);
      }
    }

    console.log(JSON.stringify(report, null, 2));
  } catch (error) {
    console.error("Error checking freshness:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
