import { readFile, writeFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const sourceDir = path.join(projectRoot, "homepage-src");
const outputFile = path.join(projectRoot, "index.html");

async function buildHomepage() {
  const entries = await readdir(sourceDir);
  const orderedFiles = entries
    .filter((name) => name.endsWith(".html"))
    .sort((a, b) => a.localeCompare(b, "en"));

  const sections = await Promise.all(
    orderedFiles.map(async (fileName) => {
      const absolutePath = path.join(sourceDir, fileName);
      return readFile(absolutePath, "utf8");
    })
  );

  const banner = "<!-- Generated from homepage-src/*.html by tools/build-homepage.mjs. Edit the source partials, then rebuild. -->\n";
  const content = `${banner}${sections.join("\n")}`;
  await writeFile(outputFile, content, "utf8");
}

buildHomepage().catch((error) => {
  console.error("Homepage build failed:", error);
  process.exitCode = 1;
});
