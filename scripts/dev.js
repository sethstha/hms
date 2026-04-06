#!/usr/bin/env node
import { spawn } from "node:child_process";
import { isCancel, multiselect } from "@clack/prompts";

async function run() {
  const options = [
    { value: "dev:orgz", label: "Organization" },
    { value: "dev:admin", label: "Admin Panel" },
    { value: "dev:api", label: "API Server" },
  ];

  const selections = await multiselect({
    message: "Select servers to start:",
    required: true,
    options,
  });

  if (isCancel(selections)) process.exit(0);

  const names = selections.map((s) => s.replace("dev:", ""));
  const cmds = selections.map((s) => `pnpm run ${s}`);

  const concurrentlyCmd = [
    "concurrently",
    "-n",
    names.join(","),
    ...cmds.map((cmd) => `"${cmd}"`),
  ].join(" ");

  console.log("\n🚀 Running:", concurrentlyCmd, "\n");

  spawn(concurrentlyCmd, {
    stdio: "inherit",
    shell: true,
  });
}

run();
