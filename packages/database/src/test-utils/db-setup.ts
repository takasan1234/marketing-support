import { config } from "dotenv";
import { resolve } from "node:path";
import { afterAll, afterEach, beforeAll } from "vitest";
import { createPrismaClient } from "../client";
import type { PrismaClient } from "@prisma/client";

config({ path: resolve(__dirname, "../../../../.env.test") });

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://takayatsuji@localhost:5432/marketing_support_test";

export const prisma: PrismaClient = createPrismaClient(connectionString);

beforeAll(async () => {
  await prisma.$connect();
});

afterEach(async () => {
  await prisma.frameworkRawDataLink.deleteMany();
  await prisma.frameworkEntry.deleteMany();
  await prisma.rawData.deleteMany();
  await prisma.project.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});
