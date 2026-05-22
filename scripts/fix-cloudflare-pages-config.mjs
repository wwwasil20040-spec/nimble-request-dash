import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const generatedConfigPath = path.join(root, "dist", "client", "wrangler.json");
const sourceConfigPath = path.join(root, "wrangler.jsonc");

if (!fs.existsSync(generatedConfigPath)) {
  process.exit(0);
}

const stripJsonComments = (value) =>
  value
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|\s)\/\/.*$/gm, "$1");

const sourceConfig = fs.existsSync(sourceConfigPath)
  ? JSON.parse(stripJsonComments(fs.readFileSync(sourceConfigPath, "utf8")))
  : {};

const pagesConfig = {
  name: sourceConfig.name ?? "nimble-request-dash",
  compatibility_date: sourceConfig.compatibility_date ?? "2025-09-24",
  compatibility_flags: sourceConfig.compatibility_flags ?? ["nodejs_compat"],
  pages_build_output_dir: sourceConfig.pages_build_output_dir ?? "dist/client",
};

fs.writeFileSync(generatedConfigPath, `${JSON.stringify(pagesConfig, null, 2)}\n`);
console.log("Cleaned Cloudflare Pages wrangler.json output.");