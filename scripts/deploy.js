#!/usr/bin/env node
import { spawn } from "node:child_process";
import { cancel, intro, isCancel, multiselect, outro } from "@clack/prompts";

const APPS = [
  {
    value: "admin",
    label: "Admin Panel",
    filter: "@hms/admin",
  },
  {
    value: "hospital",
    label: "Hospital",
    filter: "@hms/hospital",
  },
  {
    value: "api",
    label: "API Server",
    filter: "@hms/api",
  },
];

async function run() {
  intro("🚀 Deploy");

  const selections = await multiselect({
    message: "Select apps to deploy:",
    required: true,
    options: APPS.map((a) => ({ value: a.value, label: a.label })),
  });

  if (isCancel(selections)) {
    cancel("Cancelled.");
    process.exit(0);
  }

  const selected = APPS.filter((a) => selections.includes(a.value));

  const names = selected.map((a) => a.label.replace(" ", "-").toLowerCase());
  const cmds = selected.map((a) => `pnpm --filter ${a.filter} deploy`);

  const concurrentlyCmd = [
    "concurrently",
    "-n",
    names.join(","),
    ...cmds.map((cmd) => `"${cmd}"`),
  ].join(" ");

  outro(`Running: ${concurrentlyCmd}`);

  spawn(concurrentlyCmd, {
    stdio: "inherit",
    shell: true,
  });
}

run();
