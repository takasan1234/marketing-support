/**
 * list-projects.ts
 * Usage: npx tsx .claude/scripts/list-projects.ts
 * Output: JSON array of { id, name, description, createdAt }
 */

const BASE_URL = "http://localhost:8080/api/v1";

async function main(): Promise<void> {
  try {
    const response = await fetch(`${BASE_URL}/projects`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const projects = (await response.json()) as Array<{
      id: string;
      name: string;
      description: string | null;
      createdAt: string;
    }>;

    const output = projects.map(({ id, name, description, createdAt }) => ({
      id,
      name,
      description,
      createdAt,
    }));

    console.log(JSON.stringify(output, null, 2));
  } catch (error) {
    console.error("Error listing projects:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
