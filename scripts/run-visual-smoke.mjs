import { spawn } from "node:child_process";
import { createServer as createTcpServer } from "node:net";
import { fileURLToPath } from "node:url";

import { createServer } from "vite";

const HOST = "127.0.0.1";
const HARD_TIMEOUT_MS = 45_000;
const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const configFile = fileURLToPath(new URL("../vite.config.ts", import.meta.url));
const playwrightCli = fileURLToPath(import.meta.resolve("@playwright/test/cli"));

async function getAvailablePort() {
  return new Promise((resolve, reject) => {
    const socket = createTcpServer();
    socket.once("error", reject);
    socket.listen(0, HOST, () => {
      const address = socket.address();
      if (!address || typeof address === "string") {
        socket.close();
        reject(new Error("Could not reserve a local TCP port"));
        return;
      }

      const { port } = address;
      socket.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(port);
      });
    });
  });
}

async function run() {
  let server;
  let playwrightProcess;
  let exitCode;

  const hardTimeout = setTimeout(() => {
    console.error(`[visual:smoke] Превышен общий лимит ${HARD_TIMEOUT_MS / 1000} секунд.`);
    playwrightProcess?.kill("SIGKILL");
    process.exit(124);
  }, HARD_TIMEOUT_MS);

  try {
    const port = await getAvailablePort();
    server = await createServer({
      root: projectRoot,
      configFile,
      logLevel: "error",
      server: {
        host: HOST,
        port,
        strictPort: true,
      },
    });
    await server.listen();

    const address = server.httpServer?.address();
    if (!address || typeof address === "string") {
      throw new Error("Vite did not expose a TCP port");
    }

    const baseURL = `http://${HOST}:${address.port}`;
    console.log(`[visual:smoke] Vite ready at ${baseURL}`);

    playwrightProcess = spawn(process.execPath, [playwrightCli, "test", ...process.argv.slice(2)], {
      cwd: projectRoot,
      env: {
        ...process.env,
        PW_BASE_URL: baseURL,
      },
      stdio: "inherit",
    });

    exitCode = await new Promise((resolve, reject) => {
      playwrightProcess.once("error", reject);
      playwrightProcess.once("exit", (code, signal) => {
        resolve(code ?? (signal ? 1 : 0));
      });
    });
  } catch (error) {
    console.error("[visual:smoke] Runner failed:", error);
    exitCode = 1;
  } finally {
    try {
      await server?.close();
    } catch (error) {
      console.error("[visual:smoke] Failed to close Vite:", error);
      exitCode = 1;
    }
    clearTimeout(hardTimeout);
  }

  return exitCode;
}

process.exitCode = await run();
