import "dotenv/config";
import { spawn } from "node:child_process";

import { resolveDirectUrl } from "./neon-url.mjs";

let url;
try {
  url = resolveDirectUrl();
} catch (err) {
  console.error(err.message);
  process.exit(1);
}

console.log("Prisma Studio → conexión directa (host sin -pooler)");
console.log("Host:", new URL(url.replace(/^postgresql:/, "http:")).hostname);

spawn("npx", ["prisma", "studio", "--url", url], {
  stdio: "inherit",
  shell: true,
});
