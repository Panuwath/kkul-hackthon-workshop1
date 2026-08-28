function optional(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

function required(name: string): string {
  const value = optional(name);
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function databaseUrlFromParts(): string | undefined {
  const host = optional("DB_HOST");
  const database = optional("DB_DATABASE");
  const username = optional("DB_USERNAME");
  const password = optional("DB_PASSWORD");
  if (!host || !database || !username || password === undefined) return undefined;

  const port = optional("DB_PORT") ?? "5432";
  const sslMode = optional("DB_SSLMODE");
  const query = sslMode ? `?sslmode=${encodeURIComponent(sslMode)}` : "";
  return `postgresql://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${host}:${port}/${encodeURIComponent(database)}${query}`;
}

function parsePort(value: string | undefined): number {
  const port = Number(value ?? "3061");
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("APP_PORT must be an integer between 1 and 65535");
  }
  return port;
}

const appEnv = optional("APP_ENV") ?? process.env.NODE_ENV ?? "development";

export const config = {
  appEnv,
  appPort: parsePort(optional("APP_PORT")),
  databaseUrl: optional("DATABASE_URL") ?? databaseUrlFromParts(),
  authMode: optional("AUTH_MODE") ?? (appEnv === "production" ? "jwt" : "dev"),
  authJwtSecret: optional("AUTH_JWT_SECRET"),
  appBaseUrl: optional("APP_BASE_URL"),
};

export function requireDatabaseUrl(): string {
  return config.databaseUrl ?? required("DATABASE_URL or DB_HOST/DB_DATABASE/DB_USERNAME/DB_PASSWORD");
}
