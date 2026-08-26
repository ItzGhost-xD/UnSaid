import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const nextBin = require.resolve("next/dist/bin/next");
const args = process.argv.slice(2);

function readFlag(longName, shortName, fallback) {
  const longIndex = args.findIndex((arg) => arg === longName || (longName === "--hostname" && arg === "--host"));
  const shortIndex = args.indexOf(shortName);
  const index = longIndex >= 0 ? longIndex : shortIndex;
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
}

const hostname = readFlag("--hostname", "-H", "0.0.0.0");
const port = readFlag("--port", "-p", "3000");
const mode = args.includes("--strictPort") && existsSync(".next/BUILD_ID") ? "start" : "dev";

const child = spawn(process.execPath, [nextBin, mode, "--hostname", hostname, "--port", port], {
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code) => process.exit(code ?? 0));
