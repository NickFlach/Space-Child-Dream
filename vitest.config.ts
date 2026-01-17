import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["**/*.test.ts"],
    exclude: ["node_modules", ".cache"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["server/services/space-child-auth.ts", "server/space-child-auth-routes.ts"],
    },
    testTimeout: 10000,
  },
  resolve: {
    alias: {
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
});
