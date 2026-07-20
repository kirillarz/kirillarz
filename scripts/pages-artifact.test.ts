import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { preparePagesArtifact, verifyPagesArtifact } from "./pages-artifact.mjs";

const temporaryDirectories: string[] = [];

async function createProductionFixture() {
  const projectRoot = await mkdtemp(join(tmpdir(), "kirillarz-pages-"));
  temporaryDirectories.push(projectRoot);

  const outputDirectory = join(projectRoot, "dist");
  await mkdir(join(outputDirectory, "assets"), { recursive: true });
  await mkdir(join(outputDirectory, "og"), { recursive: true });
  await writeFile(
    join(outputDirectory, "index.html"),
    [
      '<link rel="icon" href="/favicon.png">',
      '<meta property="og:image" content="https://kirillarz.ru/og/kirill-arzamastsev.jpg">',
      '<script type="module" src="/assets/index-test.js"></script>',
    ].join("\n"),
  );
  await writeFile(join(outputDirectory, "assets", "index-test.js"), "export {};\n");
  await writeFile(join(outputDirectory, "favicon.png"), "fixture");
  await writeFile(join(outputDirectory, "og", "kirill-arzamastsev.jpg"), "fixture");

  return projectRoot;
}

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((path) => rm(path, { recursive: true })));
});

describe("Pages artifact", () => {
  it("creates static entrypoints for the employer and unknown routes", async () => {
    const projectRoot = await createProductionFixture();

    await preparePagesArtifact(projectRoot);

    await expect(verifyPagesArtifact(projectRoot)).resolves.toBeUndefined();
  });

  it("rejects the obsolete repository base path", async () => {
    const projectRoot = await createProductionFixture();
    await preparePagesArtifact(projectRoot);
    await writeFile(join(projectRoot, "dist", "assets", "index-test.js"), 'const base = "/kirillarz/";');

    await expect(verifyPagesArtifact(projectRoot)).rejects.toThrow("obsolete /kirillarz/ base path");
  });
});
