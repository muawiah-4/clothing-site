import { defineConfig } from "vitest/config";

// Kept separate from vite.config.ts so tests don't load the site's build plugins.
export default defineConfig({
  test: {
    include: ["server/**/*.test.ts"],
    environment: "node",
  },
});
