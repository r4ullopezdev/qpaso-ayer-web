// Cambia el provider del datasource de Prisma entre sqlite (dev) y postgresql (prod).
// Uso: node scripts/set-db-provider.mjs postgresql
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaPath = join(__dirname, "..", "prisma", "schema.prisma");

const target = process.argv[2];
if (!["sqlite", "postgresql"].includes(target)) {
  console.error("Uso: node scripts/set-db-provider.mjs <sqlite|postgresql>");
  process.exit(1);
}

let schema = readFileSync(schemaPath, "utf8");
schema = schema.replace(
  /provider = "(sqlite|postgresql)"(\s*\n\s*url\s*=\s*env\("DATABASE_URL"\))/,
  `provider = "${target}"$2`
);
writeFileSync(schemaPath, schema);
console.log(`Prisma datasource provider -> ${target}`);
