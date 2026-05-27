/**
 * save-raw-data.ts
 * Usage: npx tsx .claude/scripts/save-raw-data.ts <projectId> --type <TYPE> --title "..." --content "..." [--source-url "..."] [--tags "tag1,tag2"]
 * Output: Created RawData record as JSON
 */

const BASE_URL = "http://localhost:8080/api/v1";

type RawDataType =
  | "MARKET_STATS"
  | "INDUSTRY_REPORT"
  | "NEWS"
  | "CUSTOMER_RESEARCH"
  | "SNS_ANALYTICS"
  | "SEARCH_TRENDS"
  | "LOCATION_DATA"
  | "SALES_DATA"
  | "COMPETITOR_INFO"
  | "PARTNER_HEARING"
  | "FINANCIAL_DATA"
  | "EXPERT_HEARING";

const TTL_DAYS: Record<RawDataType, number> = {
  MARKET_STATS: 180,
  INDUSTRY_REPORT: 365,
  NEWS: 30,
  CUSTOMER_RESEARCH: 180,
  SNS_ANALYTICS: 30,
  SEARCH_TRENDS: 30,
  LOCATION_DATA: 365,
  SALES_DATA: 90,
  COMPETITOR_INFO: 90,
  PARTNER_HEARING: 365,
  FINANCIAL_DATA: 365,
  EXPERT_HEARING: 365,
};

function getArg(args: string[], flag: string): string | undefined {
  const idx = args.indexOf(flag);
  if (idx !== -1 && idx + 1 < args.length) {
    return args[idx + 1];
  }
  return undefined;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error(
      'Usage: npx tsx .claude/scripts/save-raw-data.ts <projectId> --type <TYPE> --title "..." --content "..." [--source-url "..."] [--tags "tag1,tag2"]',
    );
    process.exit(1);
  }

  const projectId = args[0];
  const type = getArg(args, "--type") as RawDataType | undefined;
  const title = getArg(args, "--title");
  const content = getArg(args, "--content");
  const sourceUrl = getArg(args, "--source-url");
  const tagsRaw = getArg(args, "--tags");

  if (!projectId || !type || !title || !content) {
    console.error("Missing required arguments: projectId, --type, --title, --content");
    process.exit(1);
  }

  if (!Object.keys(TTL_DAYS).includes(type)) {
    console.error(`Invalid type: ${type}. Valid types: ${Object.keys(TTL_DAYS).join(", ")}`);
    process.exit(1);
  }

  const ttlDays = TTL_DAYS[type];
  const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000).toISOString();
  const tags = tagsRaw ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : [];

  const body: Record<string, unknown> = {
    type,
    title,
    content,
    expiresAt,
    tags,
  };
  if (sourceUrl) {
    body.sourceUrl = sourceUrl;
  }

  try {
    const response = await fetch(`${BASE_URL}/projects/${projectId}/raw-data`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const created = await response.json();
    console.log(JSON.stringify(created, null, 2));
  } catch (error) {
    console.error("Error saving raw data:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
