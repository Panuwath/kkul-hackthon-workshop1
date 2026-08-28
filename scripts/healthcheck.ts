export {};

const port = process.env.APP_PORT ?? "3061";
const url = `http://127.0.0.1:${port}/pema/api/health`;

const response = await fetch(url);
if (!response.ok) {
  throw new Error(`Health check failed with HTTP ${response.status}`);
}

console.log(`Health check passed: ${url}`);
