import { config } from "dotenv";
import { resolve } from "path";
import { z } from "zod";

// env.ts が最初に import された時点で .env を読み込む
// __dirname = apps/api/src/infrastructure/ → 4段上がるとモノレポルート
config({ path: resolve(__dirname, "../../../../.env") });
config(); // ローカル .env へのフォールバック

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(8080),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1),
  ALLOWED_ORIGINS: z.string().default("http://localhost:3000,http://localhost:3001,http://localhost:3002"),
  OPENAPI_PATH: z.string().optional(),
});

export const env = envSchema.parse(process.env);