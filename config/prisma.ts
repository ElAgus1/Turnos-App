import "dotenv/config";
import { defineConfig } from "prisma/config";

import { resolveDirectUrl } from "./database-url";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node --import tsx prisma/seed.ts",
  },
  datasource: {
    url: resolveDirectUrl(),
  },
});
