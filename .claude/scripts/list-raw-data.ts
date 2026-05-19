/**
 * list-raw-data.ts
 * Usage: npx tsx .claude/scripts/list-raw-data.ts <projectId> [type] [--fresh-only]
 * Output: JSON array of RawData entries with isFresh flag
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
  isFresh: boolean;
};

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("Usage: npx tsx .claude/scripts/list-raw-data.ts <projectId> [type] [--fresh-only]");
    process.exit(1);
  }

  const projectId = args[0];
  const freshOnly = args.includes("--fresh-only");
  const typeArg = args.find((a) => !a.startsWith("--") && a !== projectId);

  try {
    const params = new URLSearchParams();
    if (typeArg) {
      params.set("type", typeArg);
    }

    const url = `${BASE_URL}/projects/${projectId}/raw-data${params.toString() ? `?${params}` : ""}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const rawDataList = (await response.json()) as Array<Omit<RawDataEntry, "isFresh">>;

    const now = new Date();
    const withFreshness: RawDataEntry[] = rawDataList.map((item) => ({
      ...item,
      isFresh: item.expiresAt === null || new Date(item.expiresAt) > now,
    }));

    const filtered = freshOnly ? withFreshness.filter((item) => item.isFresh) : withFreshness;

    console.log(JSON.stringify(filtered, null, 2));
  } catch (error) {
    console.error("Error listing raw data:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
