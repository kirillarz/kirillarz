import { access, copyFile, mkdir, readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";

const REQUIRED_FILES = [
  "index.html",
  "employer/index.html",
  "404.html",
  "favicon.png",
  "og/kirill-arzamastsev.jpg",
];

async function walkFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const path = resolve(directory, entry.name);
      return entry.isDirectory() ? walkFiles(path) : path;
    }),
  );

  return files.flat();
}

export async function preparePagesArtifact(projectRoot = process.cwd()) {
  const outputDirectory = resolve(projectRoot, "dist");
  const entrypoint = resolve(outputDirectory, "index.html");
  const employerDirectory = resolve(outputDirectory, "employer");

  await mkdir(employerDirectory, { recursive: true });
  await copyFile(entrypoint, resolve(employerDirectory, "index.html"));
  await copyFile(entrypoint, resolve(outputDirectory, "404.html"));
}

export async function verifyPagesArtifact(projectRoot = process.cwd()) {
  const outputDirectory = resolve(projectRoot, "dist");

  await Promise.all(REQUIRED_FILES.map((path) => access(resolve(outputDirectory, path))));

  const indexHtml = await readFile(resolve(outputDirectory, "index.html"), "utf8");
  if (!indexHtml.includes('href="/favicon.png"')) {
    throw new Error("dist/index.html must reference /favicon.png");
  }
  if (!indexHtml.includes('content="https://kirillarz.ru/og/kirill-arzamastsev.jpg"')) {
    throw new Error("dist/index.html must reference the production Open Graph image");
  }

  const textFiles = (await walkFiles(outputDirectory)).filter((path) => /\.(?:css|html|js)$/.test(path));
  const contents = await Promise.all(textFiles.map((path) => readFile(path, "utf8")));
  const combinedOutput = contents.join("\n");

  if (/["'(=]\/kirillarz\//.test(combinedOutput)) {
    throw new Error("Pages artifact contains the obsolete /kirillarz/ base path");
  }

  const assetUrls = new Set(combinedOutput.match(/\/assets\/[A-Za-z0-9._-]+/g) ?? []);
  if (assetUrls.size === 0) {
    throw new Error("Pages artifact does not reference any production assets");
  }

  await Promise.all(
    [...assetUrls].map((assetUrl) => access(resolve(outputDirectory, assetUrl.slice(1)))),
  );
}
