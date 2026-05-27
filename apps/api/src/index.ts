import { config } from "dotenv";
import { resolve } from "path";
// Load root .env (monorepo root is 2 levels up from apps/api)
config({ path: resolve(__dirname, "../../../.env") });
config(); // fallback to local .env if present
import { createApp } from "./composition";
import { env } from "./infrastructure";
import { setupSwagger } from "./infrastructure";

const bootstrap = async () => {
  const app = createApp();

  await setupSwagger(app);

  app.listen(env.PORT, () => {
    console.log(`API Server listening on port ${env.PORT}`);
  });
};

bootstrap().catch((error) => {
  console.error("Error starting server", error);
  process.exit(1);
});

