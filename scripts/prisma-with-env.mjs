import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const envFile = fileURLToPath(new URL("../.env", import.meta.url));
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match || process.env[match[1]] !== undefined) continue;
    process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, "$2");
  }
}

function value(name) {
  const result = process.env[name]?.trim();
  return result || undefined;
}

function databaseUrl() {
  if (value("DATABASE_URL")) return value("DATABASE_URL");

  const host = value("DB_HOST");
  const database = value("DB_DATABASE");
  const username = value("DB_USERNAME");
  const password = process.env.DB_PASSWORD;
  if (!host || !database || !username || password === undefined) return undefined;

  const port = value("DB_PORT") ?? "5432";
  const sslMode = value("DB_SSLMODE");
  const query = sslMode ? `?sslmode=${encodeURIComponent(sslMode)}` : "";
  return `postgresql://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${host}:${port}/${encodeURIComponent(database)}${query}`;
}

const url = databaseUrl();
if (!url) {
  console.error("DATABASE_URL or DB_HOST/DB_DATABASE/DB_USERNAME/DB_PASSWORD is required");
  process.exit(1);
}

const args = process.argv.slice(2);
const command = args[0] === "seed"
  ? ["--no-install", "tsx", "prisma/seed.ts"]
  : ["--no-install", "prisma", ...args];
const executable = process.platform === "win32" ? "npx.cmd" : "npx";
execFileSync(executable, command, {
  stdio: "inherit",
  env: { ...process.env, DATABASE_URL: url },
});
