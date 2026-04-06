#!/usr/bin/env node
import { spawn } from "node:child_process";
import { cancel, intro, isCancel, multiselect, outro } from "@clack/prompts";

async function run() {
  intro("🚀 Release");

  const options = [
    { value: "release:orgz", label: "Organization" },
    { value: "release:admin", label: "Admin Panel" },
    { value: "release:api", label: "API Server" },
  ];

  const selections = await multiselect({
    message: "Select apps to release:",
    required: true,
    options,
  });

  if (isCancel(selections)) {
    cancel("Cancelled.");
    process.exit(0);
  }

  const names = selections.map((s) => s.replace("release:", ""));
  const cmds = selections.map((s) => `pnpm run ${s}`);

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
