// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { existsSync } from "node:fs";
import { copyFile, mkdir, readdir, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

function ensureWranglerDeployEntry() {
  const expectedEntry = join("dist", "server", "index.mjs");
  const fallbackNames = ["server.js", "server.mjs", "index.js"];

  async function walk(directory: string): Promise<string[]> {
    const entries = await readdir(directory, { withFileTypes: true });
    const files: string[] = [];

    for (const entry of entries) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) {
        files.push(...(await walk(path)));
      } else {
        files.push(path);
      }
    }

    return files;
  }

  return {
    name: "ensure-wrangler-deploy-entry",
    apply: "build" as const,
    async closeBundle() {
      if (existsSync(expectedEntry)) return;

      const distFiles = existsSync("dist") ? await walk("dist") : [];
      const fallbackEntry = distFiles.find((file) => fallbackNames.some((name) => file.endsWith(name)));

      if (!fallbackEntry) {
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
