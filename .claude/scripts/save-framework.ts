/**
 * save-framework.ts
 * Usage: npx tsx .claude/scripts/save-framework.ts <projectId> <frameworkType> --data '{"key":"value"}' [--note "..."] [--new-version]
 * Output: Saved FrameworkEntry as JSON
 *
 * --new-version: Create a new version (POST /versions) instead of upserting the current latest (PUT)
 */

const BASE_URL = "http://localhost:8080/api/v1";

function getArg(args: string[], flag: string): string | undefined {
  const idx = args.indexOf(flag);
  if (idx !== -1 && idx + 1 < args.length) {
    return args[idx + 1];
  }
  return undefined;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error(
      "Usage: npx tsx .claude/scripts/save-framework.ts <projectId> <frameworkType> --data '{...}' [--note \"...\"] [--new-version]",
    );
    process.exit(1);
  }

  const projectId = args[0];
  const frameworkType = args[1];
  const dataRaw = getArg(args, "--data");
  const note = getArg(args, "--note");
  const newVersion = args.includes("--new-version");

  if (!dataRaw) {
    console.error("Missing required argument: --data");
    process.exit(1);
  }

  let data: unknown;
  try {
    data = JSON.parse(dataRaw);
  } catch {
    console.error("Invalid JSON provided to --data");
    process.exit(1);
  }

  const body: Record<string, unknown> = { data };
  if (note) {
    body.note = note;
  }

  try {
    let url: string;
    let method: string;

    if (newVersion) {
      url = `${BASE_URL}/projects/${projectId}/frameworks/${frameworkType}/versions`;
      method = "POST";
    } else {
      url = `${BASE_URL}/projects/${projectId}/frameworks/${frameworkType}`;
      method = "PUT";
    }

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text}`);
    }

    const saved = await response.json();
    console.log(JSON.stringify(saved, null, 2));
  } catch (error) {
    console.error("Error saving framework:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
