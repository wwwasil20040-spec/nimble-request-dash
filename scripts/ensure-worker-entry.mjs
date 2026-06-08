import { copyFile, mkdir, readFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";

const expectedEntry = join("dist", "server", "index.mjs");

if (existsSync(expectedEntry)) {
  process.exit(0);
}

const generatedWranglerConfig = JSON.parse(await readFile(join("dist", "server", "wrangler.json"), "utf8"));
const fallbackEntry = join("dist", "server", generatedWranglerConfig.main ?? "");

if (!existsSync(fallbackEntry)) {
  throw new Error(`Deployment entry not found. Expected ${expectedEntry}.`);
}

await mkdir(dirname(expectedEntry), { recursive: true });
await copyFile(fallbackEntry, expectedEntry);

const copied = await stat(expectedEntry);
console.log(`Created ${expectedEntry} from ${fallbackEntry} (${copied.size} bytes).`);