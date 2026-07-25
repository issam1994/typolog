import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// A single jsdom environment (per the Next.js Vitest guide) keeps config simple:
// pure-logic tests run fine in jsdom, and component/DOM/localStorage tests get a
// real `window`. Async Server Components are covered by Playwright E2E instead.
export default defineConfig({
  plugins: [react()],
  resolve: {
    // Resolve the `@/*` aliases from tsconfig.json natively (Vite 6+ / Vitest 4).
    tsconfigPaths: true,
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: [
        "src/lib/**",
        "src/app/**/actions.ts",
        "src/app/**/route.ts",
        "src/proxy.ts",
      ],
    },
  },
});
