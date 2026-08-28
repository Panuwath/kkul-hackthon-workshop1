#!/bin/sh
set -eu

if [ -z "${DATABASE_URL:-}" ] && [ -n "${DB_HOST:-}" ]; then
  export DATABASE_URL="$(node -e '
    const value = process.env;
    for (const key of ["DB_HOST", "DB_DATABASE", "DB_USERNAME", "DB_PASSWORD"]) {
      if (!value[key]) throw new Error(`${key} is required`);
    }
    const port = value.DB_PORT || "5432";
    const ssl = value.DB_SSLMODE ? `?sslmode=${encodeURIComponent(value.DB_SSLMODE)}` : "";
    process.stdout.write(`postgresql://${encodeURIComponent(value.DB_USERNAME)}:${encodeURIComponent(value.DB_PASSWORD)}@${value.DB_HOST}:${port}/${encodeURIComponent(value.DB_DATABASE)}${ssl}`);
  ')"
fi

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  ./node_modules/.bin/prisma migrate deploy --schema ./prisma/schema.prisma
fi

exec node server.js
