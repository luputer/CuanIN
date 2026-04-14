import "dotenv/config";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { defineConfig, env } from "@prisma/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  schema: path.join(__dirname, "prisma", "schema.prisma"),
  datasource: {
    url: env("DIRECT_URL"),
  },
});