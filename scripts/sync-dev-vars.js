#!/usr/bin/env node

// sync-dev-vars.js
// Copies specific variables from root .env.development → apps/api/.dev.vars
import { readFileSync, writeFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const KEYS_TO_COPY = [
  "DATABASE_URL",
  "BETTER_AUTH_SECRET",
  "BETTER_AUTH_URL",
  "BETTER_AUTH_TRUSTED_ORIGINS",
  "DOCS_USERNAME",
  "DOCS_PASSWORD",
];

const SOURCE = resolve(__dirname, "../.env.development");
const DEST = resolve(__dirname, "../apps/api/.dev.vars");

/** @param {string} content */
function parseEnv(content) {
  const vars = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    vars[key] = value;
  }
  return vars;
}

function run() {
  try {
    readFileSync(DEST);
    console.log(`⏭️  Already exists, skipping: ${DEST}`);
    process.exit(0);
  } catch {
    // doesn't exist — proceed
  }

  let sourceContent;
  try {
    sourceContent = readFileSync(SOURCE, "utf-8");
  } catch {
    console.error(`❌ Could not read source: ${SOURCE}`);
    process.exit(1);
  }

  const sourceVars = parseEnv(sourceContent);
  const lines = [];
  const missing = [];

  for (const key of KEYS_TO_COPY) {
    if (key in sourceVars) {
      lines.push(`${key}=${sourceVars[key]}`);
    } else {
      missing.push(key);
    }
  }

  if (missing.length) {
    console.warn(`⚠️  Missing keys (skipped): ${missing.join(", ")}`);
  }

  const output = lines.join("\n") + "\n";

  try {
    writeFileSync(DEST, output, "utf-8");
  } catch {
    console.error(`❌ Could not write to: ${DEST}`);
    process.exit(1);
  }

  console.log(`✅ Synced ${lines.length} variable(s) → ${DEST}`);
  lines.forEach((l) => console.log(`   ${l.split("=")[0]}`));
}

run();
