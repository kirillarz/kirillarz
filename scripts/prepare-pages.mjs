import { copyFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const outputDirectory = resolve("dist");
const entrypoint = resolve(outputDirectory, "index.html");
const employerDirectory = resolve(outputDirectory, "employer");

await mkdir(employerDirectory, { recursive: true });
await copyFile(entrypoint, resolve(employerDirectory, "index.html"));
await copyFile(entrypoint, resolve(outputDirectory, "404.html"));
