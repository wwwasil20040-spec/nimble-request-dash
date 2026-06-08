import { copyFile, mkdir, readdir, readFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";

const expectedEntry = join("dist", "server", "index.mjs");
const knownEntries = ["server.js", "server.mjs", "index.js"];

if (existsSync(expectedEntry)) {
  process.exit(0);
}

async function getGeneratedEntry() {
  const generatedWranglerPath = join("dist", "server", "wrangler.json");
  if (existsSync(generatedWranglerPath)) {
    const generatedWranglerConfig = JSON.parse(await readFile(generatedWranglerPath, "utf8"));
    const configuredEntry = join("dist", "server", generatedWranglerConfig.main ?? "");
    if (existsSync(configuredEntry)) return configuredEntry;
  }

  const serverFiles = existsSync(join("dist", "server")) ? await readdir(join("dist", "server")) : [];
  const knownEntry = knownEntries.map((file) => join("dist", "server", file)).find((file) => existsSync(file));
  if (knownEntry) return knownEntry;

  return serverFiles.map((file) => join("dist", "server", file)).find((file) => file.endsWith(".mjs") || file.endsWith(".js"));
}

const fallbackEntry = await getGeneratedEntry();

if (!existsSync(fallbackEntry)) {
  throw new Error(`Deployment entry not found. Expected ${expectedEntry}.`);
}

await mkdir(dirname(expectedEntry), { recursive: true });
await copyFile(fallbackEntry, expectedEntry);

const copied = await stat(expectedEntry);
console.log(`Created ${expectedEntry} from ${fallbackEntry} (${copied.size} bytes).`);