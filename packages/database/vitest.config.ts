import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./src/test-utils/db-setup.ts"],
    testTimeout: 30000,
    fileParallelism: false,
  },
});
