/**
 * load-framework.ts
 * Usage: npx tsx .claude/scripts/load-framework.ts <projectId> <frameworkType> [--version <n>]
 * Output: JSON of the FrameworkEntry (latest if no version specified)
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
      "Usage: npx tsx .claude/scripts/load-framework.ts <projectId> <frameworkType> [--version <n>]",
    );
    process.exit(1);
  }

  const projectId = args[0];
  const frameworkType = args[1];
  const versionStr = getArg(args, "--version");

  try {
    let url: string;
    if (versionStr !== undefined) {
      const version = parseInt(versionStr, 10);
      if (isNaN(version) || version < 1) {
        console.error("Invalid version number. Must be a positive integer.");
        process.exit(1);
      }
      url = `${BASE_URL}/projects/${projectId}/frameworks/${frameworkType}/versions/${version}`;
    } else {
      url = `${BASE_URL}/projects/${projectId}/frameworks/${frameworkType}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text}`);
    }

    const entry = await response.json();
    console.log(JSON.stringify(entry, null, 2));
  } catch (error) {
    console.error("Error loading framework:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
