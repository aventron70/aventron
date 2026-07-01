import { copyFileSync, cpSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { extname, resolve } from "node:path";

const projectRoot = resolve(".");
const distDir = resolve("dist");
const indexPath = resolve(distDir, "index.html");
const notFoundPath = resolve(distDir, "404.html");

function copyRootFile(fileName) {
  const sourcePath = resolve(projectRoot, fileName);

  if (!existsSync(sourcePath)) {
    return;
  }

  mkdirSync(distDir, { recursive: true });
  copyFileSync(sourcePath, resolve(distDir, fileName));
}

function copyDirectory(directoryName) {
  const sourcePath = resolve(projectRoot, directoryName);

  if (!existsSync(sourcePath)) {
    return;
  }

  cpSync(sourcePath, resolve(distDir, directoryName), {
    recursive: true,
    force: true,
  });
}

if (existsSync(indexPath)) {
  copyFileSync(indexPath, notFoundPath);
}

const staticHtmlPages = readdirSync(projectRoot).filter((fileName) => {
  return extname(fileName).toLowerCase() === ".html" && fileName !== "index.html";
});

staticHtmlPages.forEach(copyRootFile);

["styles.css", "home.css", "script.js"].forEach(copyRootFile);
["assets", "ar", "en", "privacy-policy"].forEach(copyDirectory);
