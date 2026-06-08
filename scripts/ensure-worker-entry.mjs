import { copyFile, mkdir, readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";

const expectedEntry = join("dist", "server", "index.mjs");
const fallbackNames = ["server.js", "server.mjs", "index.js"];

if (existsSync(expectedEntry)) {
  process.exit(0);
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

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

const distFiles = existsSync("dist") ? await walk("dist") : [];
const fallbackEntry = distFiles.find((file) => fallbackNames.some((name) => file.endsWith(name)));

if (!fallbackEntry) {
  throw new Error(`Deployment entry not found. Expected ${expectedEntry}.`);
}

await mkdir(dirname(expectedEntry), { recursive: true });
await copyFile(fallbackEntry, expectedEntry);

const copied = await stat(expectedEntry);
console.log(`Created ${expectedEntry} from ${fallbackEntry} (${copied.size} bytes).`);