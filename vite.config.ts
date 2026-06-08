// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { existsSync } from "node:fs";
import { copyFile, mkdir, readFile, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

function ensureWranglerDeployEntry() {
  const expectedEntry = join("dist", "server", "index.mjs");

  return {
    name: "ensure-wrangler-deploy-entry",
    apply: "build" as const,
    async closeBundle() {
      if (existsSync(expectedEntry)) return;

      const generatedWranglerConfig = JSON.parse(await readFile(join("dist", "server", "wrangler.json"), "utf8")) as {
        main?: string;
      };
      const fallbackEntry = join("dist", "server", generatedWranglerConfig.main ?? "");

      if (!existsSync(fallbackEntry)) {
        throw new Error(`Deployment entry not found. Expected ${expectedEntry}.`);
      }

      await mkdir(dirname(expectedEntry), { recursive: true });
      await copyFile(fallbackEntry, expectedEntry);

      const copied = await stat(expectedEntry);
      console.log(`Created ${expectedEntry} from ${fallbackEntry} (${copied.size} bytes).`);
    },
  };
}

export default defineConfig({
  vite: {
    plugins: [ensureWranglerDeployEntry()],
  },
});
