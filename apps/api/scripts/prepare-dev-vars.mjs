import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const apiDir = path.resolve(__dirname, "..");
const repoRoot = path.resolve(apiDir, "..", "..");
const repoEnvPath = path.resolve(repoRoot, ".env");
const devVarsPath = path.resolve(apiDir, ".dev.vars");

if (existsSync(devVarsPath)) {
  process.exit(0);
}

const parseEnv = (content) => {
  const entries = {};
  const lines = content.split(/\r?\n/g);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const equalsIndex = trimmed.indexOf("=");
    if (equalsIndex <= 0) {
      continue;
    }

    const key = trimmed.slice(0, equalsIndex).trim();
    const value = trimmed.slice(equalsIndex + 1).trim();
    entries[key] = value;
  }

  return entries;
};

const repoEnvEntries = existsSync(repoEnvPath)
  ? parseEnv(readFileSync(repoEnvPath, "utf8"))
  : {};

const databaseUrl = repoEnvEntries.DATABASE_URL ?? "";
if (!databaseUrl) {
  console.error(
    "[api] Missing DATABASE_URL in root .env; cannot create apps/api/.dev.vars automatically.",
  );
  process.exit(1);
}

const betterAuthSecret =
  repoEnvEntries.BETTER_AUTH_SECRET ?? "better-auth-dev-secret-change-me";
const betterAuthUrl = repoEnvEntries.BETTER_AUTH_URL ?? "http://localhost:8787";
const betterAuthTrustedOrigins =
  repoEnvEntries.BETTER_AUTH_TRUSTED_ORIGINS ?? "http://localhost:5173,http://localhost:5174";

const output = [
  `DATABASE_URL=${databaseUrl}`,
  `BETTER_AUTH_SECRET=${betterAuthSecret}`,
  `BETTER_AUTH_URL=${betterAuthUrl}`,
  `BETTER_AUTH_TRUSTED_ORIGINS=${betterAuthTrustedOrigins}`,
  "",
].join("\n");

writeFileSync(devVarsPath, output, "utf8");
console.log("[api] Created apps/api/.dev.vars from root .env for wrangler dev.");
